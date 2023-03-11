plugin.onLoad(async () => {
    const TaskbarLyricsAPI = this.index.TaskbarLyricsAPI;
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
        TaskbarLyricsAPI.lyrics({
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

        if (parsedLyric) {
            let nextIndex = parsedLyric.findIndex(item => item.time > playProgress);
            nextIndex = (nextIndex <= -1) ? parsedLyric.length : nextIndex;

            if (nextIndex != currentIndex) {
                const currentLyric = parsedLyric[nextIndex - 1] ?? "";
                const nextLyric = parsedLyric[nextIndex] ?? "";

                TaskbarLyricsAPI.lyrics({
                    "basic": currentLyric?.originalLyric,
                    // "extra": currentLyric?.translatedLyric
                    "extra": nextLyric?.originalLyric
                });

                currentIndex = nextIndex;
            }
        }
    }


    libsonginfo.addEventListener("audio-id-updated", audio_id_updated);
    libsonginfo.addEventListener("play-progress-updated", play_progress_updated);
});