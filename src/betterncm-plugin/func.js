"use strict";


plugin.onLoad(async () => {
    const [
        TaskbarLyricsAPI,
        WindowsEnum,
        defaultConfig,
        startTaskbarLyrics
    ] = [...this.index];


    // 歌词开关
    const mainSwitch = {
        on: startTaskbarLyrics,
        off: TaskbarLyricsAPI.stop
    }


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

            const config = {
                "basic": {
                    "light": {
                        "hex_color": parseInt(basic_light_color.value.slice(1), 16),
                        "opacity": 1.0
                    },
                    "dark": {
                        "hex_color": parseInt(basic_dark_color.value.slice(1), 16),
                        "opacity": 1.0
                    }
                },
                "extra": {
                    "light": {
                        "hex_color": parseInt(extra_light_color.value.slice(1), 16),
                        "opacity": 1.0
                    },
                    "dark": {
                        "hex_color": parseInt(extra_dark_color.value.slice(1), 16),
                        "opacity": 1.0
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
            basic_light_color.value = `#${defaultConfig.color.basic.light.hex_color.toString(16)}`;
            basic_dark_color.value = `#${defaultConfig.color.basic.dark.hex_color.toString(16)}`;
            extra_light_color.value = `#${defaultConfig.color.extra.light.hex_color.toString(16)}`;
            extra_dark_color.value = `#${defaultConfig.color.extra.dark.hex_color.toString(16)}`;
            plugin.setConfig("color", undefined);
            TaskbarLyricsAPI.color(defaultConfig.color);
        }
    }


    // 修改位置
    const position = {
        set: () => {
            const config = {
                "position": Number(event.target.value) || 0,
                "lock": true
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
        set: () => {
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
        set: () => {
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
        mainSwitch,
        fontFamily,
        fontColor,
        position,
        margin,
        textAlign,
        parentTaskbar
    ];
});
