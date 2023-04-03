"use strict";


plugin.onLoad(async () => {
    const TaskbarLyricsAPI = this.api.TaskbarLyricsAPI;
    const pluginConfig = this.base.pluginConfig;
    const liblyric = loadedPlugins.liblyric;


    let observer = null;
    let parsedLyric = null;
    let currentIndex = 0;
    let musicId = 0;


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

                const savedOptions = pluginConfig.get("extra_show")["saved_options"];
                for (let i = 0; i < savedOptions.length; i++) {
                    if (savedOptions[i].value == "lyrics") {
                        lyrics.basic = mutation.addedNodes[0].firstChild.textContent;
                        lyrics.extra = "";
                        break;
                    } else if (savedOptions[i].value == "title_lyrics") {
                        if (betterncm.ncm.getPlaying()?.title) {
                            lyrics.basic = betterncm.ncm.getPlaying()?.title;
                            lyrics.extra = mutation.addedNodes[0].firstChild.textContent;
                            break;
                        } else {
                            continue;
                        }
                    } else if (savedOptions[i].value == "artist_title_lyrics") {
                        let song = betterncm.ncm.getPlayingSong()
                        if (song && song?.data?.artists && song?.data?.name) {
                            lyrics.basic = song.data.artists.map(element => element.name).join("/") + " - " + song.data.name;
                            lyrics.extra = mutation.addedNodes[0].firstChild.textContent;
                            break;
                        } else {
                            continue;
                        }
                    } else if (savedOptions[i].value == "lyrics_translation" || savedOptions[i].value == "lyrics_romanization") {
                        if (mutation?.addedNodes[2]?.firstChild) {
                            break;
                        } else {
                            continue;
                        }
                    }
                }

                TaskbarLyricsAPI.lyric(lyrics);
            }
        });
        observer.observe(mLyric, { childList: true, subtree: true });
    }


    // 音乐ID发生变化时
    async function play_load() {
        parsedLyric = null;

        // 获取歌曲信息
        const playingSong = betterncm.ncm.getPlayingSong();
        musicId = playingSong.data.id ?? 0;
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
    async function play_progress(_, time) {
        const adjust = Number(pluginConfig.get("lyrics")["adjust"]);
        if (parsedLyric) {
            let nextIndex = parsedLyric.findIndex(item => item.time > (time + adjust) * 1000);
            nextIndex = (nextIndex <= -1) ? parsedLyric.length : nextIndex;

            if (nextIndex != currentIndex) {
                const currentLyric = parsedLyric[nextIndex - 1] ?? "";
                const nextLyric = parsedLyric[nextIndex] ?? "";

                const lyrics = {
                    "basic": currentLyric?.originalLyric ?? "",
                    "extra": ""
                };

                const savedOptions = pluginConfig.get("extra_show")["saved_options"];
                for (let i = 0; i < savedOptions.length; i++) {
                    if (savedOptions[i].value == "lyrics") {
                        lyrics.basic = currentLyric?.originalLyric ?? "";
                        lyrics.extra = "";
                        break;
                    } else if (savedOptions[i].value == "lyrics_lyrics") {
                        lyrics.basic = currentLyric?.originalLyric ?? "";
                        lyrics.extra = currentLyric?.translatedLyric ?? nextLyric?.originalLyric ?? "";
                        break;
                    } else if (savedOptions[i].value == "title_lyrics") {
                        if (betterncm.ncm.getPlaying()?.title) {
                            lyrics.basic = betterncm.ncm.getPlaying()?.title;
                            lyrics.extra = currentLyric?.originalLyric ?? "";
                            break;
                        } else {
                            continue;
                        }
                    } else if (savedOptions[i].value == "artist_title_lyrics") {
                        let song = betterncm.ncm.getPlayingSong()
                        if (song && song?.data?.artists && song?.data?.name) {
                            lyrics.basic = song.data.artists.map(element => element.name).join("/") + " - " + song.data.name;
                            lyrics.extra = currentLyric?.originalLyric ?? "";
                            break;
                        } else {
                            continue;
                        }
                    } else if (savedOptions[i].value == "lyrics_translation") {
                        if (currentLyric?.translatedLyric) {
                            lyrics.extra = currentLyric?.translatedLyric
                            break;
                        } else {
                            continue;
                        }
                    } else if (savedOptions[i].value == "lyrics_romanization") {
                        if (currentLyric?.romanLyric) {
                            lyrics.extra = currentLyric?.romanLyric
                            break;
                        } else {
                            continue;
                        }
                    }
                }

                TaskbarLyricsAPI.lyric(lyrics);
                currentIndex = nextIndex;
            }
        }
    }


    // 开始获取歌词
    function startGetLyric() {
        const config = pluginConfig.get("lyrics");
        if (config["retrieval_method"]["value"] == "0") {
            legacyNativeCmder.appendRegisterCall("Load", "audioplayer", play_load);
            legacyNativeCmder.appendRegisterCall("PlayProgress", "audioplayer", play_progress);
            const playingSong = betterncm.ncm.getPlayingSong();
            if (playingSong && playingSong.data.id != musicId) {
                play_load();
            }
        }
        if (config["retrieval_method"]["value"] == "1") {
            watchLyricsChange();
        }
    }


    // 停止获取歌词
    function stopGetLyric() {
        const config = pluginConfig.get("lyrics");
        if (config["retrieval_method"]["value"] == "0") {
            legacyNativeCmder.removeRegisterCall("Load", "audioplayer", play_load);
            legacyNativeCmder.removeRegisterCall("PlayProgress", "audioplayer", play_progress);
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
