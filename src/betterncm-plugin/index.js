"use strict";


const TaskbarLyricsPort = BETTERNCM_API_PORT + 2;
const TaskbarLyricsURL = `http://127.0.0.1:${TaskbarLyricsPort}/taskbar`;
const TaskbarLyricsAPI = {
    async lyrics(basic, extra) {
        const params = `basic=${basic}&extra=${extra}`;
        return fetch(`${TaskbarLyricsURL}/lyrics?${new URLSearchParams(params)}`);
    },
    async font(font_family) {
        const params = `font_family=${font_family}`;
        return fetch(`${TaskbarLyricsURL}/font?${new URLSearchParams(params)}`);
    },
    async style(basic, extra) {
        const params = `basic=${basic}&extra=${extra}`;
        return fetch(`${TaskbarLyricsURL}/style?${new URLSearchParams(params)}`);
    },
    async color(light_basic, light_extra, dark_basic, dark_extra) {
        const params = `light_basic=${light_basic}&light_extra=${light_extra}&dark_basic=${dark_basic}&dark_extra=${dark_extra}`;
        return fetch(`${TaskbarLyricsURL}/color?${new URLSearchParams(params)}`);
    },
    async position(position, lock) {
        const params = `position=${position}&lock=${lock}`;
        return fetch(`${TaskbarLyricsURL}/position?${new URLSearchParams(params)}`);
    },
    async align(basic, extra) {
        const params = `basic=${basic}&extra=${extra}`;
        return fetch(`${TaskbarLyricsURL}/align?${new URLSearchParams(params)}`);
    },
    async screen(parent_taskbar) {
        const params = `parent_taskbar=${parent_taskbar}`;
        return fetch(`${TaskbarLyricsURL}/screen?${new URLSearchParams(params)}`);
    },
    async start() {
        return fetch(`${TaskbarLyricsURL}/start`);
    },
    async stop() {
        return fetch(`${TaskbarLyricsURL}/stop`);
    }
};


const defaultConfig = {
    font: {
        "font_family": "Microsoft YaHei"
    },
    style: {
        "basic": "Regular",
        "extra": "Regular"
    },
    color: {
        "light_basic": "000000",
        "light_extra": "000000",
        "dark_basic": "FFFFFF",
        "dark_extra": "FFFFFF"
    },
    position: {
        "position": "left",
        "lock": "false"
    },
    align: {
        "basic": "left",
        "extra": "left"
    },
    screen: {
        "parent_taskbar": "Shell_TrayWnd"
    }
};


// 启动歌词
async function startTaskbarLyrics() {
    const path = `"${loadedPlugins["Taskbar-Lyrics"].pluginPath}\\taskbar-lyrics.exe"`;
    await betterncm.app.exec(`${path} ${TaskbarLyricsPort}`, false, true);
    TaskbarLyricsAPI.start();
    setConfigs();
}


// 更换字体
async function setFontFamily() {
    const config = {
        "font_family": document.querySelector("#font_family").value
    };
    plugin.setConfig("font", config);
    TaskbarLyricsAPI.font(config.font_family);
}

async function defaultFontFamily() {
    plugin.setConfig("font", undefined);
    TaskbarLyricsAPI.font(defaultConfig.font.font_family);
    document.querySelector("#font_family").value = defaultConfig.font.font_family;
}


// 字体样式
async function setFontStyle(event) {
    const config = {
        "basic": event.target.value[0] == "basic" ? event.target.value[1] : plugin.getConfig("style", defaultConfig.style)["basic"],
        "extra": event.target.value[0] == "extra" ? event.target.value[1] : plugin.getConfig("style", defaultConfig.style)["extra"]
    };
    plugin.setConfig("style", config);
    TaskbarLyricsAPI.style(config.basic, config.extra);
}

async function defaultFontStyle() {
    plugin.setConfig("style", undefined);
    TaskbarLyricsAPI.style(defaultConfig.style.basic, defaultConfig.style.extra);
}


// 字体颜色
async function setFontColor() {
    const config = {
        "light_basic": document.querySelector("#light_basic").value,
        "light_extra": document.querySelector("#light_extra").value,
        "dark_basic": document.querySelector("#dark_basic").value,
        "dark_extra": document.querySelector("#dark_extra").value
    };
    plugin.setConfig("color", config);
    TaskbarLyricsAPI.color(
        config.light_basic,
        config.light_extra,
        config.dark_basic,
        config.dark_extra
    );
}

async function defaultFontColor() {
    plugin.setConfig("color", undefined);
    TaskbarLyricsAPI.color(
        defaultConfig.color.light_basic,
        defaultConfig.color.light_extra,
        defaultConfig.color.dark_basic,
        defaultConfig.color.dark_extra
    );
    document.querySelector("#light_basic").value = defaultConfig.color.light_basic;
    document.querySelector("#light_extra").value = defaultConfig.color.light_extra;
    document.querySelector("#dark_basic").value = defaultConfig.color.dark_basic;
    document.querySelector("#dark_extra").value = defaultConfig.color.dark_extra;
}


// 修改位置
async function setWindowPosition(event) {
    const config = {
        "position": event.target.value,
        "lock": "true"
    };
    plugin.setConfig("position", config);
    TaskbarLyricsAPI.position(config.position, config.lock);
}

async function defaultWindowPosition() {
    plugin.setConfig("position", undefined);
    TaskbarLyricsAPI.position(defaultConfig.position.position, defaultConfig.position.lock);
}


// 对齐方式
async function setTextAlign(event) {
    const config = {
        "basic": event.target.value[0] == "basic" ? event.target.value[1] : plugin.getConfig("align", defaultConfig.align)["basic"],
        "extra": event.target.value[0] == "extra" ? event.target.value[1] : plugin.getConfig("align", defaultConfig.align)["extra"],
    };
    plugin.setConfig("align", config);
    TaskbarLyricsAPI.align(config.basic, config.extra);
}

async function defaultTextAlign() {
    plugin.setConfig("align", undefined);
    TaskbarLyricsAPI.align(defaultConfig.align.basic, defaultConfig.align.extra);
}


// 切换屏幕
async function setParentTaskbar(event) {
    const config = {
        "parent_taskbar": event.target.value
    };
    plugin.setConfig("screen", config);
    TaskbarLyricsAPI.screen(config.parent_taskbar);
}

async function defaultParentTaskbar() {
    plugin.setConfig("screen", undefined);
    TaskbarLyricsAPI.screen(defaultConfig.screen.parent_taskbar);
}


async function setConfigs() {
    plugin.getConfig("font", false) && TaskbarLyricsAPI.font(
        plugin.getConfig("font", defaultConfig.font)["font_family"]
    );

    plugin.getConfig("style", false) && TaskbarLyricsAPI.style(
        plugin.getConfig("style", defaultConfig.style)["basic"],
        plugin.getConfig("style", defaultConfig.style)["extra"]
    );

    plugin.getConfig("color", false) && TaskbarLyricsAPI.color(
        plugin.getConfig("color", defaultConfig.color)["light_basic"],
        plugin.getConfig("color", defaultConfig.color)["light_extra"],
        plugin.getConfig("color", defaultConfig.color)["dark_basic"],
        plugin.getConfig("color", defaultConfig.color)["dark_extra"]
    );

    plugin.getConfig("position", false) && TaskbarLyricsAPI.position(
        plugin.getConfig("position", defaultConfig.position)["position"],
        plugin.getConfig("position", defaultConfig.position)["lock"]
    );

    plugin.getConfig("align", false) && TaskbarLyricsAPI.align(
        plugin.getConfig("align", defaultConfig.align)["basic"],
        plugin.getConfig("align", defaultConfig.align)["extra"]
    );

    plugin.getConfig("screen", false) && TaskbarLyricsAPI.screen(
        plugin.getConfig("screen", defaultConfig.screen)["parent_taskbar"]
    );
}


plugin.onConfig(tools => {
    // 输入框
    const createInput = (key, value) => tools.makeInput(
        plugin.getConfig(key, defaultConfig[key])[value],
        { id: value }
    );

    return dom("div", { id: "taskbar-lyrics-dom" },
        // 歌词设置
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "歌词设置：" })
            ),
            dom("div", {},
                dom("span", { innerText: "歌词开关：" }),
                tools.makeBtn("开启", startTaskbarLyrics, true),
                tools.makeBtn("关闭", TaskbarLyricsAPI.stop, true),
                dom("p", { innerText: "不要点太快，玩坏了请自己寻找解决方法" }),
            ),
            dom("div", {},
                dom("span", { innerText: "歌词修改：" }),
                dom("p", { innerText: "目前插件从 [软件内词栏] 获取歌词传递给 [任务栏歌词] 程序" }),
                dom("p", { innerText: "只需要修改 [设置-歌词-启用] 中的 [最后两个选项] 即可修改" }),
                dom("p", { innerText: "不过启用或者关闭 [软件内词栏] 选项对插件是没有任何影响的" }),
                dom("p", { innerText: "未来修改歌词获取方式从 [软件内词栏] 换为同类型插件的方式" })
            ),
        ),

        dom("hr", {}),

        // 更换字体
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "字体更换：" }),
                tools.makeBtn("立即应用", setFontFamily, true),
                tools.makeBtn("恢复默认", defaultFontFamily, true)
            ),
            dom("div", {},
                dom("span", { innerText: "字体名称：" }),
                createInput("font", "font_family")
            )
        ),

        dom("hr", {}),

        // 字体样式
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "字体样式：" }),
                tools.makeBtn("恢复默认", defaultFontStyle, true)
            ),
            dom("div", {},
                dom("span", { innerText: "基本歌词：" }),
                tools.makeBtn("正常", setFontStyle, true, { value: ["basic", "Regular"] }),
                tools.makeBtn("粗", setFontStyle, true, { value: ["basic", "Bold"] }),
                tools.makeBtn("斜", setFontStyle, true, { value: ["basic", "Italic"] }),
                tools.makeBtn("既粗又斜", setFontStyle, true, { value: ["basic", "BoldItalic"] }),
                tools.makeBtn("下划线", setFontStyle, true, { value: ["basic", "Underline"] }),
                tools.makeBtn("删除线", setFontStyle, true, { value: ["basic", "Strikeout"] })
            ),
            dom("div", {},
                dom("span", { innerText: "扩展歌词：" }),
                tools.makeBtn("正常", setFontStyle, true, { value: ["extra", "Regular"] }),
                tools.makeBtn("粗", setFontStyle, true, { value: ["extra", "Bold"] }),
                tools.makeBtn("斜", setFontStyle, true, { value: ["extra", "Italic"] }),
                tools.makeBtn("既粗又斜", setFontStyle, true, { value: ["extra", "BoldItalic"] }),
                tools.makeBtn("下划线", setFontStyle, true, { value: ["extra", "Underline"] }),
                tools.makeBtn("删除线", setFontStyle, true, { value: ["extra", "Strikeout"] })
            )
        ),

        dom("hr", {}),

        // 字体颜色
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "字体颜色：" }),
                tools.makeBtn("立即应用", setFontColor, true),
                tools.makeBtn("恢复默认", defaultFontColor, true)
            ),
            dom("div", {},
                dom("span", { innerText: "浅色模式-基本歌词：" }),
                createInput("color", "light_basic")
            ),
            dom("div", {},
                dom("span", { innerText: "浅色模式-扩展歌词：" }),
                createInput("color", "light_extra")
            ),
            dom("div", {},
                dom("span", { innerText: "深色模式-基本歌词：" }),
                createInput("color", "dark_basic")
            ),
            dom("div", {},
                dom("span", { innerText: "深色模式-扩展歌词：" }),
                createInput("color", "dark_extra")
            )
        ),

        dom("hr", {}),

        // 修改位置
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "修改位置：" }),
                tools.makeBtn("恢复默认", defaultWindowPosition, true)
            ),
            dom("div", {},
                dom("span", { innerText: "窗口位置：" }),
                tools.makeBtn("左", setWindowPosition, true, { value: "left" }),
                tools.makeBtn("右", setWindowPosition, true, { value: "right" })
            )
        ),

        dom("hr", {}),

        // 对齐方式
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "对齐方式：" }),
                tools.makeBtn("恢复默认", defaultTextAlign, true)
            ),
            dom("div", {},
                dom("span", { innerText: "基本歌词：" }),
                tools.makeBtn("左", setTextAlign, true, { value: ["basic", "left"] }),
                tools.makeBtn("中", setTextAlign, true, { value: ["basic", "center"] }),
                tools.makeBtn("右", setTextAlign, true, { value: ["basic", "right"] })
            ),
            dom("div", {},
                dom("span", { innerText: "扩展歌词：" }),
                tools.makeBtn("左", setTextAlign, true, { value: ["extra", "left"] }),
                tools.makeBtn("中", setTextAlign, true, { value: ["extra", "center"] }),
                tools.makeBtn("右", setTextAlign, true, { value: ["extra", "right"] })
            )
        ),

        dom("hr", {}),

        // 切换屏幕
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "切换屏幕：（实验功能，可能会移除）" }),
                tools.makeBtn("恢复默认", defaultParentTaskbar, true)
            ),
            dom("div", {},
                dom("span", { innerText: "父任务栏：" }),
                tools.makeBtn("主屏幕", setParentTaskbar, true, { value: "Shell_TrayWnd" }),
                tools.makeBtn("副屏幕", setParentTaskbar, true, { value: "Shell_SecondaryTrayWnd" })
            )
        )
    )
});


// 监视软件内歌词变动
async function watchLyricsChange() {
    const mLyric = await betterncm.utils.waitForElement("#x-g-mn .m-lyric");
    new MutationObserver(mutations => {
        for (const mutation of mutations) {
            let basic = "";
            let extra = "";

            if (mutation.addedNodes[2]) {
                basic = mutation.addedNodes[0].firstChild.textContent;
                extra = mutation.addedNodes[2].firstChild ? mutation.addedNodes[2].firstChild.textContent : "";
            } else {
                basic = mutation.addedNodes[0].textContent;
            }

            TaskbarLyricsAPI.lyrics(basic, extra);
        }
    }).observe(mLyric, { childList: true, subtree: true });
}


async function styleLoader() {
    const cssText = `
    #taskbar-lyrics-dom h1 {
        font-size: 1.25rem;
    }

    #taskbar-lyrics-dom h1 strong {
        font-weight: bold;
    }

    #taskbar-lyrics-dom hr {
        margin: 20px 0;
        border: none;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.2);
    }

    #taskbar-lyrics-dom div {
        margin: 5px 0;
    }

    #taskbar-lyrics-dom p {
        margin: 5px 0;
    }`;
    const style = document.createElement("style");
    style.innerHTML = cssText;
    document.head.appendChild(style);
}


plugin.onLoad(async () => {
    addEventListener("beforeunload", TaskbarLyricsAPI.stop);
    startTaskbarLyrics()
    watchLyricsChange();
    styleLoader();
});
