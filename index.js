"use strict";


const TaskbarLyricsApiPort = BETTERNCM_API_PORT + 1;
const TaskbarLyricsAPI = {
    lyrics(basic, extra) {
        const params = `basic=${basic}&extra=${extra}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsApiPort}/taskbar/lyrics?${new URLSearchParams(params)}`);
    },
    font(font_family) {
        const params = `font_family=${font_family}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsApiPort}/taskbar/font?${new URLSearchParams(params)}`);
    },
    color(light_basic, light_extra, dark_basic, dark_extra) {
        const params = `light_basic=${light_basic}&light_extra=${light_extra}&dark_basic=${dark_basic}&dark_extra=${dark_extra}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsApiPort}/taskbar/color?${new URLSearchParams(params)}`);
    },
    screen(parent_taskbar) {
        const params = `parent_taskbar=${parent_taskbar}`;
        fetch(`http://127.0.0.1:${TaskbarLyricsApiPort}/taskbar/screen?${new URLSearchParams(params)}`);
    }
}


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


const setConfig = {
    parent_taskbar: event => plugin.setConfig("parent_taskbar", event.target.value),
    font_family: event => plugin.setConfig("font_family", event.target.value),
    light_basic: event => plugin.setConfig("light_basic", event.target.value),
    light_extra: event => plugin.setConfig("light_extra", event.target.value),
    dark_basic: event => plugin.setConfig("dark_basic", event.target.value),
    dark_extra: event => plugin.setConfig("dark_extra", event.target.value)
}


async function setParentTaskbar(event) {
    setConfig.parent_taskbar(event);
    const parent_taskbar = plugin.getConfig("parent_taskbar", "Shell_TrayWnd");
    TaskbarLyricsAPI.screen(parent_taskbar)
}


async function setFontFamily() {
    const font_family = plugin.getConfig("font_family", "Microsoft YaHei");
    TaskbarLyricsAPI.font(font_family);
}


async function setFontColor() {
    const light_basic = plugin.getConfig("light_basic", "000000");
    const light_extra = plugin.getConfig("light_extra", "000000");
    const dark_basic = plugin.getConfig("dark_basic", "FFFFFF");
    const dark_extra = plugin.getConfig("dark_extra", "FFFFFF");
    TaskbarLyricsAPI.color(light_basic, light_extra, dark_basic, dark_extra);
}


plugin.onConfig(tools => dom("div", {},
    dom("div", { style: { margin: "10px 0" } },
        dom("h2", { style: { fontSize: "initial" } },
            dom("strong", { innerText: "切换任务栏：（实验功能，可能会移除）", style: { fontWeight: "bold" } })
        ),
        dom("div", { style: { margin: "4px 0" } },
            tools.makeBtn("主屏幕任务栏", setParentTaskbar, true, { value: "Shell_TrayWnd" }),
            tools.makeBtn("副屏幕任务栏", setParentTaskbar, true, { value: "Shell_SecondaryTrayWnd" }),
        )
    ),
    dom("div", { style: { margin: "10px 0" } },
        dom("h2", { style: { fontSize: "initial" } },
            dom("strong", { innerText: "更换字体：", style: { fontWeight: "bold" } }),
            tools.makeBtn("立即应用", setFontFamily, true)
        ),
        dom("div", { style: { margin: "4px 0" } },
            dom("span", { innerText: "字体名称：" }),
            tools.makeInput(plugin.getConfig("font_family"), { oninput: setConfig.font_family })
        )
    ),
    dom("div", { style: { margin: "10px 0" } },
        dom("h2", { style: { fontSize: "initial" } },
            dom("strong", { innerText: "字体颜色：", style: { fontWeight: "bold" } }),
            tools.makeBtn("立即应用", setFontColor, true),
        ),
        dom("div", { style: { margin: "4px 0" } },
            dom("span", { innerText: "浅色模式-基本歌词：" }),
            tools.makeInput(plugin.getConfig("light_basic"), { oninput: setConfig.light_basic })
        ),
        dom("div", { style: { margin: "4px 0" } },
            dom("span", { innerText: "浅色模式-扩展歌词：" }),
            tools.makeInput(plugin.getConfig("light_extra"), { oninput: setConfig.light_extra })
        ),
        dom("div", { style: { margin: "4px 0" } },
            dom("span", { innerText: "深色模式-基本歌词：" }),
            tools.makeInput(plugin.getConfig("dark_basic"), { oninput: setConfig.dark_basic })
        ),
        dom("div", { style: { margin: "4px 0" } },
            dom("span", { innerText: "深色模式-扩展歌词：" }),
            tools.makeInput(plugin.getConfig("dark_extra"), { oninput: setConfig.dark_extra })
        )
    )
));


plugin.onLoad(async () => {
    plugin.setConfig("parent_taskbar", plugin.getConfig("parent_taskbar", "Shell_TrayWnd"));
    plugin.setConfig("font_family", plugin.getConfig("font_family", "Microsoft YaHei"));
    plugin.setConfig("light_basic", plugin.getConfig("light_basic", "000000"));
    plugin.setConfig("light_extra", plugin.getConfig("light_extra", "000000"));
    plugin.setConfig("dark_basic", plugin.getConfig("dark_basic", "FFFFFF"));
    plugin.setConfig("dark_extra", plugin.getConfig("dark_extra", "FFFFFF"));

    watchLyricsChange();
    setFontFamily();
    setFontColor();

    const exePath = `"${loadedPlugins["Taskbar-Lyrics"].pluginPath}\\taskbar-lyrics.exe"`;
    await betterncm.app.exec(`${exePath} ${TaskbarLyricsApiPort}`, false, true);
});
