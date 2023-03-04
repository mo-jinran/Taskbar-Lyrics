"use strict";


plugin.onConfig(tools => {
    const {
        WindowsEnum,
        defaultConfig
    } = { ...this.index };

    const {
        onload,
        masterSwitch,
        fontFamily,
        fontColor,
        fontStyle,
        position,
        margin,
        textAlign,
        parentTaskbar,
    } = { ...this.func };


    // 界面样式
    const cssFilePath = `${this.pluginPath}/style.css`;
    betterncm.fs.readFileText(cssFilePath).then(cssText => {
        const cssStyle = dom("style", { textContent: cssText });
        document.head.appendChild(cssStyle);
    });


    // dom函数被文档标注为弃用
    // 考虑以后换成其他方式
    return dom("div", { id: "taskbar-lyrics-dom" },
        // 歌词设置
        dom("section", {},
            dom("h1", {},
                dom("strong", { textContent: "歌词设置：" })
            ),
            dom("div", {},
                dom("span", { textContent: "歌词开关：" }),
                tools.makeCheckbox({ checked: true, onchange: masterSwitch }),
            )
        ),

        dom("hr", {}),

        // 更换字体
        dom("section", {},
            dom("h1", {},
                dom("strong", { textContent: "字体更换：" }),
                tools.makeBtn("立即应用", fontFamily.set, true),
                tools.makeBtn("恢复默认", fontFamily.default, true)
            ),
            dom("div", {},
                dom("span", { textContent: "字体名称：" }),
                tools.makeInput(
                    plugin.getConfig("font", defaultConfig["font"])["font_family"],
                    { id: "font_family", type: "text" }
                )
            )
        ),

        dom("hr", {}),

        // 字体颜色
        dom("section", {},
            dom("h1", {},
                dom("strong", { textContent: "字体颜色：" }),
                tools.makeBtn("立即应用", fontColor.set, true),
                tools.makeBtn("恢复默认", fontColor.default, true)
            ),
            dom("div", {},
                dom("span", { textContent: "主歌词-浅色模式：" }),
                tools.makeInput(
                    `#${plugin.getConfig("color", defaultConfig["color"])["basic"]["light"]["hex_color"].toString(16)}`,
                    { id: "basic_light_color", type: "color" }
                ),
                dom("span", { textContent: "透明度：" }),
                tools.makeInput(
                    `${plugin.getConfig("color", defaultConfig["color"])["basic"]["light"]["opacity"]}`,
                    { id: "basic_light_opacity", type: "number", step: "0.01", min: "0", max: "1" }
                )
            ),
            dom("div", {},
                dom("span", { textContent: "主歌词-深色模式：" }),
                tools.makeInput(
                    `#${plugin.getConfig("color", defaultConfig["color"])["basic"]["dark"]["hex_color"].toString(16)}`,
                    { id: "basic_dark_color", type: "color" }
                ),
                dom("span", { textContent: "透明度：" }),
                tools.makeInput(
                    `${plugin.getConfig("color", defaultConfig["color"])["basic"]["dark"]["opacity"]}`,
                    { id: "basic_dark_opacity", type: "number", step: "0.01", min: "0", max: "1" }
                )
            ),
            dom("div", {},
                dom("span", { textContent: "副歌词-浅色模式：" }),
                tools.makeInput(
                    `#${plugin.getConfig("color", defaultConfig["color"])["extra"]["light"]["hex_color"].toString(16)}`,
                    { id: "extra_light_color", type: "color" }
                ),
                dom("span", { textContent: "透明度：" }),
                tools.makeInput(
                    `${plugin.getConfig("color", defaultConfig["color"])["extra"]["light"]["opacity"]}`,
                    { id: "extra_light_opacity", type: "number", step: "0.01", min: "0", max: "1" }
                )
            ),
            dom("div", {},
                dom("span", { textContent: "副歌词-深色模式：" }),
                tools.makeInput(
                    `#${plugin.getConfig("color", defaultConfig["color"])["extra"]["dark"]["hex_color"].toString(16)}`,
                    { id: "extra_dark_color", type: "color" }
                ),
                dom("span", { textContent: "透明度：" }),
                tools.makeInput(
                    `${plugin.getConfig("color", defaultConfig["color"])["extra"]["dark"]["opacity"]}`,
                    { id: "extra_dark_opacity", type: "number", step: "0.01", min: "0", max: "1" }
                )
            )
        ),

        dom("hr", {}),

        // 字体样式
        dom("section", {},
            dom("h1", {},
                dom("strong", { textContent: "字体样式：" }),
                tools.makeBtn("恢复默认", fontStyle.default, true)
            ),

            dom("div", {},
                dom("span", { textContent: "主歌词-字体字重：" }),
                dom("div", { className: "u-select", name: "basic", style: { zIndex: "2" } },
                    dom("div", { className: "value", id: "basic_weight_select_value" }),
                    dom("div", { className: "sltwrap" },
                        dom("div", { className: "select", id: "basic_weight_select_box" },
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_THIN, textContent: "Thin (100)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_EXTRA_LIGHT, textContent: "Extra-light (200)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_ULTRA_LIGHT, textContent: "Ultra-light (200)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_LIGHT, textContent: "Light (300)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_SEMI_LIGHT, textContent: "Semi-light (350)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_NORMAL, textContent: "Normal (400)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_REGULAR, textContent: "Regular (400)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_MEDIUM, textContent: "Medium (500)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_DEMI_BOLD, textContent: "Demi-bold (600)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_SEMI_BOLD, textContent: "Semi-bold (600)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_BOLD, textContent: "Bold (700)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_EXTRA_BOLD, textContent: "Extra-bold (800)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_ULTRA_BOLD, textContent: "Ultra-bold (800)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_BLACK, textContent: "Black (900)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_HEAVY, textContent: "Heavy (900)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_EXTRA_BLACK, textContent: "Extra-black (950)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_ULTRA_BLACK, textContent: "Ultra-black (950)" })
                        )
                    )
                )
            ),
            dom("div", {},
                dom("span", { textContent: "主歌词-字体斜体：" }),
                tools.makeBtn("Normal", fontStyle.setSlope, true, { name: "basic", value: WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_NORMAL }),
                tools.makeBtn("Oblique", fontStyle.setSlope, true, { name: "basic", value: WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_OBLIQUE }),
                tools.makeBtn("Italic", fontStyle.setSlope, true, { name: "basic", value: WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_ITALIC })
            ),
            dom("div", {},
                dom("span", { textContent: "主歌词-下划线：" }),
                tools.makeCheckbox({
                    id: "basic_underline_checkbox",
                    name: "basic",
                    onchange: fontStyle.setUnderline,
                    checked: plugin.getConfig("style", defaultConfig["style"])["basic"]["underline"]
                })
            ),
            dom("div", {},
                dom("span", { textContent: "主歌词-删除线：" }),
                tools.makeCheckbox({
                    id: "basic_strikethrough_checkbox",
                    name: "basic",
                    onchange: fontStyle.setStrikethrough,
                    checked: plugin.getConfig("style", defaultConfig["style"])["basic"]["strikethrough"]
                })
            ),

            dom("div", {},
                dom("span", { textContent: "副歌词-字体字重：" }),
                dom("div", { className: "u-select", name: "extra" },
                    dom("div", { className: "value", id: "extra_weight_select_value" }),
                    dom("div", { className: "sltwrap" },
                        dom("div", { className: "select", id: "extra_weight_select_box" },
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_THIN, textContent: "Thin (100)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_EXTRA_LIGHT, textContent: "Extra-light (200)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_ULTRA_LIGHT, textContent: "Ultra-light (200)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_LIGHT, textContent: "Light (300)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_SEMI_LIGHT, textContent: "Semi-light (350)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_NORMAL, textContent: "Normal (400)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_REGULAR, textContent: "Regular (400)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_MEDIUM, textContent: "Medium (500)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_DEMI_BOLD, textContent: "Demi-bold (600)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_SEMI_BOLD, textContent: "Semi-bold (600)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_BOLD, textContent: "Bold (700)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_EXTRA_BOLD, textContent: "Extra-bold (800)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_ULTRA_BOLD, textContent: "Ultra-bold (800)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_BLACK, textContent: "Black (900)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_HEAVY, textContent: "Heavy (900)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_EXTRA_BLACK, textContent: "Extra-black (950)" }),
                            dom("p", { className: "option f-thide", value: WindowsEnum.DWRITE_FONT_WEIGHT.DWRITE_FONT_WEIGHT_ULTRA_BLACK, textContent: "Ultra-black (950)" })
                        )
                    )
                )
            ),
            dom("div", {},
                dom("span", { textContent: "副歌词-字体斜体：" }),
                tools.makeBtn("Normal", fontStyle.setSlope, true, { name: "extra", value: WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_NORMAL }),
                tools.makeBtn("Oblique", fontStyle.setSlope, true, { name: "extra", value: WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_OBLIQUE }),
                tools.makeBtn("Italic", fontStyle.setSlope, true, { name: "extra", value: WindowsEnum.DWRITE_FONT_STYLE.DWRITE_FONT_STYLE_ITALIC })
            ),
            dom("div", {},
                dom("span", { textContent: "副歌词-下划线：" }),
                tools.makeCheckbox({
                    id: "extra_underline_checkbox",
                    name: "extra",
                    onchange: fontStyle.setUnderline,
                    checked: plugin.getConfig("style", defaultConfig["style"])["extra"]["underline"]
                })
            ),
            dom("div", {},
                dom("span", { textContent: "副歌词-删除线：" }),
                tools.makeCheckbox({
                    id: "extra_strikethrough_checkbox",
                    name: "extra",
                    onchange: fontStyle.setStrikethrough,
                    checked: plugin.getConfig("style", defaultConfig["style"])["extra"]["strikethrough"]
                })
            )
        ),

        dom("hr", {}),

        // 修改位置
        dom("section", {},
            dom("h1", {},
                dom("strong", { textContent: "修改位置：" }),
                tools.makeBtn("恢复默认", position.default, true)
            ),
            dom("div", {},
                dom("span", { textContent: "窗口位置：" }),
                tools.makeBtn("左", position.set, true, { value: WindowsEnum.WindowAlignment.WindowAlignmentLeft }),
                tools.makeBtn("中", position.set, true, { value: WindowsEnum.WindowAlignment.WindowAlignmentCenter }),
                tools.makeBtn("右", position.set, true, { value: WindowsEnum.WindowAlignment.WindowAlignmentRight })
            )
        ),

        dom("hr", {}),

        // 修改边距
        dom("section", {},
            dom("h1", {},
                dom("strong", { textContent: "修改边距：" }),
                tools.makeBtn("立即应用", margin.set, true),
                tools.makeBtn("恢复默认", margin.default, true)
            ),
            dom("div", {},
                dom("span", { textContent: "左边距：" }),
                tools.makeInput(
                    `${plugin.getConfig("margin", defaultConfig["margin"])["left"]}`,
                    { id: "left", type: "number" }
                )
            ),
            dom("div", {},
                dom("span", { textContent: "右边距：" }),
                tools.makeInput(
                    `${plugin.getConfig("margin", defaultConfig["margin"])["right"]}`,
                    { id: "right", type: "number" }
                )
            )
        ),

        dom("hr", {}),

        // 对齐方式
        dom("section", {},
            dom("h1", {},
                dom("strong", { textContent: "对齐方式：" }),
                tools.makeBtn("恢复默认", textAlign.default, true)
            ),
            dom("div", {},
                dom("span", { textContent: "主歌词：" }),
                tools.makeBtn("左", textAlign.set, true, { name: "basic", value: WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING }),
                tools.makeBtn("中", textAlign.set, true, { name: "basic", value: WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER }),
                tools.makeBtn("右", textAlign.set, true, { name: "basic", value: WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING })
            ),
            dom("div", {},
                dom("span", { textContent: "副歌词：" }),
                tools.makeBtn("左", textAlign.set, true, { name: "extra", value: WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_LEADING }),
                tools.makeBtn("中", textAlign.set, true, { name: "extra", value: WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_CENTER }),
                tools.makeBtn("右", textAlign.set, true, { name: "extra", value: WindowsEnum.DWRITE_TEXT_ALIGNMENT.DWRITE_TEXT_ALIGNMENT_TRAILING })
            )
        ),

        dom("hr", {}),

        // 切换屏幕
        dom("section", {},
            dom("h1", {},
                dom("strong", { textContent: "切换屏幕：（实验功能，可能会移除）" }),
                tools.makeBtn("恢复默认", parentTaskbar.default, true)
            ),
            dom("div", {},
                dom("span", { textContent: "父任务栏：" }),
                tools.makeBtn("主屏幕", parentTaskbar.set, true, { value: "Shell_TrayWnd" }),
                tools.makeBtn("副屏幕", parentTaskbar.set, true, { value: "Shell_SecondaryTrayWnd" })
            )
        ),

        // 样式标签，负责提供界面加载完成事件
        dom("style", { onload: onload })
    )
});