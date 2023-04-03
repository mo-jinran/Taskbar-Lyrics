"use strict";


plugin.onLoad(async () => {
    const { TaskbarLyricsPort, TaskbarLyricsAPI } = { ...this.api };
    const { WindowsEnum, defaultConfig, pluginConfig } = { ...this.base };
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
        TaskbarLyricsAPI.font(pluginConfig.get("font"));
        TaskbarLyricsAPI.color(pluginConfig.get("color"));
        TaskbarLyricsAPI.style(pluginConfig.get("style"));
        TaskbarLyricsAPI.position(pluginConfig.get("position"));
        TaskbarLyricsAPI.margin(pluginConfig.get("margin"));
        TaskbarLyricsAPI.align(pluginConfig.get("align"));
        TaskbarLyricsAPI.screen(pluginConfig.get("screen"));
        startGetLyric();
    };


    // 关闭任务栏歌词软件
    const TaskbarLyricsClose = async () => {
        TaskbarLyricsAPI.close({});
        stopGetLyric();
    };


    addEventListener("beforeunload", TaskbarLyricsClose);
    TaskbarLyricsStart();


    // 歌词设置
    const lyrics = {
        switch: event => event.target.checked ? TaskbarLyricsStart() : TaskbarLyricsClose(),
        setRetrievalMethod: (value, textContent) => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("lyrics")));
            config.retrieval_method.value = value;
            config.retrieval_method.textContent = textContent;
            stopGetLyric();
            pluginConfig.set("lyrics", config);
            startGetLyric();
        },
        set: elements => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("lyrics")));
            config.adjust = Number(elements.adjust.value);
            pluginConfig.set("lyrics", config);
        },
        default: elements => {
            elements.retrievalMethodValue.textContent = defaultConfig.lyrics.retrieval_method.textContent;
            elements.extraShowValue.textContent = defaultConfig.lyrics.extra_show.textContent;
            elements.adjust.value = defaultConfig.lyrics.adjust;
            stopGetLyric();
            pluginConfig.set("lyrics", undefined);
            startGetLyric();
        }
    }

    const extraShow = {
        createOptionElement: (option, saved, elements) => {
            let optionElement = document.createElement("div");
            optionElement.classList.add("option");
            optionElement.innerText = option.textContent;
            optionElement.setAttribute("data-value", option.value);
            let btn = document.createElement("button");
            btn.classList.add("option-btn");
            btn.addEventListener("click", function () {
                extraShow.createOptionElement(option, !saved, elements);
                optionElement.remove();
                extraShow.set(elements);
            });
            optionElement.addEventListener("mouseover", () => {
                btn.style.display = "flex";
            });
            optionElement.addEventListener("mouseout", () => {
                btn.style.display = "none";
            });
            optionElement.appendChild(btn);
            if (saved) {
                btn.innerText = "x";
                btn.classList.add("delete-btn");
                elements.savedOptionsArea.appendChild(optionElement);
            } else {
                btn.innerText = "+";
                btn.classList.add("add-btn");
                elements.optionsArea.appendChild(optionElement);
            }
        },
        set: (elements) => {
            let options = [];
            elements.optionsArea.querySelectorAll(".option").forEach((element) =>
                options.push({
                    value: element.getAttribute("data-value"),
                    textContent: element.firstChild.nodeValue,
                })
            );
            let savedOptions = [];
            elements.savedOptionsArea.querySelectorAll(".option").forEach((element) =>
                savedOptions.push({
                    value: element.getAttribute("data-value"),
                    textContent: element.firstChild.nodeValue,
                })
            );
            const config = JSON.parse(JSON.stringify(pluginConfig.get("extra_show")));
            config.options = options;
            config.saved_options = savedOptions;
            pluginConfig.set("extra_show", config);
        },
        default: (elements) => {
            elements.optionsArea.querySelectorAll(".option").forEach((element) => element.remove());
            defaultConfig.extra_show.options.forEach((option) =>
                extraShow.createOptionElement(option, false, elements)
            );
            elements.savedOptionsArea.querySelectorAll(".option").forEach((element) => element.remove());
            defaultConfig.extra_show.saved_options.forEach((option) =>
                extraShow.createOptionElement(option, true, elements)
            );
            pluginConfig.set("extra_show", undefined);
        },
    };

    // 更换字体
    const font = {
        set: elements => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("font")));
            config.font_family = elements["font_family"].value;
            pluginConfig.set("font", config);
            TaskbarLyricsAPI.font(config);
        },
        default: elements => {
            pluginConfig.set("font", undefined);
            TaskbarLyricsAPI.font(defaultConfig.font);
            elements["font_family"].value = defaultConfig.font.font_family;
        }
    }


    // 字体颜色
    const color = {
        set: elements => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("color")));
            config.basic.light.hex_color = parseInt(elements.basicLightColor.value.slice(1), 16);
            config.basic.light.opacity = Number(elements.basicLightOpacity.value);
            config.basic.dark.hex_color = parseInt(elements.basicDarkColor.value.slice(1), 16);
            config.basic.dark.opacity = Number(elements.basicDarkOpacity.value);
            config.extra.light.hex_color = parseInt(elements.extraLightColor.value.slice(1), 16);
            config.extra.light.opacity = Number(elements.extraLightOpacity.value);
            config.extra.dark.hex_color = parseInt(elements.extraDarkColor.value.slice(1), 16);
            config.extra.dark.opacity = Number(elements.extraDarkOpacity.value);
            pluginConfig.set("color", config);
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
            pluginConfig.set("color", undefined);
            TaskbarLyricsAPI.color(defaultConfig.color);
        }
    }


    // 字体样式
    const style = {
        setWeight: (name, value, textContent) => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[name].weight.value = Number(value);
            config[name].weight.textContent = textContent;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeNormal: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_NORMAL;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeOblique: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_OBLIQUE;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlopeItalic: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].slope = WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_ITALIC;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setUnderline: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].underline = event.target.checked;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setStrikethrough: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("style")));
            config[event.target.dataset.type].strikethrough = event.target.checked;
            pluginConfig.set("style", config);
            TaskbarLyricsAPI.style(config);
        },
        default: elements => {
            pluginConfig.set("style", undefined);
            TaskbarLyricsAPI.style(defaultConfig.style);
            elements["basicWeightValue"].textContent = defaultConfig["style"]["basic"]["weight"]["textContent"];
            elements["basicUnderline"].checked = defaultConfig["style"]["basic"]["underline"];
            elements["basicStrikethrough"].checked = defaultConfig["style"]["basic"]["strikethrough"];
            elements["extraWeightValue"].textContent = defaultConfig["style"]["extra"]["weight"]["textContent"];
            elements["extraUnderline"].checked = defaultConfig["style"]["extra"]["underline"];
            elements["extraStrikethrough"].checked = defaultConfig["style"]["extra"]["strikethrough"];
        }
    }


    // 修改位置
    const position = {
        setLeft: () => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("position")));
            config.position = WindowsEnum.WindowAlignment.WindowAlignmentLeft;
            pluginConfig.set("position", config);
            TaskbarLyricsAPI.position(config);
        },
        setCenter: () => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("position")));
            config.position = WindowsEnum.WindowAlignment.WindowAlignmentCenter;
            pluginConfig.set("position", config);
            TaskbarLyricsAPI.position(config);
        },
        setRight: () => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("position")));
            config.position = WindowsEnum.WindowAlignment.WindowAlignmentRight;
            pluginConfig.set("position", config);
            TaskbarLyricsAPI.position(config);
        },
        default: () => {
            pluginConfig.set("position", undefined);
            TaskbarLyricsAPI.position(defaultConfig.position);
        }
    }


    // 修改边距
    const margin = {
        set: elements => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("margin")));
            config.left = Number(elements["left"].value);
            config.right = Number(elements["right"].value);
            pluginConfig.set("margin", config);
            TaskbarLyricsAPI.margin(config);
        },
        default: elements => {
            pluginConfig.set("margin", undefined);
            TaskbarLyricsAPI.margin(defaultConfig.margin);
            elements["left"].value = defaultConfig.margin.left;
            elements["right"].value = defaultConfig.margin.right;
        }
    }


    // 对齐方式
    const align = {
        setLeft: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("align")));
            config[event.target.dataset.type] = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING;
            pluginConfig.set("align", config);
            TaskbarLyricsAPI.align(config);
        },
        setCenter: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("align")));
            config[event.target.dataset.type] = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER;
            pluginConfig.set("align", config);
            TaskbarLyricsAPI.align(config);
        },
        setRight: event => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("align")));
            config[event.target.dataset.type] = WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING;
            pluginConfig.set("align", config);
            TaskbarLyricsAPI.align(config);
        },
        default: () => {
            pluginConfig.set("align", undefined);
            TaskbarLyricsAPI.align(defaultConfig.align);
        }
    }


    // 切换屏幕
    const screen = {
        setPrimary: () => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("screen")));
            config.parent_taskbar = "Shell_TrayWnd";
            pluginConfig.set("screen", config);
            TaskbarLyricsAPI.screen(config);
        },
        setSecondary: () => {
            const config = JSON.parse(JSON.stringify(pluginConfig.get("screen")));
            config.parent_taskbar = "Shell_SecondaryTrayWnd";
            pluginConfig.set("screen", config);
            TaskbarLyricsAPI.screen(config);
        },
        default: () => {
            pluginConfig.set("screen", undefined);
            TaskbarLyricsAPI.screen(defaultConfig.screen);
        }
    }


    this.func = {
        lyrics,
        extraShow,
        font,
        color,
        style,
        position,
        margin,
        align,
        screen
    };
});
