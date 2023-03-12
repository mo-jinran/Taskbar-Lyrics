"use strict";


plugin.onLoad(async () => {
    const { TaskbarLyricsPort, TaskbarLyricsAPI } = { ...this.api };
    const { WindowsEnum, defaultConfig } = { ...this.base };
    const { startGetLyric, stopGetLyric } = { ...this.lyric };


    // 歌词开关
    const taskbarLyricsSwitch = {
        on: () => {
            const TaskbarLyricsPath = `${this.pluginPath}/taskbar-lyrics.exe`;
            betterncm.app.exec(`${TaskbarLyricsPath} ${TaskbarLyricsPort}`, false, true);
            TaskbarLyricsAPI.font(plugin.getConfig("font", defaultConfig.font));
            TaskbarLyricsAPI.color(plugin.getConfig("color", defaultConfig.color));
            TaskbarLyricsAPI.style(plugin.getConfig("style", defaultConfig.style));
            TaskbarLyricsAPI.position(plugin.getConfig("position", defaultConfig.position));
            TaskbarLyricsAPI.margin(plugin.getConfig("margin", defaultConfig.margin));
            TaskbarLyricsAPI.align(plugin.getConfig("align", defaultConfig.align));
            TaskbarLyricsAPI.screen(plugin.getConfig("screen", defaultConfig.screen));
            startGetLyric();
        },
        off: () => {
            TaskbarLyricsAPI.close({});
            stopGetLyric();
        },
        switch: event => {
            if (event.target.checked) {
                taskbarLyricsSwitch.on();
            } else {
                taskbarLyricsSwitch.off();
            }
        }
    }


    // 更换字体
    const fontFamily = {
        set: elements => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("font", defaultConfig.font)));
            config.font_family = elements["fontFamily_"].value;
            plugin.setConfig("font", config);
            TaskbarLyricsAPI.font(config);
        },
        default: elements => {
            plugin.setConfig("font", undefined);
            TaskbarLyricsAPI.font(defaultConfig.font);
            elements["fontFamily_"].value = defaultConfig.font.font_family;
        }
    }


    // 字体颜色
    const fontColor = {
        set: elements => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("color", defaultConfig.color)));
            config.basic.light.hex_color = parseInt(elements.basicLightColor.value.slice(1), 16);
            config.basic.light.opacity = Number(elements.basicLightOpacity.value);
            config.basic.dark.hex_color = parseInt(elements.basicDarkColor.value.slice(1), 16);
            config.basic.dark.opacity = Number(elements.basicDarkOpacity.value);
            config.extra.light.hex_color = parseInt(elements.extraLightColor.value.slice(1), 16);
            config.extra.light.opacity = Number(elements.extraLightOpacity.value);
            config.extra.dark.hex_color = parseInt(elements.extraDarkColor.value.slice(1), 16);
            config.extra.dark.opacity = Number(elements.extraDarkOpacity.value);
            plugin.setConfig("color", config);
            TaskbarLyricsAPI.color(config);
        },
        default: elements => {
            elements.basicLightColor.value = `#${defaultConfig.color.basic.light.hex_color.toString(16).padStart(6, "0")}`;
            elements.basicLightOpacity.value = defaultConfig.color.basic.light.opacity;
            elements.basicDarkColor.value = `#${defaultConfig.color.basic.dark.hex_color.toString(16).padStart(6, "0")}`;
            elements.basicDarkOpacity.value = defaultConfig.color.basic.dark.opacity;
            elements.extraLightColor.value = `#${defaultConfig.color.extra.light.hex_color.toString(16).padStart(6, "0")}`;
            elements.extraLightOpacity.value = defaultConfig.color.extra.light.opacity;
            elements.extraDarkColor.value = `#${defaultConfig.color.extra.dark.hex_color.toString(16).padStart(6, "0")}`;
            elements.extraDarkOpacity.value = defaultConfig.color.extra.dark.opacity;
            plugin.setConfig("color", undefined);
            TaskbarLyricsAPI.color(defaultConfig.color);
        }
    }


    // 字体样式
    const fontStyle = {
        setWeight: (name, value) => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config[name].weight = Number(value);
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeBasicNormal: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["basic"].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_NORMAL;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeBasicOblique: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["basic"].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_OBLIQUE;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeBasicItalic: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["basic"].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_ITALIC;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeExtraNormal: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["extra"].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_NORMAL;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeExtraOblique: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["extra"].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_OBLIQUE;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeExtraItalic: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["extra"].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_ITALIC;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setBasicUnderline: event => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["basic"].underline = event.target.checked;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setBasicStrikethrough: event => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["basic"].strikethrough = event.target.checked;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setExtraUnderline: event => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["extra"].underline = event.target.checked;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setExtraStrikethrough: event => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config["extra"].strikethrough = event.target.checked;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        default: elements => {
            plugin.setConfig("style", undefined);
            TaskbarLyricsAPI.style(defaultConfig.style);
            elements["basicWeightSelectValue"].textContent = defaultConfig["style"]["basic"]["weight"];
            elements["basicUnderline"].checked = defaultConfig["style"]["basic"]["underline"];
            elements["basicStrikethrough"].checked = defaultConfig["style"]["basic"]["strikethrough"];
            elements["extraWeightSelectValue"].textContent = defaultConfig["style"]["extra"]["weight"];
            elements["extraUnderline"].checked = defaultConfig["style"]["extra"]["underline"];
            elements["extraStrikethrough"].checked = defaultConfig["style"]["extra"]["strikethrough"];
        }
    }


    // 修改位置
    const position = {
        setLeft: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("position", defaultConfig.position)));
            config.position = WindowsEnum.WindowAlignment.WindowAlignmentLeft;
            plugin.setConfig("position", config);
            TaskbarLyricsAPI.position(config);
        },
        setCenter: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("position", defaultConfig.position)));
            config.position = WindowsEnum.WindowAlignment.WindowAlignmentCenter;
            plugin.setConfig("position", config);
            TaskbarLyricsAPI.position(config);
        },
        setRight: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("position", defaultConfig.position)));
            config.position = WindowsEnum.WindowAlignment.WindowAlignmentRight;
            plugin.setConfig("position", config);
            TaskbarLyricsAPI.position(config);
        },
        default: () => {
            plugin.setConfig("position", undefined);
            TaskbarLyricsAPI.position(defaultConfig.position);
        }
    }


    // 修改边距
    const margin = {
        set: elements => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("margin", defaultConfig.position)));
            config.left = Number(elements["left"].value);
            config.right = Number(elements["right"].value);
            plugin.setConfig("margin", config);
            TaskbarLyricsAPI.margin(config);
        },
        default: elements => {
            plugin.setConfig("margin", undefined);
            TaskbarLyricsAPI.margin(defaultConfig.margin);
            elements["left"].value = defaultConfig.margin.left;
            elements["right"].value = defaultConfig.margin.right;
        }
    }


    // 对齐方式
    const textAlign = {
        setBasicLeft: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("align", defaultConfig.align)));
            config.basic = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING;
            config.extra = plugin.getConfig("align", defaultConfig.align)["extra"];
            plugin.setConfig("align", config);
            TaskbarLyricsAPI.align(config);
        },
        setBasicCenter: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("align", defaultConfig.align)));
            config.basic = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER;
            config.extra = plugin.getConfig("align", defaultConfig.align)["extra"];
            plugin.setConfig("align", config);
            TaskbarLyricsAPI.align(config);
        },
        setBasicRight: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("align", defaultConfig.align)));
            config.basic = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING;
            config.extra = plugin.getConfig("align", defaultConfig.align)["extra"];
            plugin.setConfig("align", config);
            TaskbarLyricsAPI.align(config);
        },
        setExtraLeft: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("align", defaultConfig.align)));
            config.basic = plugin.getConfig("align", defaultConfig.align)["basic"];
            config.extra = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING;
            plugin.setConfig("align", config);
            TaskbarLyricsAPI.align(config);
        },
        setExtraCenter: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("align", defaultConfig.align)));
            config.basic = plugin.getConfig("align", defaultConfig.align)["basic"];
            config.extra = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER;
            plugin.setConfig("align", config);
            TaskbarLyricsAPI.align(config);
        },
        setExtraRight: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("align", defaultConfig.align)));
            config.basic = plugin.getConfig("align", defaultConfig.align)["basic"];
            config.extra = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING;
            plugin.setConfig("align", config);
            TaskbarLyricsAPI.align(config);
        },
        default: () => {
            plugin.setConfig("align", undefined);
            TaskbarLyricsAPI.align(defaultConfig.align);
        }
    }


    // 切换屏幕
    const parentTaskbar = {
        setPrimary: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("screen", defaultConfig.screen)));
            config.parent_taskbar = "Shell_TrayWnd";
            plugin.setConfig("screen", config);
            TaskbarLyricsAPI.screen(config);
        },
        setSecondary: () => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("screen", defaultConfig.screen)));
            config.parent_taskbar = "Shell_SecondaryTrayWnd";
            plugin.setConfig("screen", config);
            TaskbarLyricsAPI.screen(config);
        },
        default: () => {
            plugin.setConfig("screen", undefined);
            TaskbarLyricsAPI.screen(defaultConfig.screen);
        }
    }


    addEventListener("beforeunload", taskbarLyricsSwitch.off);
    taskbarLyricsSwitch.on();


    this.func = {
        taskbarLyricsSwitch,
        fontFamily,
        fontColor,
        fontStyle,
        position,
        margin,
        textAlign,
        parentTaskbar
    };
});
