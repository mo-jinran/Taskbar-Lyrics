"use strict";


const TaskbarLyricsPort = BETTERNCM_API_PORT + 1;

const TaskbarLyricsAPI = {
    lyrics(basic, extra) {
        const params = `basic=${basic}&extra=${extra}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsPort}/taskbar/lyrics?${new URLSearchParams(params)}`);
    },
    font(font_family) {
        const params = `font_family=${font_family}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsPort}/taskbar/font?${new URLSearchParams(params)}`);
    },
    color(light_basic, light_extra, dark_basic, dark_extra) {
        const params = `light_basic=${light_basic}&light_extra=${light_extra}&dark_basic=${dark_basic}&dark_extra=${dark_extra}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsPort}/taskbar/color?${new URLSearchParams(params)}`);
    },
    position(position, force_use) {
        const params = `position=${position}&force_use=${force_use}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsPort}/taskbar/position?${new URLSearchParams(params)}`);
    },
    align(basic, extra) {
        const params = `basic=${basic}&extra=${extra}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsPort}/taskbar/align?${new URLSearchParams(params)}`);
    },
    screen(parent_taskbar) {
        const params = `parent_taskbar=${parent_taskbar}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsPort}/taskbar/screen?${new URLSearchParams(params)}`);
    }
}

const TaskbarLyricsConfig = {
    lyrics: {
        get: () => plugin.getConfig("lyrics", {
            "basic": "成功连接到插件端",
            "extra": "等待下一句歌词"
        }),
        set(basic, extra) {
            plugin.setConfig("lyrics", {
                "basic": basic,
                "extra": extra
            });
        }
    },
    font: {
        get: () => plugin.getConfig("font", {
            "font_family": "Microsoft YaHei"
        }),
        set(font_family) {
            plugin.setConfig("font", {
                "font_family": font_family
            });
        }
    },
    color: {
        get: () => plugin.getConfig("color", {
            "light_basic": "000000",
            "light_extra": "000000",
            "dark_basic": "FFFFFF",
            "dark_extra": "FFFFFF"
        }),
        set(light_basic, light_extra, dark_basic, dark_extra) {
            plugin.setConfig("color", {
                "light_basic": light_basic,
                "light_extra": light_extra,
                "dark_basic": dark_basic,
                "dark_extra": dark_extra
            });
        }
    },
    position: {
        get: () => plugin.getConfig("position", {
            "position": "left",
            "force_use": false
        }),
        set(position, force_use) {
            plugin.setConfig("position", {
                "position": position,
                "force_use": force_use
            });
        }
    },
    align: {
        get: () => plugin.getConfig("align", {
            "basic": "left",
            "extra": "left"
        }),
        set(basic, extra) {
            plugin.setConfig("align", {
                "basic": basic,
                "extra": extra
            });
        }
    },
    screen: {
        get: () => plugin.getConfig("screen", {
            "parent_taskbar": "Shell_TrayWnd"
        }),
        set(parent_taskbar) {
            plugin.setConfig("screen", {
                "parent_taskbar": parent_taskbar
            });
        }
    }
}


// 监视软件内歌词变动
async function watchLyricsChange() {
    const mLyric = await betterncm.utils.waitForElement("#x-g-mn .m-lyric");
    new MutationObserver(mutations => {
        for (const mutation of mutations) {
            let basic = "";
            let extra = "";

            if (mutation.addedNodes[2]) {
                basic = mutation.addedNodes[0].firstChild.textContent;
                if (mutation.addedNodes[2].firstChild) {
                    extra = mutation.addedNodes[2].firstChild.textContent;
                }
            } else {
                basic = mutation.addedNodes[0].textContent;
            }

            TaskbarLyricsAPI.lyrics(basic, extra);
        }
    }).observe(mLyric, { childList: true, subtree: true });
}


// 更换字体
async function setFontFamily() {
    const font_family = document.querySelector("#font-font_name").value;
    TaskbarLyricsAPI.font(font_family);
    TaskbarLyricsConfig.font.set(font_family)
}


// 字体颜色
async function setFontColor() {
    const light_basic = document.querySelector("#color-light_basic").value;
    const light_extra = document.querySelector("#color-light_extra").value;
    const dark_basic = document.querySelector("#color-dark_basic").value;
    const dark_extra = document.querySelector("#color-dark_extra").value;
    TaskbarLyricsAPI.color(light_basic, light_extra, dark_basic, dark_extra);
    TaskbarLyricsConfig.color.set(light_basic, light_extra, dark_basic, dark_extra);
}


// 强制使用设置位置选项
async function forceUseSetWindowPositionOption(event) {
    const force_use = event.target.checked;
    const position = TaskbarLyricsConfig.position.get()["position"];
    TaskbarLyricsAPI.position(position, force_use);
    TaskbarLyricsConfig.position.set(position, force_use);
}


// 修改位置
async function setWindowPosition(event) {
    const position = event.target.value;
    const force_use = TaskbarLyricsConfig.position.get()["force_use"];
    TaskbarLyricsAPI.position(position, force_use);
    TaskbarLyricsConfig.position.set(position, force_use);
}


// 对齐方式
async function setTextAlign(event) {
    const type = event.target.value[0];
    const value = event.target.value[1];
    const basic = TaskbarLyricsConfig.align.get()["basic"];
    const extra = TaskbarLyricsConfig.align.get()["extra"];
    if (type == "basic") {
        TaskbarLyricsAPI.align(value, extra);
        TaskbarLyricsConfig.align.set(value, extra);
    }
    if (type == "extra") {
        TaskbarLyricsAPI.align(basic, value);
        TaskbarLyricsConfig.align.set(basic, value);
    }
}


// 切换屏幕
async function setParentTaskbar(event) {
    const parent_taskbar = event.target.value;
    TaskbarLyricsAPI.screen(parent_taskbar);
    TaskbarLyricsConfig.screen.set(parent_taskbar);
}


plugin.onConfig(tools => dom("div", {},
    // 更换字体
    dom("section", { style: { margin: "10px 0" } },
        dom("h1", { style: { fontSize: "initial" } },
            dom("strong", { innerText: "更换字体：", style: { fontWeight: "bold" } }),
            tools.makeBtn("立即应用", setFontFamily, true)
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "字体名称：" }),
            tools.makeInput(TaskbarLyricsConfig.font.get()["font_family"], { id: "font-font_name" })
        )
    ),

    // 字体颜色
    dom("section", { style: { margin: "10px 0" } },
        dom("h1", { style: { fontSize: "initial" } },
            dom("strong", { innerText: "字体颜色：", style: { fontWeight: "bold" } }),
            tools.makeBtn("立即应用", setFontColor, true),
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "浅色模式-基本歌词：" }),
            tools.makeInput(TaskbarLyricsConfig.color.get()["light_basic"], { id: "color-light_basic" })
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "浅色模式-扩展歌词：" }),
            tools.makeInput(TaskbarLyricsConfig.color.get()["light_extra"], { id: "color-light_extra" })
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "深色模式-基本歌词：" }),
            tools.makeInput(TaskbarLyricsConfig.color.get()["dark_basic"], { id: "color-dark_basic" })
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "深色模式-扩展歌词：" }),
            tools.makeInput(TaskbarLyricsConfig.color.get()["dark_extra"], { id: "color-dark_extra" })
        )
    ),

    // 修改位置
    dom("section", { style: { margin: "10px 0" } },
        dom("h1", { style: { fontSize: "initial" } },
            dom("strong", { innerText: "修改位置：", style: { fontWeight: "bold" } })
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "强制使用此选项：" }),
            tools.makeCheckbox({ onclick: forceUseSetWindowPositionOption })
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "窗口位置：" }),
            tools.makeBtn("左", setWindowPosition, true, { value: "left" }),
            tools.makeBtn("右", setWindowPosition, true, { value: "right" }),
        )
    ),

    // 对齐方式
    dom("section", { style: { margin: "10px 0" } },
        dom("h1", { style: { fontSize: "initial" } },
            dom("strong", { innerText: "对齐方式：", style: { fontWeight: "bold" } })
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "基本歌词：" }),
            tools.makeBtn("左", setTextAlign, true, { value: ["basic", "left"] }),
            tools.makeBtn("中", setTextAlign, true, { value: ["basic", "center"] }),
            tools.makeBtn("右", setTextAlign, true, { value: ["basic", "right"] })
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "扩展歌词：" }),
            tools.makeBtn("左", setTextAlign, true, { value: ["extra", "left"] }),
            tools.makeBtn("中", setTextAlign, true, { value: ["extra", "center"] }),
            tools.makeBtn("右", setTextAlign, true, { value: ["extra", "right"] }),
        )
    ),

    // 切换屏幕
    dom("section", { style: { margin: "10px 0" } },
        dom("h1", { style: { fontSize: "initial" } },
            dom("strong", { innerText: "切换屏幕：（实验功能，可能会移除）", style: { fontWeight: "bold" } })
        ),
        dom("div", { style: { margin: "5px 0" } },
            dom("span", { innerText: "父任务栏：" }),
            tools.makeBtn("主屏幕", setParentTaskbar, true, { value: "Shell_TrayWnd" }),
            tools.makeBtn("副屏幕", setParentTaskbar, true, { value: "Shell_SecondaryTrayWnd" }),
        )
    )
));


plugin.onLoad(async () => {
    watchLyricsChange();

    const basic_text = TaskbarLyricsConfig.lyrics.get()["basic"];
    const extra_text = TaskbarLyricsConfig.lyrics.get()["extra"];
    const font_family = TaskbarLyricsConfig.font.get()["font_family"];
    const light_basic = TaskbarLyricsConfig.color.get()["light_basic"];
    const light_extra = TaskbarLyricsConfig.color.get()["light_extra"];
    const dark_basic = TaskbarLyricsConfig.color.get()["dark_basic"];
    const dark_extra = TaskbarLyricsConfig.color.get()["dark_extra"];
    const position = TaskbarLyricsConfig.position.get()["position"];
    const force_use = TaskbarLyricsConfig.position.get()["force_use"];
    const basic_align = TaskbarLyricsConfig.align.get()["basic"];
    const extra_align = TaskbarLyricsConfig.align.get()["extra"];

    TaskbarLyricsAPI.lyrics(basic_text, extra_text);
    TaskbarLyricsAPI.font(font_family);
    TaskbarLyricsAPI.color(light_basic, light_extra, dark_basic, dark_extra);
    if (force_use) TaskbarLyricsAPI.position(position, force_use);
    TaskbarLyricsAPI.align(basic_align, extra_align);

    const exePath = `"${loadedPlugins["Taskbar-Lyrics"].pluginPath}\\taskbar-lyrics.exe"`;
    await betterncm.app.exec(`${exePath} ${TaskbarLyricsPort}`, false, true);
});
