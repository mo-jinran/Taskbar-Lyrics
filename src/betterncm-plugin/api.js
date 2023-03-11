"use strict";


plugin.onLoad(async () => {
    const TaskbarLyricsPort = BETTERNCM_API_PORT + 2;

    const TaskbarLyricsFetch = (path, params) => fetch(
        `http://127.0.0.1:${TaskbarLyricsPort}/taskbar${path}`,
        {
            method: "POST",
            body: JSON.stringify(params),
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    const TaskbarLyricsAPI = {
        lyric: params => TaskbarLyricsFetch("/lyric", params),
        font: params => TaskbarLyricsFetch("/font", params),
        color: params => TaskbarLyricsFetch("/color", params),
        style: params => TaskbarLyricsFetch("/style", params),
        position: params => TaskbarLyricsFetch("/position", params),
        margin: params => TaskbarLyricsFetch("/margin", params),
        align: params => TaskbarLyricsFetch("/align", params),
        screen: params => TaskbarLyricsFetch("/screen", params),
        close: params => TaskbarLyricsFetch("/close", params)
    };

    this.api = {
        TaskbarLyricsPort,
        TaskbarLyricsAPI
    };
});