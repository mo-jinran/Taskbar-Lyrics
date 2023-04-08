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
        // 字体设置 - 字体
        font: params => TaskbarLyricsFetch("/font/font", params),

        // 字体设置 - 颜色
        color: params => TaskbarLyricsFetch("/font/color", params),

        // 字体设置 - 样式
        style: params => TaskbarLyricsFetch("/font/style", params),

        // 歌词设置 - 歌词
        lyrics: params => TaskbarLyricsFetch("/lyrics/lyrics", params),

        // 歌词设置 - 对齐
        align: params => TaskbarLyricsFetch("/lyrics/align", params),

        // 窗口设置 - 位置
        position: params => TaskbarLyricsFetch("/window/position", params),

        // 窗口设置 - 边距
        margin: params => TaskbarLyricsFetch("/window/margin", params),

        // 窗口设置 - 屏幕
        screen: params => TaskbarLyricsFetch("/window/screen", params),

        // 关闭
        close: params => TaskbarLyricsFetch("/close", params)
    };

    this.api = {
        TaskbarLyricsPort,
        TaskbarLyricsAPI
    };
});