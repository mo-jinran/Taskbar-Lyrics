"use strict";


plugin.onLoad(async () => {
    const {
        TaskbarLyricsPort,
        TaskbarLyricsAPI,
        WindowsEnum,
        defaultConfig,
        pluginConfig
    } = { ...this.base };
    const { startGetLyric, stopGetLyric } = { ...this.lyric };


    // 启动任务栏歌词软件
    const TaskbarLyricsStart = async () => {
        // 这BetterNCM获取的路径是不标准的会出问题，要替换掉下面那俩字符
        const dataPath = (await betterncm.app.getDataPath()).replace("/", "\\");
        const pluginPath = this.pluginPath.replace("/./", "\\").replace("/", "\\");
        const taskkill = `taskkill /F /IM "taskbar-lyrics.exe"`;
        const xcopy = `xcopy /C /D /Y "${pluginPath}\\taskbar-lyrics.exe" "${dataPath}"`;
        const exec = `"${dataPath}\\taskbar-lyrics.exe" ${TaskbarLyricsPort}`;
        const cmd = `${taskkill} & ${xcopy} && ${exec}`;
        await betterncm.app.exec(`cmd /S /C ${cmd}`, false, false);
        TaskbarLyricsAPI.font.font(pluginConfig.get("font"));
        TaskbarLyricsAPI.font.color(pluginConfig.get("color"));
        TaskbarLyricsAPI.font.style(pluginConfig.get("style"));
        TaskbarLyricsAPI.window.position(pluginConfig.get("position"));
        TaskbarLyricsAPI.window.margin(pluginConfig.get("margin"));
        TaskbarLyricsAPI.lyrics.align(pluginConfig.get("align"));
        TaskbarLyricsAPI.window.screen(pluginConfig.get("screen"));
        startGetLyric();
    };


    // 关闭任务栏歌词软件
    const TaskbarLyricsClose = async () => {
        TaskbarLyricsAPI.close({});
        stopGetLyric();
    };


    addEventListener("beforeunload", TaskbarLyricsClose);
    TaskbarLyricsStart();


    // 更换字体
    const font = {
        apply: elements => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("font")));
            config["font_family"] = elements.fontFamily.value;
            pluginConfig.set("font", config);
            TaskbarLyricsAPI.font.font(config);
        },
        reset: elements => {
            pluginConfig.set("font", undefined);
            TaskbarLyricsAPI.font.font(defaultConfig["font"]);
            elements.fontFamily.value = defaultConfig["font"]["font_family"];
        }
    }


    // 字体颜色
    const color = {
        apply: elements => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("color")));
            config["basic"]["light"]["hex_color"] = parseInt(elements.basicLightColor.value.slice(1), 16);
            config["basic"]["light"]["opacity"] = Number(elements.basicLightOpacity.value);
            config["basic"]["dark"]["hex_color"] = parseInt(elements.basicDarkColor.value.slice(1), 16);
            config["basic"]["dark"]["opacity"] = Number(elements.basicDarkOpacity.value);
            config["extra"]["light"]["hex_color"] = parseInt(elements.extraLightColor.value.slice(1), 16);
            config["extra"]["light"]["opacity"] = Number(elements.extraLightOpacity.value);
            config["extra"]["dark"]["hex_color"] = parseInt(elements.extraDarkColor.value.slice(1), 16);
            config["extra"]["dark"]["opacity"] = Number(elements.extraDarkOpacity.value);
            pluginConfig.set("color", config);
            TaskbarLyricsAPI.font.color(config);
        },
        reset: elements => {
            elements.basicLightColor.value = `#${defaultConfig["color"]["basic"]["light"]["hex_color"].toString(16).padStart(6, "0")}`;
            elements.basicLightOpacity.value = defaultConfig["color"]["basic"]["light"]["opacity"];
            elements.basicDarkColor.value = `#${defaultConfig["color"]["basic"]["dark"]["hex_color"].toString(16).padStart(6, "0")}`;
            elements.basicDarkOpacity.value = defaultConfig["color"]["basic"]["dark"]["opacity"];
            elements.extraLightColor.value = `#${defaultConfig["color"]["extra"]["light"]["hex_color"].toString(16).padStart(6, "0")}`;
            elements.extraLightOpacity.value = defaultConfig["color"]["extra"]["light"]["opacity"];
            elements.extraDarkColor.value = `#${defaultConfig["color"]["extra"]["dark"]["hex_color"].toString(16).padStart(6, "0")}`;
            elements.extraDarkOpacity.value = defaultConfig["color"]["extra"]["dark"]["opacity"];
            pluginConfig.set("color", undefined);
            TaskbarLyricsAPI.font.color(defaultConfig["color"]);
        }
    }


    // 字体样式
    const style = {
        setWeight: (name, value, textContent) => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[name].weight.value = Number(value);
            config[name].weight.textContent = textContent;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.font.style(config);
        },
        setSlopeNormal: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_NORMAL;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.font.style(config);
        },
        setSlopeOblique: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_OBLIQUE;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.font.style(config);
        },
        setSlopeItalic: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_ITALIC;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.font.style(config);
        },
        setUnderline: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].underline = event.target.checked;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.font.style(config);
        },
        setStrikethrough: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].strikethrough = event.target.checked;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.font.style(config);
        },
        reset: elements => {
            pluginConfig.set("style", undefined);
            TaskbarLyricsAPI.font.style(defaultConfig["style"]);
            elements.basicWeightValue.textContent = defaultConfig["style"]["basic"]["weight"]["textContent"];
            elements.basicUnderline.checked = defaultConfig["style"]["basic"]["underline"];
            elements.basicStrikethrough.checked = defaultConfig["style"]["basic"]["strikethrough"];
            elements.extraWeightValue.textContent = defaultConfig["style"]["extra"]["weight"]["textContent"];
            elements.extraUnderline.checked = defaultConfig["style"]["extra"]["underline"];
            elements.extraStrikethrough.checked = defaultConfig["style"]["extra"]["strikethrough"];
        }
    }


    // 歌词设置
    const lyrics = {
        lyricsSwitch: event => event.target.checked ? TaskbarLyricsStart() : TaskbarLyricsClose(),
        setRetrievalMethod: (value, textContent) => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("lyrics")));
            config["retrieval_method"]["value"] = Number(value);
            config["retrieval_method"]["textContent"] = textContent;
            stopGetLyric();
            pluginConfig.set("lyrics", config);
            startGetLyric();
        },
        reset: elements => {
            elements.retrievalMethodValue.textContent = defaultConfig["lyrics"]["retrieval_method"]["textContent"];
            stopGetLyric();
            pluginConfig.set("lyrics", undefined);
            startGetLyric();
        }
    }


    // 显示效果
    const effect = {
        setNextLineLyricsPosition: (value, textContent) => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("effect")));
            config["next_line_lyrics_position"]["value"] = Number(value);
            config["next_line_lyrics_position"]["textContent"] = textContent;
            pluginConfig.set("effect", config);
        },
        setExtraShow: (value, textContent) => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("effect")));
            config["extra_show"]["value"] = Number(value);
            config["extra_show"]["textContent"] = textContent;
            pluginConfig.set("effect", config);
        },
        apply: elements => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("effect")));
            config["adjust"] = Number(elements.adjust.value);
            pluginConfig.set("effect", config);
        },
        reset: elements => {
            elements.nextLineLyricsPositionValue.textContent = defaultConfig["effect"]["next_line_lyrics_position"]["textContent"];
            elements.extraShowValue.textContent = defaultConfig["effect"]["extra_show"]["textContent"];
            elements.adjust.value = defaultConfig["effect"]["adjust"];
            pluginConfig.set("effect", undefined);
        }
    }


    // 对齐方式
    const align = {
        setLeft: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("align")));
            config[event.target.dataset.type] = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING;
            pluginConfig.set("align", config);
            TaskbarLyricsAPI.lyrics.align(config);
        },
        setCenter: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("align")));
            config[event.target.dataset.type] = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER;
            pluginConfig.set("align", config);
            TaskbarLyricsAPI.lyrics.align(config);
        },
        setRight: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("align")));
            config[event.target.dataset.type] = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING;
            pluginConfig.set("align", config);
            TaskbarLyricsAPI.lyrics.align(config);
        },
        reset: () => {
            pluginConfig.set("align", undefined);
            TaskbarLyricsAPI.lyrics.align(defaultConfig["align"]);
        }
    }


    // 修改位置
    const position = {
        setWindowPosition: (value, textContent) => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("position")));
            config["position"]["value"] = Number(value);
            config["position"]["textContent"] = textContent;
            pluginConfig.set("position", config);
            TaskbarLyricsAPI.window.position(config);
        },
        reset: elements => {
            elements.windowPositionValue.textContent = defaultConfig["position"]["position"]["textContent"];
            pluginConfig.set("position", undefined);
            TaskbarLyricsAPI.window.position(defaultConfig["position"]);
        }
    }


    // 修改边距
    const margin = {
        apply: elements => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("margin")));
            config["left"] = Number(elements.left.value);
            config["right"] = Number(elements.right.value);
            pluginConfig.set("margin", config);
            TaskbarLyricsAPI.window.margin(config);
        },
        reset: elements => {
            pluginConfig.set("margin", undefined);
            TaskbarLyricsAPI.window.margin(defaultConfig["margin"]);
            elements.left.value = defaultConfig["margin"]["left"];
            elements.right.value = defaultConfig["margin"]["right"];
        }
    }


    // 切换屏幕
    const screen = {
        setParentTaskbar: (value, textContent) => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("screen")));
            config["parent_taskbar"]["value"] = value;
            config["parent_taskbar"]["textContent"] = textContent;
            pluginConfig.set("screen", config);
            TaskbarLyricsAPI.window.screen(config);
        },
        reset: elements => {
            elements.parentTaskbarValue.textContent = defaultConfig["screen"]["parent_taskbar"]["textContent"];
            pluginConfig.set("screen", undefined);
            TaskbarLyricsAPI.window.screen(defaultConfig["screen"]);
        }
    }


    this.func = {
        font,
        color,
        style,
        lyrics,
        effect,
        align,
        position,
        margin,
        screen
    };
});
