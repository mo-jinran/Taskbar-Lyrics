"use strict";


plugin.onLoad(async () => {
    const TaskbarLyricsAPI = this.api.TaskbarLyricsAPI;
    const defaultConfig = this.base.defaultConfig;
    const libsonginfo = loadedPlugins.libsonginfo.injects[0];
    const liblyric = loadedPlugins.liblyric;


    let observer = null;
    let parsedLyric = null;
    let currentIndex = 0;


    // 监视软件内歌词变动
    const watchLyricsChange = async () => {
        const mLyric = await betterncm.utils.waitForElement("#x-g-mn .m-lyric");
        observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                let lyrics = {
                    basic: "",
                    extra: ""
                };

                if (mutation.addedNodes[2]) {
                    lyrics.basic = mutation.addedNodes[0].firstChild.textContent;
                    lyrics.extra = mutation.addedNodes[2].firstChild ? mutation.addedNodes[2].firstChild.textContent : "";
                } else {
                    lyrics.basic = mutation.addedNodes[0].textContent;
                }

                TaskbarLyricsAPI.lyric(lyrics);
            }
        });
        observer.observe(mLyric, { childList: true, subtree: true });
    }


    // 音乐ID发生变化时
    async function audio_id_updated() {
        parsedLyric = null;

        // 获取歌曲信息
        const playingSong = betterncm.ncm.getPlayingSong();
        const musicId = playingSong.data.id ?? 0;
        const name = playingSong.data.name ?? "";
        const artists = playingSong.data.artists ?? "";

        // 解析歌手名称
        let artistName = "";
        artists.forEach(item => artistName += ` / ${item.name}`);
        artistName = artistName.slice(3);

        // 发送歌曲信息
        TaskbarLyricsAPI.lyric({
            "basic": name,
            "extra": artistName
        });

        // 解析歌词
        const lyricData = await liblyric.getLyricData(musicId);

        parsedLyric = liblyric.parseLyric(
            lyricData?.lrc?.lyric ?? "",
            lyricData?.tlyric?.lyric ?? "",
            lyricData?.romalrc?.lyric ?? ""
        ).filter(item => item.originalLyric != "");

        currentIndex = 0;
    }


    // 音乐进度发生变化时
    async function play_progress_updated(event) {
        const playProgress = event.target.playProgress * 1000;
        const adjust = Number(plugin.getConfig("lyrics", defaultConfig.lyrics)["adjust"]) * 1000;
        if (parsedLyric) {
            let nextIndex = parsedLyric.findIndex(item => item.time > playProgress + adjust);
            nextIndex = (nextIndex <= -1) ? parsedLyric.length : nextIndex;

            if (nextIndex != currentIndex) {
                const currentLyric = parsedLyric[nextIndex - 1] ?? "";
                const nextLyric = parsedLyric[nextIndex] ?? "";

                const lyrics = {
                    "basic": currentLyric?.originalLyric ?? "",
                    "extra": currentLyric?.translatedLyric ?? nextLyric?.originalLyric ?? ""
                };

                const extra_show_value = plugin.getConfig("lyrics", defaultConfig.lyrics)["extra_show"]["value"];
                switch (extra_show_value) {
                    case "0": {
                        lyrics.extra = "";
                    } break;

                    case "1": {
                        lyrics.extra = nextLyric?.originalLyric ?? "";
                    } break;

                    case "2": {
                        lyrics.extra = currentLyric?.translatedLyric
                            ?? nextLyric?.originalLyric
                            ?? "";
                    } break;

                    case "3": {
                        lyrics.extra = currentLyric?.romanLyric
                            ?? currentLyric?.translatedLyric
                            ?? nextLyric?.originalLyric
                            ?? "";
                    } break;

                    default: {
                        lyrics.extra = currentLyric?.translatedLyric
                            ?? nextLyric?.originalLyric
                            ?? ""
                    } break;
                }

                TaskbarLyricsAPI.lyric(lyrics);
                currentIndex = nextIndex;
            }
        }
    }


    // 开始获取歌词
    function startGetLyric() {
        const config = plugin.getConfig("lyrics", defaultConfig.lyrics);
        if (config["retrieval_method"]["value"] == "0") {
            libsonginfo.addEventListener("audio-id-updated", audio_id_updated);
            libsonginfo.addEventListener("play-progress-updated", play_progress_updated);
        }
        if (config["retrieval_method"]["value"] == "1") {
            watchLyricsChange();
        }
    }


    // 停止获取歌词
    function stopGetLyric() {
        const config = plugin.getConfig("lyrics", defaultConfig.lyrics);
        if (config["retrieval_method"]["value"] == "0") {
            libsonginfo.removeEventListener("audio-id-updated", audio_id_updated);
            libsonginfo.removeEventListener("play-progress-updated", play_progress_updated);
        }
        if (config["retrieval_method"]["value"] == "1") {
            if (observer) {
                observer.disconnect();
                observer = null;
            }
        }
    }


    this.lyric = {
        startGetLyric,
        stopGetLyric
    }
});