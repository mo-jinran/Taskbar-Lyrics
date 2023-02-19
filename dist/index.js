"use strict";


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
    position: params => TaskbarLyricsFetch("/position", params),
    margin: params => TaskbarLyricsFetch("/margin", params),
    align: params => TaskbarLyricsFetch("/align", params),
    screen: params => TaskbarLyricsFetch("/screen", params),
    start: () => TaskbarLyricsFetch("/start", {}),
    stop: () => TaskbarLyricsFetch("/stop", {})
};


// 对应Windows的枚举
const WindowAlignment = {
    WindowAlignmentLeft: 0,
    WindowAlignmentCenter: 1,
    WindowAlignmentRight: 2
};

const DWRITE_TEXT_ALIGNMENT = {
    DWRITE_TEXT_ALIGNMENT_LEADING: 0,
    DWRITE_TEXT_ALIGNMENT_TRAILING: 1,
    DWRITE_TEXT_ALIGNMENT_CENTER: 2,
    DWRITE_TEXT_ALIGNMENT_JUSTIFIED: 3
};


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
    "position": {
        "position": WindowAlignment.WindowAlignmentLeft,
        "lock": false
    },
    "margin": {
        "left": 0,
        "right": 0
    },
    "align": {
        "basic": DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING,
        "extra": DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING
    },
    "screen": {
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
    TaskbarLyricsAPI.font(config);
}

async function defaultFontFamily() {
    plugin.setConfig("font", undefined);
    TaskbarLyricsAPI.font(defaultConfig.font);
    document.querySelector("#font_family").value = defaultConfig.font.font_family;
}


// 字体颜色
async function setFontColor() {
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
}

async function defaultFontColor() {
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


// 修改位置
async function setPosition(event) {
    const config = {
        "position": Number(event.target.value) || 0,
        "lock": true
    };
    plugin.setConfig("position", config);
    TaskbarLyricsAPI.position(config);
}

async function defaultPosition() {
    plugin.setConfig("position", undefined);
    TaskbarLyricsAPI.position(defaultConfig.position);
}


// 修改边距
async function setMargin() {
    const config = {
        "left": Number(document.querySelector("#left").value),
        "right": Number(document.querySelector("#right").value)
    };
    plugin.setConfig("margin", config);
    TaskbarLyricsAPI.margin(config);
}

async function defaultMargin() {
    plugin.setConfig("margin", undefined);
    TaskbarLyricsAPI.margin(defaultConfig.margin);
    document.querySelector("#left").value = defaultConfig.margin.left;
    document.querySelector("#right").value = defaultConfig.margin.right;
}


// 对齐方式
async function setTextAlign(event) {
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
}

async function defaultTextAlign() {
    plugin.setConfig("align", undefined);
    TaskbarLyricsAPI.align(defaultConfig.align);
}


// 切换屏幕
async function setParentTaskbar(event) {
    const config = {
        "parent_taskbar": event.target.value
    };
    plugin.setConfig("screen", config);
    TaskbarLyricsAPI.screen(config);
}

async function defaultParentTaskbar() {
    plugin.setConfig("screen", undefined);
    TaskbarLyricsAPI.screen(defaultConfig.screen);
}


async function setConfigs() {
    plugin.getConfig("font", false) && TaskbarLyricsAPI.font(
        plugin.getConfig("font", defaultConfig.font)
    );

    plugin.getConfig("color", false) && TaskbarLyricsAPI.color(
        plugin.getConfig("color", defaultConfig.color)
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
}


plugin.onConfig(tools => {
    // 输入框
    const createInput = (key, value, type) => tools.makeInput(
        plugin.getConfig(key, defaultConfig[key])[value],
        { id: value, type: type }
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
                createInput("font", "font_family", "text")
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
                dom("span", { innerText: "主歌词-浅色模式：" }),
                createInput("color", "basic_light_color", "color")
            ),
            dom("div", {},
                dom("span", { innerText: "主歌词-深色模式" }),
                createInput("color", "basic_dark_color", "color")
            ),
            dom("div", {},
                dom("span", { innerText: "副歌词-浅色模式：" }),
                createInput("color", "extra_light_color", "color")
            ),
            dom("div", {},
                dom("span", { innerText: "副歌词-深色模式：" }),
                createInput("color", "extra_dark_color", "color")
            )
        ),

        dom("hr", {}),

        // 修改位置
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "修改位置：" }),
                tools.makeBtn("恢复默认", defaultPosition, true)
            ),
            dom("div", {},
                dom("span", { innerText: "窗口位置：" }),
                tools.makeBtn("左", setPosition, true, { value: WindowAlignment.WindowAlignmentLeft }),
                tools.makeBtn("中", setPosition, true, { value: WindowAlignment.WindowAlignmentCenter }),
                tools.makeBtn("右", setPosition, true, { value: WindowAlignment.WindowAlignmentRight })
            )
        ),

        dom("hr", {}),

        // 修改边距
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "修改边距：" }),
                tools.makeBtn("立即应用", setMargin, true),
                tools.makeBtn("恢复默认", defaultMargin, true)
            ),
            dom("div", {},
                dom("span", { innerText: "左边距：" }),
                createInput("margin", "left", "number")
            ),
            dom("div", {},
                dom("span", { innerText: "右边距：" }),
                createInput("margin", "right", "number")
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
                dom("span", { innerText: "主歌词：" }),
                tools.makeBtn("左", setTextAlign, true, { value: ["basic", DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING] }),
                tools.makeBtn("中", setTextAlign, true, { value: ["basic", DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER] }),
                tools.makeBtn("右", setTextAlign, true, { value: ["basic", DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING] })
            ),
            dom("div", {},
                dom("span", { innerText: "副歌词：" }),
                tools.makeBtn("左", setTextAlign, true, { value: ["extra", DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING] }),
                tools.makeBtn("中", setTextAlign, true, { value: ["extra", DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER] }),
                tools.makeBtn("右", setTextAlign, true, { value: ["extra", DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING] })
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

    #taskbar-lyrics-dom div p {
        margin: 5px 0;
    }

    #taskbar-lyrics-dom div input[type="color"] {
        padding: unset;
    }`;
    const style = document.createElement("style");
    style.innerHTML = cssText;
    document.head.appendChild(style);
}


plugin.onLoad(async () => {
    addEventListener("beforeunload", TaskbarLyricsAPI.stop);
    startTaskbarLyrics();
    watchLyricsChange();
    styleLoader();
});
