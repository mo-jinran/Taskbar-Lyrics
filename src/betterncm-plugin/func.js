"use strict";


plugin.onLoad(async () => {
    const [
        TaskbarLyricsAPI,
        WindowsEnum,
        defaultConfig,
        startTaskbarLyrics,
        stopTaskbarLyrics
    ] = [...this.index];


    // 配置界面加载完成
    const onload = () => {
        console.log("Taskbar-Lyrics配置界面加载完成");

        const basic_weight_select_value = document.querySelector("#basic_weight_select_value");
        const basic_weight_select_box = document.querySelector("#basic_weight_select_box");
        const extra_weight_select_value = document.querySelector("#extra_weight_select_value");
        const extra_weight_select_box = document.querySelector("#extra_weight_select_box");

        basic_weight_select_value.textContent = plugin.getConfig("style", defaultConfig["style"])["basic"]["weight"];
        extra_weight_select_value.textContent = plugin.getConfig("style", defaultConfig["style"])["extra"]["weight"];

        basic_weight_select_value.addEventListener("click", event => {
            const open = event.target.parentElement.classList.contains("z-open");
            if (open) {
                event.target.parentElement.classList.remove("z-open");
            } else {
                event.target.parentElement.classList.add("z-open");
            }
        });
        extra_weight_select_value.addEventListener("click", event => {
            const open = event.target.parentElement.classList.contains("z-open");
            if (open) {
                event.target.parentElement.classList.remove("z-open");
            } else {
                event.target.parentElement.classList.add("z-open");
            }
        });

        basic_weight_select_box.addEventListener("click", event => {
            const name = event.target.parentElement.parentElement.parentElement.name;
            const value = event.target.value;
            fontStyle.setWeight(name, value);
            basic_weight_select_value.textContent = event.target.value;
        });
        extra_weight_select_box.addEventListener("click", event => {
            const name = event.target.parentElement.parentElement.parentElement.name;
            const value = event.target.value;
            fontStyle.setWeight(name, value);
            extra_weight_select_value.textContent = event.target.value;
        });
    }


    // 歌词开关
    const masterSwitch = event => event.target.checked ? startTaskbarLyrics() : stopTaskbarLyrics();


    // 更换字体
    const fontFamily = {
        set: () => {
            const config = {
                "font_family": document.querySelector("#font_family").value
            };
            plugin.setConfig("font", config);
            TaskbarLyricsAPI.font(config);
        },
        default: () => {
            plugin.setConfig("font", undefined);
            TaskbarLyricsAPI.font(defaultConfig.font);
            document.querySelector("#font_family").value = defaultConfig.font.font_family;
        }
    }


    // 字体颜色
    const fontColor = {
        set: () => {
            const basic_light_color = document.querySelector("#basic_light_color");
            const basic_dark_color = document.querySelector("#basic_dark_color");
            const extra_light_color = document.querySelector("#extra_light_color");
            const extra_dark_color = document.querySelector("#extra_dark_color");
            const basic_light_opacity = document.querySelector("#basic_light_opacity");
            const basic_dark_opacity = document.querySelector("#basic_dark_opacity");
            const extra_light_opacity = document.querySelector("#extra_light_opacity");
            const extra_dark_opacity = document.querySelector("#extra_dark_opacity");

            const config = {
                "basic": {
                    "light": {
                        "hex_color": parseInt(basic_light_color.value.slice(1), 16),
                        "opacity": Number(basic_light_opacity.value)
                    },
                    "dark": {
                        "hex_color": parseInt(basic_dark_color.value.slice(1), 16),
                        "opacity": Number(basic_dark_opacity.value)
                    }
                },
                "extra": {
                    "light": {
                        "hex_color": parseInt(extra_light_color.value.slice(1), 16),
                        "opacity": Number(extra_light_opacity.value)
                    },
                    "dark": {
                        "hex_color": parseInt(extra_dark_color.value.slice(1), 16),
                        "opacity": Number(extra_dark_opacity.value)
                    }
                }
            };
            plugin.setConfig("color", config);
            TaskbarLyricsAPI.color(config);
        },
        default: () => {
            const basic_light_color = document.querySelector("#basic_light_color");
            const basic_dark_color = document.querySelector("#basic_dark_color");
            const extra_light_color = document.querySelector("#extra_light_color");
            const extra_dark_color = document.querySelector("#extra_dark_color");
            const basic_light_opacity = document.querySelector("#basic_light_opacity");
            const basic_dark_opacity = document.querySelector("#basic_dark_opacity");
            const extra_light_opacity = document.querySelector("#extra_light_opacity");
            const extra_dark_opacity = document.querySelector("#extra_dark_opacity");
            basic_light_color.value = `#${defaultConfig.color.basic.light.hex_color.toString(16)}`;
            basic_dark_color.value = `#${defaultConfig.color.basic.dark.hex_color.toString(16)}`;
            extra_light_color.value = `#${defaultConfig.color.extra.light.hex_color.toString(16)}`;
            extra_dark_color.value = `#${defaultConfig.color.extra.dark.hex_color.toString(16)}`;
            basic_light_opacity.value = defaultConfig.color.basic.light.opacity;
            basic_dark_opacity.value = defaultConfig.color.basic.dark.opacity;
            extra_light_opacity.value = defaultConfig.color.extra.light.opacity;
            extra_dark_opacity.value = defaultConfig.color.extra.dark.opacity;
            plugin.setConfig("color", undefined);
            TaskbarLyricsAPI.color(defaultConfig.color);
        }
    }


    // 字体样式
    const fontStyle = {
        get config() {
            return {
                "basic": {
                    "weight": plugin.getConfig("style", defaultConfig.style)["basic"]["weight"],
                    "slope": plugin.getConfig("style", defaultConfig.style)["basic"]["slope"],
                    "underline": plugin.getConfig("style", defaultConfig.style)["basic"]["underline"],
                    "strikethrough": plugin.getConfig("style", defaultConfig.style)["basic"]["strikethrough"]
                },
                "extra": {
                    "weight": plugin.getConfig("style", defaultConfig.style)["extra"]["weight"],
                    "slope": plugin.getConfig("style", defaultConfig.style)["extra"]["slope"],
                    "underline": plugin.getConfig("style", defaultConfig.style)["extra"]["underline"],
                    "strikethrough": plugin.getConfig("style", defaultConfig.style)["extra"]["strikethrough"]
                }
            }
        },
        setWeight: (name, value) => {
            const config = { ...fontStyle.config };
            config[name].weight = Number(value);
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setSlope: event => {
            const config = { ...fontStyle.config };
            config[event.target.name].slope = event.target.value || 0;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setUnderline: event => {
            const config = { ...fontStyle.config };
            config[event.target.name].underline = event.target.checked;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        setStrikethrough: event => {
            const config = { ...fontStyle.config };
            config[event.target.name].strikethrough = event.target.checked;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        default: () => {
            plugin.setConfig("style", undefined);
            TaskbarLyricsAPI.style(defaultConfig.style);
            document.querySelector("#basic_weight_select_value").textContent = defaultConfig["style"]["basic"]["weight"];
            document.querySelector("#basic_underline_checkbox").checked = defaultConfig["style"]["basic"]["underline"];
            document.querySelector("#basic_strikethrough_checkbox").checked = defaultConfig["style"]["basic"]["strikethrough"];
            document.querySelector("#extra_weight_select_value").textContent = defaultConfig["style"]["extra"]["weight"];
            document.querySelector("#extra_underline_checkbox").checked = defaultConfig["style"]["extra"]["underline"];
            document.querySelector("#extra_strikethrough_checkbox").checked = defaultConfig["style"]["extra"]["strikethrough"];
        }
    }


    // 修改位置
    const position = {
        set: event => {
            const config = {
                "position": Number(event.target.value) || 0
            };
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
        set: () => {
            const config = {
                "left": Number(document.querySelector("#left").value),
                "right": Number(document.querySelector("#right").value)
            };
            plugin.setConfig("margin", config);
            TaskbarLyricsAPI.margin(config);
        },
        default: () => {
            plugin.setConfig("margin", undefined);
            TaskbarLyricsAPI.margin(defaultConfig.margin);
            document.querySelector("#left").value = defaultConfig.margin.left;
            document.querySelector("#right").value = defaultConfig.margin.right;
        }
    }


    // 对齐方式
    const textAlign = {
        set: event => {
            const config = {
                "basic": event.target.value[0] == "basic"
                    ? Number(event.target.value[1])
                    : plugin.getConfig("align", defaultConfig.align)["basic"],
                "extra": event.target.value[0] == "extra"
                    ? Number(event.target.value[1])
                    : plugin.getConfig("align", defaultConfig.align)["extra"],
            };
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
        set: event => {
            const config = {
                "parent_taskbar": event.target.value
            };
            plugin.setConfig("screen", config);
            TaskbarLyricsAPI.screen(config);
        },
        default: () => {
            plugin.setConfig("screen", undefined);
            TaskbarLyricsAPI.screen(defaultConfig.screen);
        }
    }


    this.func = [
        onload,
        masterSwitch,
        fontFamily,
        fontColor,
        fontStyle,
        position,
        margin,
        textAlign,
        parentTaskbar
    ];
});
