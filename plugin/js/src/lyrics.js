function timeToSeconds(time) {
    const [minutes, seconds] = time.split(":");
    return Number((Number(minutes) * 60 + Number(seconds)).toFixed(2));
}


function parseLyric(lyricText) {
    const result = [];
    try {
        const lines = lyricText.split("\n");
        for (const line of lines) {
            if (line[0] == "[") {
                const timeEndIndex = line.indexOf("]");
                if (timeEndIndex === -1) continue;
                const lyric = {
                    time: timeToSeconds(line.slice(1, timeEndIndex)),
                    text: line.slice(timeEndIndex + 1)
                };
                if (lyric.text.trim()) {
                    result.push(lyric);
                }
            }
        }
    } catch (error) {
        console.error("[Taskbar Lyrics] Error parsing lyrics:", error);
    }
    return result;
}


async function getLyric(id) {
    try {
        const response = await fetch(`https://music.163.com/api/song/lyric/v1?tv=0&lv=0&rv=0&kv=0&yv=0&ytv=0&yrv=0&cp=false&id=${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch lyrics: ${response.status} ${response.statusText}`);
        }
        const lyric = await response.json();
        return parseLyric(lyric.lrc.lyric);
    } catch (error) {
        console.error("[Taskbar Lyrics] Error fetching lyrics:", error);
        return [];
    }
}


async function getDetail(id) {
    try {
        const response = await fetch(`https://music.163.com/api/song/detail?ids=[${id}]`);
        if (!response.ok) {
            throw new Error(`Failed to fetch song details: ${response.status} ${response.statusText}`);
        }
        const detail = await response.json();
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
        try {
            channel.registerCall("audioplayer.onLoad", this.onLoad.bind(this));
            channel.registerCall("audioplayer.onPlayProgress", this.onPlayProgress.bind(this));
        } catch (error) {
            console.error("[Taskbar Lyrics] Failed to register events:", error);
        }
    }

    async onLoad(...args) {
        try {
            this.isLoaded = false;
            this.lastIndex = -1;
            if (!args || !args[0]) {
                return;
            }
            const id = args[0].split("_")[0];
            const [detail, lyric] = await Promise.all([getDetail(id), getLyric(id)]);
            this.currentLyric = [
                { time: -1, text: detail.name },
                { time: -1, text: detail.artists }
            ].concat(lyric);
            this.isLoaded = true;
            this.callback?.(this.currentLyric, 0);
        } catch (error) {
            console.error("[Taskbar Lyrics] Error in onLoad:", error);
            this.currentLyric = [
                { time: -1, text: "Error loading song" },
                { time: -1, text: error.message || "Unknown error" }
            ];
            this.isLoaded = true;
        }
    }

    async onPlayProgress(...args) {
        try {
            if (!this.isLoaded || this.currentLyric.length <= 2) {
                return;
            }
            const currentTime = args[1];
            const nextIndex = this.currentLyric.findIndex(lyric => lyric.time >= currentTime);
            const currentIndex = (nextIndex <= -1 ? this.currentLyric.length : nextIndex) - 1;
            if (this.lastIndex != currentIndex) {
                this.lastIndex = currentIndex;
                this.callback?.(this.currentLyric, currentIndex);
            }
        } catch (error) {
            console.error("[Taskbar Lyrics] Error in onPlayProgress:", error);
        }
    }
}
