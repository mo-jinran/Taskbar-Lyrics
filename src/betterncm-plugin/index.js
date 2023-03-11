"use strict";


plugin.onLoad(async () => {
    const TaskbarLyricsPath = `${this.pluginPath}/taskbar-lyrics.exe`;
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
        lyrics: params => TaskbarLyricsFetch("/lyrics", params),
        font: params => TaskbarLyricsFetch("/font", params),
        color: params => TaskbarLyricsFetch("/color", params),
        style: params => TaskbarLyricsFetch("/style", params),
        position: params => TaskbarLyricsFetch("/position", params),
        margin: params => TaskbarLyricsFetch("/margin", params),
        align: params => TaskbarLyricsFetch("/align", params),
        screen: params => TaskbarLyricsFetch("/screen", params),
        start: () => TaskbarLyricsFetch("/start", {}),
        stop: () => TaskbarLyricsFetch("/stop", {})
    };


    // 对应Windows的枚举
    const WindowsEnum = {
        WindowAlignment: {
            WindowAlignmentLeft: 0,
            WindowAlignmentCenter: 1,
            WindowAlignmentRight: 2
        },
        DWRITE_TEXT_ALIGNMENT: {
            DWRITE_TEXT_ALIGNMENT_LEADING: 0,
            DWRITE_TEXT_ALIGNMENT_TRAILING: 1,
            DWRITE_TEXT_ALIGNMENT_CENTER: 2,
            DWRITE_TEXT_ALIGNMENT_JUSTIFIED: 3
        },
        DWRITE_FONT_WEIGHT: {
            DWRITE_FONT_WEIGHT_THIN: 100,
            DWRITE_FONT_WEIGHT_EXTRA_LIGHT: 200,
            DWRITE_FONT_WEIGHT_ULTRA_LIGHT: 200,
            DWRITE_FONT_WEIGHT_LIGHT: 300,
            DWRITE_FONT_WEIGHT_SEMI_LIGHT: 350,
            DWRITE_FONT_WEIGHT_NORMAL: 400,
            DWRITE_FONT_WEIGHT_REGULAR: 400,
            DWRITE_FONT_WEIGHT_MEDIUM: 500,
            DWRITE_FONT_WEIGHT_DEMI_BOLD: 600,
            DWRITE_FONT_WEIGHT_SEMI_BOLD: 600,
            DWRITE_FONT_WEIGHT_BOLD: 700,
            DWRITE_FONT_WEIGHT_EXTRA_BOLD: 800,
            DWRITE_FONT_WEIGHT_ULTRA_BOLD: 800,
            DWRITE_FONT_WEIGHT_BLACK: 900,
            DWRITE_FONT_WEIGHT_HEAVY: 900,
            DWRITE_FONT_WEIGHT_EXTRA_BLACK: 950,
            DWRITE_FONT_WEIGHT_ULTRA_BLACK: 950
        },
        DWRITE_FONT_STYLE: {
            DWRITE_FONT_STYLE_NORMAL: 0,
            DWRITE_FONT_STYLE_OBLIQUE: 1,
            DWRITE_FONT_STYLE_ITALIC: 2
        }
    }


    const defaultConfig = {
        "font": {
            "font_family": "Microsoft YaHei"
        },
        "color": {
            "basic": {
                "light": {
                    "hex_color": 0x000000,
                    "opacity": 1.0
                },
                "dark": {
                    "hex_color": 0xFFFFFF,
                    "opacity": 1.0
                }
            },
            "extra": {
                "light": {
                    "hex_color": 0x000000,
                    "opacity": 1.0
                },
                "dark": {
                    "hex_color": 0xFFFFFF,
                    "opacity": 1.0
                }
            }
        },
        "style": {
            "basic": {
                "weight": WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_NORMAL,
                "slope": WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_NORMAL,
                "underline": false,
                "strikethrough": false
            },
            "extra": {
                "weight": WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_NORMAL,
                "slope": WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_NORMAL,
                "underline": false,
                "strikethrough": false
            }
        },
        "position": {
            "position": WindowsEnum.WindowAlignment.WindowAlignmentLeft
        },
        "margin": {
            "left": 0,
            "right": 0
        },
        "align": {
            "basic": WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING,
            "extra": WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING
        },
        "screen": {
            "parent_taskbar": "Shell_TrayWnd"
        }
    };


    // 启动歌词
    async function startTaskbarLyrics() {
        await betterncm.app.exec(`${TaskbarLyricsPath} ${TaskbarLyricsPort}`, false, true);
        TaskbarLyricsAPI.start();
        TaskbarLyricsAPI.font(plugin.getConfig("font", defaultConfig.font));
        TaskbarLyricsAPI.color(plugin.getConfig("color", defaultConfig.color));
        TaskbarLyricsAPI.style(plugin.getConfig("style", defaultConfig.style));
        TaskbarLyricsAPI.position(plugin.getConfig("position", defaultConfig.position));
        TaskbarLyricsAPI.margin(plugin.getConfig("margin", defaultConfig.margin));
        TaskbarLyricsAPI.align(plugin.getConfig("align", defaultConfig.align));
        TaskbarLyricsAPI.screen(plugin.getConfig("screen", defaultConfig.screen));
    }


    // 关闭歌词
    async function stopTaskbarLyrics() {
        TaskbarLyricsAPI.stop();
    }


    try {
        plugin.getConfig("color", defaultConfig["color"])["basic"]["light"]["hex_color"];
    } catch {
        plugin.setConfig("color", undefined);
    }


    this.index = {
        TaskbarLyricsAPI,
        WindowsEnum,
        defaultConfig,
        startTaskbarLyrics,
        stopTaskbarLyrics
    };

    addEventListener("beforeunload", stopTaskbarLyrics);
    startTaskbarLyrics();
});
