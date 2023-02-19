"use strict";


plugin.onConfig(tools => {
    const [
        TaskbarLyricsAPI,
        WindowsEnum,
        defaultConfig,
        startTaskbarLyrics
    ] = [...this.index];

    const [
        mainSwitch,
        fontFamily,
        fontColor,
        position,
        margin,
        textAlign,
        parentTaskbar,
    ] = [...this.func];


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
                tools.makeBtn("开启", mainSwitch.on, true),
                tools.makeBtn("关闭", mainSwitch.off, true),
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
                tools.makeBtn("立即应用", fontFamily.set, true),
                tools.makeBtn("恢复默认", fontFamily.default, true)
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
                tools.makeBtn("立即应用", fontColor.set, true),
                tools.makeBtn("恢复默认", fontColor.default, true)
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
                tools.makeBtn("恢复默认", position.default, true)
            ),
            dom("div", {},
                dom("span", { innerText: "窗口位置：" }),
                tools.makeBtn("左", position.set, true, { value: WindowsEnum.WindowAlignment.WindowAlignmentLeft }),
                tools.makeBtn("中", position.set, true, { value: WindowsEnum.WindowAlignment.WindowAlignmentCenter }),
                tools.makeBtn("右", position.set, true, { value: WindowsEnum.WindowAlignment.WindowAlignmentRight })
            )
        ),

        dom("hr", {}),

        // 修改边距
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "修改边距：" }),
                tools.makeBtn("立即应用", margin.set, true),
                tools.makeBtn("恢复默认", margin.default, true)
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
                tools.makeBtn("恢复默认", textAlign.default, true)
            ),
            dom("div", {},
                dom("span", { innerText: "主歌词：" }),
                tools.makeBtn("左", textAlign.set, true, { value: ["basic", WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING] }),
                tools.makeBtn("中", textAlign.set, true, { value: ["basic", WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER] }),
                tools.makeBtn("右", textAlign.set, true, { value: ["basic", WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING] })
            ),
            dom("div", {},
                dom("span", { innerText: "副歌词：" }),
                tools.makeBtn("左", textAlign.set, true, { value: ["extra", WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING] }),
                tools.makeBtn("中", textAlign.set, true, { value: ["extra", WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER] }),
                tools.makeBtn("右", textAlign.set, true, { value: ["extra", WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING] })
            )
        ),

        dom("hr", {}),

        // 切换屏幕
        dom("section", {},
            dom("h1", {},
                dom("strong", { innerText: "切换屏幕：（实验功能，可能会移除）" }),
                tools.makeBtn("恢复默认", parentTaskbar.default, true)
            ),
            dom("div", {},
                dom("span", { innerText: "父任务栏：" }),
                tools.makeBtn("主屏幕", parentTaskbar.set, true, { value: "Shell_TrayWnd" }),
                tools.makeBtn("副屏幕", parentTaskbar.set, true, { value: "Shell_SecondaryTrayWnd" })
            )
        )
    )
});


plugin.onLoad(async () => {
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
});