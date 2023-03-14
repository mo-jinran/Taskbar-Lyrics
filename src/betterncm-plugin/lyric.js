"use strict";


plugin.onLoad(async () => {
    const TaskbarLyricsAPI = this.api.TaskbarLyricsAPI;
    const defaultConfig = this.base.defaultConfig;
    const libsonginfo = loadedPlugins.libsonginfo.injects[0];
    const liblyric = loadedPlugins.liblyric;


    let parsedLyric = null;
    let currentIndex = 0;


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


    function startGetLyric() {
        libsonginfo.addEventListener("audio-id-updated", audio_id_updated);
        libsonginfo.addEventListener("play-progress-updated", play_progress_updated);
    }


    function stopGetLyric() {
        libsonginfo.removeEventListener("audio-id-updated", audio_id_updated);
        libsonginfo.removeEventListener("play-progress-updated", play_progress_updated);
    }


    this.lyric = {
        startGetLyric,
        stopGetLyric
    }
});