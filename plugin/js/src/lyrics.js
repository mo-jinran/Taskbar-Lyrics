function timeToSeconds(time) {
    const [minutes, seconds] = time.split(":");
    return Number((Number(minutes) * 60 + Number(seconds)).toFixed(2));
}


const REQUEST_TIMEOUT_MS = 8000;
const REQUEST_ATTEMPTS = 2;


async function fetchJson(url, signal) {
    let lastError;
    for (let attempt = 0; attempt < REQUEST_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const abort = () => controller.abort();
        const timeout = setTimeout(abort, REQUEST_TIMEOUT_MS);
        signal?.addEventListener("abort", abort, {once: true});
        try {
            const response = await fetch(url, {signal: controller.signal});
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            lastError = error;
            if (signal?.aborted) {
                throw error;
            }
        } finally {
            clearTimeout(timeout);
            signal?.removeEventListener("abort", abort);
        }
    }
    throw lastError ?? new Error("Request failed");
}


export function parseLyric(lyricText) {
    const result = [];
    try {
        const lines = lyricText.split("\n");
        for (const line of lines) {
            const timestamps = [...line.matchAll(/\[(\d{1,3}:\d{1,2}(?:\.\d{1,3})?)\]/g)];
            if (!timestamps.length) {
                continue;
            }
            const text = line.slice(timestamps[timestamps.length - 1].index + timestamps[timestamps.length - 1][0].length).trim();
            if (!text) {
                continue;
            }
            for (const timestamp of timestamps) {
                result.push({
                    time: timeToSeconds(timestamp[1]),
                    text
                });
            }
        }
    } catch (error) {
        console.error("[Taskbar Lyrics] Error parsing lyrics:", error);
    }
    return result.sort((left, right) => left.time - right.time);
}


export function mergeLyrics(originalLyrics, translatedLyrics) {
    let translationIndex = 0;
    return originalLyrics.map(original => {
        while (
            translationIndex + 1 < translatedLyrics.length &&
            Math.abs(translatedLyrics[translationIndex + 1].time - original.time) <=
                Math.abs(translatedLyrics[translationIndex].time - original.time)
        ) {
            translationIndex++;
        }
        const translation = translatedLyrics[translationIndex];
        return {
            time: original.time,
            text: original.text,
            translation: translation && Math.abs(translation.time - original.time) <= 0.75
                ? translation.text
                : ""
        };
    });
}


async function getLyric(id, signal) {
    try {
        const lyric = await fetchJson(
            `https://music.163.com/api/song/lyric/v1?tv=-1&lv=-1&rv=0&kv=0&yv=0&ytv=0&yrv=0&cp=false&id=${id}`,
            signal
        );
        const originalLyrics = parseLyric(lyric.lrc?.lyric ?? "");
        const translatedLyrics = parseLyric(lyric.tlyric?.lyric ?? "");
        return mergeLyrics(originalLyrics, translatedLyrics);
    } catch (error) {
        console.error("[Taskbar Lyrics] Error fetching lyrics:", error);
        return [];
    }
}


async function getDetail(id, signal) {
    try {
        const detail = await fetchJson(
            `https://music.163.com/api/song/detail?ids=[${id}]`,
            signal
        );
        return {
            name: detail.songs[0].name,
            artists: detail.songs[0].artists?.map(value => value.name).join(" / ")
        };
    } catch (error) {
        console.error("[Taskbar Lyrics] Error fetching song details:", error);
        return {
            name: "Unknown",
            artists: "Unknown"
        };
    }
}


export class LyricObserver {
    constructor(callback) {
        this.callback = callback;
        this.isLoaded = false;
        this.lastIndex = -1;
        this.currentLyric = [];
        this.hasTranslation = false;
        this.loadGeneration = 0;
        this.loadController = null;
        try {
            channel.registerCall("audioplayer.onLoad", this.onLoad.bind(this));
            channel.registerCall("audioplayer.onPlayProgress", this.onPlayProgress.bind(this));
        } catch (error) {
            console.error("[Taskbar Lyrics] Failed to register events:", error);
        }
    }

    async onLoad(...args) {
        const rawId = args?.[0];
        if (typeof rawId !== "string") {
            return;
        }
        const id = rawId.split("_")[0];
        if (!/^\d+$/.test(id)) {
            return;
        }

        this.loadController?.abort();
        const controller = new AbortController();
        const generation = ++this.loadGeneration;
        this.loadController = controller;
        this.isLoaded = false;
        this.lastIndex = -1;
        try {
            const [detail, lyric] = await Promise.all([
                getDetail(id, controller.signal),
                getLyric(id, controller.signal)
            ]);
            if (generation !== this.loadGeneration) {
                return;
            }
            this.currentLyric = [
                { time: -1, text: detail.name, translation: detail.artists }
            ].concat(lyric);
            this.hasTranslation = lyric.some(item => item.translation?.trim());
            this.isLoaded = true;
            this.callback?.(this.currentLyric, 0, this.hasTranslation);
        } catch (error) {
            if (generation !== this.loadGeneration) {
                return;
            }
            console.error("[Taskbar Lyrics] Error in onLoad:", error);
            this.currentLyric = [
                {
                    time: -1,
                    text: "Error loading song",
                    translation: error.message || "Unknown error"
                }
            ];
            this.isLoaded = true;
            this.hasTranslation = false;
            this.callback?.(this.currentLyric, 0, false);
        } finally {
            if (generation === this.loadGeneration) {
                this.loadController = null;
            }
        }
    }

    onPlayProgress(...args) {
        try {
            if (!this.isLoaded || this.currentLyric.length <= 1) {
                return;
            }
            const currentTime = Number(args[1]);
            if (!Number.isFinite(currentTime)) {
                return;
            }
            let low = 0;
            let high = this.currentLyric.length;
            while (low < high) {
                const middle = Math.floor((low + high) / 2);
                if (this.currentLyric[middle].time <= currentTime) {
                    low = middle + 1;
                } else {
                    high = middle;
                }
            }
            const currentIndex = Math.max(0, low - 1);
            if (this.lastIndex != currentIndex) {
                this.lastIndex = currentIndex;
                this.callback?.(this.currentLyric, currentIndex, this.hasTranslation);
            }
        } catch (error) {
            console.error("[Taskbar Lyrics] Error in onPlayProgress:", error);
        }
    }
}
