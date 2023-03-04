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
            const config = JSON.parse(JSON.stringify(plugin.getConfig("font", defaultConfig.font)));
            config.font_family = document.querySelector("#font_family").value;
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
            const config = JSON.parse(JSON.stringify(plugin.getConfig("color", defaultConfig.color)));
            config.basic.light.hex_color = parseInt(document.querySelector("#basic_light_color").value.slice(1), 16);
            config.basic.light.opacity = Number(document.querySelector("#basic_light_opacity").value);
            config.basic.dark.hex_color = parseInt(document.querySelector("#basic_dark_color").value.slice(1), 16);
            config.basic.dark.opacity = Number(document.querySelector("#basic_dark_opacity").value);
            config.extra.light.hex_color = parseInt(document.querySelector("#extra_light_color").value.slice(1), 16);
            config.extra.light.opacity = Number(document.querySelector("#extra_light_opacity").value);
            config.extra.dark.hex_color = parseInt(document.querySelector("#extra_dark_color").value.slice(1), 16);
            config.extra.dark.opacity = Number(document.querySelector("#extra_dark_opacity").value);
            plugin.setConfig("color", config);
            TaskbarLyricsAPI.color(config);
        },
        default: () => {
            document.querySelector("#basic_light_color").value = `#${defaultConfig.color.basic.light.hex_color.toString(16).padStart(6, "0")}`;
            document.querySelector("#basic_light_opacity").value = defaultConfig.color.basic.light.opacity;
            document.querySelector("#basic_dark_color").value = `#${defaultConfig.color.basic.dark.hex_color.toString(16).padStart(6, "0")}`;
            document.querySelector("#basic_dark_opacity").value = defaultConfig.color.basic.dark.opacity;
            document.querySelector("#extra_light_color").value = `#${defaultConfig.color.extra.light.hex_color.toString(16).padStart(6, "0")}`;
            document.querySelector("#extra_light_opacity").value = defaultConfig.color.extra.light.opacity;
            document.querySelector("#extra_dark_color").value = `#${defaultConfig.color.extra.dark.hex_color.toString(16).padStart(6, "0")}`;
            document.querySelector("#extra_dark_opacity").value = defaultConfig.color.extra.dark.opacity;
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
        // 斜体
        setSlope: event => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config[event.target.name].slope = event.target.value || 0;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        // 下划线
        setUnderline: event => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
            config[event.target.name].underline = event.target.checked;
            plugin.setConfig("style", config);
            TaskbarLyricsAPI.style(config);
        },
        // 删除线
        setStrikethrough: event => {
            const config = JSON.parse(JSON.stringify(plugin.getConfig("style", defaultConfig.style)));
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
            const config = JSON.parse(JSON.stringify(plugin.getConfig("position", defaultConfig.position)));
            config.position = Number(event.target.value) || 0;
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
            const config = JSON.parse(JSON.stringify(plugin.getConfig("margin", defaultConfig.position)));
            config.left = Number(document.querySelector("#left").value);
            config.right = Number(document.querySelector("#right").value);
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
            const config = JSON.parse(JSON.stringify(plugin.getConfig("align", defaultConfig.align)));
            config.basic = event.target.name == "basic" ? Number(event.target.value) : plugin.getConfig("align", defaultConfig.align)["basic"]
            config.extra = event.target.name == "extra" ? Number(event.target.value) : plugin.getConfig("align", defaultConfig.align)["extra"]
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
            const config = JSON.parse(JSON.stringify(plugin.getConfig("screen", defaultConfig.screen)));
            config.parent_taskbar = event.target.value;
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
