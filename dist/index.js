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


plugin.onConfig(tools => {
    // 自己的创建输入框
    const createInput = (key, value) => tools.makeInput(
        plugin.getConfig(key, defaultConfig[key])[value],
        { id: value }
    );

    return dom("div", {},
        // 更换字体
        dom("section", {},
            dom("h1", { style: { fontSize: "initial" } },
                dom("strong", { innerText: "更换字体：", style: { fontWeight: "bold" } }),
                tools.makeBtn("立即应用", setFontFamily, true),
                tools.makeBtn("恢复默认", defaultFontFamily, true)
            ),
            dom("div", { style: { margin: "5px 0" } },
                dom("span", { innerText: "字体名称：" }),
                createInput("font", "font_family"),
            )
        ),

        dom("br", {}),

        // 字体颜色
        dom("section", {},
            dom("h1", { style: { fontSize: "initial" } },
                dom("strong", { innerText: "字体颜色：", style: { fontWeight: "bold" } }),
                tools.makeBtn("立即应用", setFontColor, true),
                tools.makeBtn("恢复默认", defaultFontColor, true)
            ),
            dom("div", { style: { margin: "5px 0" } },
                dom("span", { innerText: "浅色模式-基本歌词：" }),
                createInput("color", "light_basic"),
            ),
            dom("div", { style: { margin: "5px 0" } },
                dom("span", { innerText: "浅色模式-扩展歌词：" }),
                createInput("color", "light_extra"),
            ),
            dom("div", { style: { margin: "5px 0" } },
                dom("span", { innerText: "深色模式-基本歌词：" }),
                createInput("color", "dark_basic"),
            ),
            dom("div", { style: { margin: "5px 0" } },
                dom("span", { innerText: "深色模式-扩展歌词：" }),
                createInput("color", "dark_extra"),
            )
        ),

        dom("br", {}),

        // 修改位置
        dom("section", {},
            dom("h1", { style: { fontSize: "initial" } },
                dom("strong", { innerText: "修改位置：", style: { fontWeight: "bold" } }),
                tools.makeBtn("恢复默认", defaultWindowPosition, true)
            ),
            dom("div", { style: { margin: "5px 0" } },
                dom("span", { innerText: "窗口位置：" }),
                tools.makeBtn("左", setWindowPosition, true, { value: "left" }),
                tools.makeBtn("右", setWindowPosition, true, { value: "right" }),
            )
        ),

        dom("br", {}),

        // 对齐方式
        dom("section", {},
            dom("h1", { style: { fontSize: "initial" } },
                dom("strong", { innerText: "对齐方式：", style: { fontWeight: "bold" } }),
                tools.makeBtn("恢复默认", defaultTextAlign, true)
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

        dom("br", {}),

        // 切换屏幕
        dom("section", {},
            dom("h1", { style: { fontSize: "initial" } },
                dom("strong", { innerText: "切换屏幕：（实验功能，可能会移除）", style: { fontWeight: "bold" } }),
                tools.makeBtn("恢复默认", defaultParentTaskbar, true)
            ),
            dom("div", { style: { margin: "5px 0" } },
                dom("span", { innerText: "父任务栏：" }),
                tools.makeBtn("主屏幕", setParentTaskbar, true, { value: "Shell_TrayWnd" }),
                tools.makeBtn("副屏幕", setParentTaskbar, true, { value: "Shell_SecondaryTrayWnd" }),
            )
        )
    )
});


plugin.onLoad(async () => {
    // 启动程序
    const exePath = `"${loadedPlugins["Taskbar-Lyrics"].pluginPath}\\taskbar-lyrics.exe"`;
    await betterncm.app.exec(`${exePath} ${TaskbarLyricsPort}`, false, true);

    TaskbarLyricsAPI.start();
    addEventListener("beforeunload", TaskbarLyricsAPI.stop);
    watchLyricsChange();

    const getConfig = (key, none) => plugin.getConfig(
        key,
        none ? defaultConfig[key] : false
    );

    if (getConfig("font", false)) {
        TaskbarLyricsAPI.font(
            getConfig("font", true)["font_family"]
        );
    }

    if (getConfig("color", false)) {
        TaskbarLyricsAPI.color(
            getConfig("color", true)["light_basic"],
            getConfig("color", true)["light_extra"],
            getConfig("color", true)["dark_basic"],
            getConfig("color", true)["dark_extra"]
        );
    }

    if (getConfig("position", false)) {
        TaskbarLyricsAPI.position(
            getConfig("position", true)["position"],
            getConfig("position", true)["lock"]
        );
    }

    if (getConfig("align", false)) {
        TaskbarLyricsAPI.align(
            getConfig("align", true)["basic"],
            getConfig("align", true)["extra"]
        );
    }

    if (getConfig("screen", false)) {
        TaskbarLyricsAPI.screen(
            getConfig("screen", true)["parent_taskbar"]
        );
    }
});
