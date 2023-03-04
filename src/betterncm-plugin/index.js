"use strict";


plugin.onLoad(async () => {
    let observer = null;
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

        plugin.getConfig("font", false) && TaskbarLyricsAPI.font(
            plugin.getConfig("font", defaultConfig.font)
        );

        plugin.getConfig("color", false) && TaskbarLyricsAPI.color(
            plugin.getConfig("color", defaultConfig.color)
        );

        plugin.getConfig("style", false) && TaskbarLyricsAPI.style(
            plugin.getConfig("style", defaultConfig.style)
        );

        plugin.getConfig("position", false) && TaskbarLyricsAPI.position(
            plugin.getConfig("position", defaultConfig.position)
        );

        plugin.getConfig("margin", false) && TaskbarLyricsAPI.margin(
            plugin.getConfig("margin", defaultConfig.margin)
        );

        plugin.getConfig("align", false) && TaskbarLyricsAPI.align(
            plugin.getConfig("align", defaultConfig.align)
        );

        plugin.getConfig("screen", false) && TaskbarLyricsAPI.screen(
            plugin.getConfig("screen", defaultConfig.screen)
        );

        watchLyricsChange();
    }


    // 关闭歌词
    async function stopTaskbarLyrics() {
        TaskbarLyricsAPI.stop();
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }


    // 监视软件内歌词变动
    async function watchLyricsChange() {
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

                TaskbarLyricsAPI.lyrics(lyrics);
            }
        });
        observer.observe(mLyric, { childList: true, subtree: true });
    }


    try {
        plugin.getConfig("color", defaultConfig["color"])["basic"]["light"]["hex_color"];
    } catch {
        plugin.setConfig("color", undefined);
    }


    this.index = [
        TaskbarLyricsAPI,
        WindowsEnum,
        defaultConfig,
        startTaskbarLyrics,
        stopTaskbarLyrics
    ];

    addEventListener("beforeunload", stopTaskbarLyrics);
    startTaskbarLyrics();
});
