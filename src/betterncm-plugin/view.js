"use strict";


// 创建根视图
const configView = document.createElement("div");
configView.style.overflow = "hidden";
configView.style.height = "100%";
configView.style.width = "100%";


plugin.onConfig(tools => configView);


plugin.onLoad(async () => {
    const pluginConfig = this.base.pluginConfig;
    const {
        font,
        color,
        style,
        lyrics,
        effect,
        align,
        position,
        margin,
        screen,
    } = { ...this.func };


    // 加载结构
    {
        const path = `${this.pluginPath}/config.html`;
        const text = await betterncm.fs.readFileText(path);
        const parser = new DOMParser();
        const dom = parser.parseFromString(text, "text/html");
        const element = dom.querySelector("#taskbar-lyrics-dom");
        configView.appendChild(element);
    }


    // 加载样式
    {
        const path = `${this.pluginPath}/style.css`;
        const text = await betterncm.fs.readFileText(path);
        const element = document.createElement("style");
        element.textContent = text;
        configView.appendChild(element);
    }


    // 页面切换
    {
        const tab_box = configView.querySelector(".tab_box");
        const content_box = configView.querySelector(".content_box")

        const all_tab_button = tab_box.querySelectorAll(".tab_button");
        const all_content = content_box.querySelectorAll(".content");

        all_tab_button.forEach((tab, index) => {
            tab.addEventListener("click", () => {
                // 激活标签
                const active_tab = tab_box.querySelector(".active");
                active_tab.classList.remove("active");
                tab.classList.add("active");
                // 显示内容
                const show_content = content_box.querySelector(".show");
                show_content.classList.remove("show");
                all_content[index].classList.add("show");
            });
        });
    }


    // 通用的下拉选择框控制函数
    function selectController(event) {
        const open = event.target.parentElement.classList.contains("z-open");
        if (open) event.target.parentElement.classList.remove("z-open");
        else event.target.parentElement.classList.add("z-open");
    }


    // 点击其他地方收起下拉选择框
    addEventListener("pointerup", event => {
        if (!event.target.classList.contains("value")) {
            const open = configView.querySelectorAll(".u-select.z-open");
            open.forEach(value => value.classList.remove("z-open"));
        }
    });


    // 更换字体
    {
        const apply = configView.querySelector(".content.font .font-settings .apply");
        const reset = configView.querySelector(".content.font .font-settings .reset");

        const fontFamily = configView.querySelector(".content.font .font-settings .font-family");

        const elements = {
            fontFamily
        };

        apply.addEventListener("click", () => font.apply(elements));
        reset.addEventListener("click", () => font.reset(elements));

        fontFamily.value = pluginConfig.get("font")["font_family"];
    }


    // 字体颜色
    {
        const apply = configView.querySelector(".content.font .color-settings .apply");
        const reset = configView.querySelector(".content.font .color-settings .reset");

        const basicLightColor = configView.querySelector(".content.font .color-settings .basic-light-color");
        const basicLightOpacity = configView.querySelector(".content.font .color-settings .basic-light-opacity");
        const basicDarkColor = configView.querySelector(".content.font .color-settings .basic-dark-color");
        const basicDarkOpacity = configView.querySelector(".content.font .color-settings .basic-dark-opacity");
        const extraLightColor = configView.querySelector(".content.font .color-settings .extra-light-color");
        const extraLightOpacity = configView.querySelector(".content.font .color-settings .extra-light-opacity");
        const extraDarkColor = configView.querySelector(".content.font .color-settings .extra-dark-color");
        const extraDarkOpacity = configView.querySelector(".content.font .color-settings .extra-dark-opacity");

        const elements = {
            basicLightColor,
            basicLightOpacity,
            basicDarkColor,
            basicDarkOpacity,
            extraLightColor,
            extraLightOpacity,
            extraDarkColor,
            extraDarkOpacity
        }

        apply.addEventListener("click", () => color.apply(elements));
        reset.addEventListener("click", () => color.reset(elements));

        basicLightColor.value = `#${pluginConfig.get("color")["basic"]["light"]["hex_color"].toString(16)}`;
        basicLightOpacity.value = pluginConfig.get("color")["basic"]["light"]["opacity"];
        basicDarkColor.value = `#${pluginConfig.get("color")["basic"]["dark"]["hex_color"].toString(16)}`;
        basicDarkOpacity.value = pluginConfig.get("color")["basic"]["dark"]["opacity"];
        extraLightColor.value = `#${pluginConfig.get("color")["extra"]["light"]["hex_color"].toString(16)}`;
        extraLightOpacity.value = pluginConfig.get("color")["extra"]["light"]["opacity"];
        extraDarkColor.value = `#${pluginConfig.get("color")["extra"]["dark"]["hex_color"].toString(16)}`;
        extraDarkOpacity.value = pluginConfig.get("color")["extra"]["dark"]["opacity"];
    }


    // 字体样式
    {
        const reset = configView.querySelector(".content.font .style-settings .reset");

        const basicWeightValue = configView.querySelector(".content.font .style-settings .basic-weight .value");
        const basicWeightSelect = configView.querySelector(".content.font .style-settings .basic-weight .select");
        const basicNormal = configView.querySelector(".content.font .style-settings .basic-normal");
        const basicOblique = configView.querySelector(".content.font .style-settings .basic-oblique");
        const basicItalic = configView.querySelector(".content.font .style-settings .basic-italic");
        const basicUnderline = configView.querySelector(".content.font .style-settings .basic-underline");
        const basicStrikethrough = configView.querySelector(".content.font .style-settings .basic-strikethrough");
        const extraWeightValue = configView.querySelector(".content.font .style-settings .extra-weight .value");
        const extraWeightSelect = configView.querySelector(".content.font .style-settings .extra-weight .select");
        const extraNormal = configView.querySelector(".content.font .style-settings .extra-normal");
        const extraOblique = configView.querySelector(".content.font .style-settings .extra-oblique");
        const extraItalic = configView.querySelector(".content.font .style-settings .extra-italic");
        const extraUnderline = configView.querySelector(".content.font .style-settings .extra-underline");
        const extraStrikethrough = configView.querySelector(".content.font .style-settings .extra-strikethrough");

        const elements = {
            basicWeightValue,
            basicUnderline,
            basicStrikethrough,
            extraWeightValue,
            extraUnderline,
            extraStrikethrough
        }

        reset.addEventListener("click", () => style.reset(elements));

        basicNormal.addEventListener("click", event => style.setSlopeNormal(event));
        basicOblique.addEventListener("click", event => style.setSlopeOblique(event));
        basicItalic.addEventListener("click", event => style.setSlopeItalic(event));
        basicUnderline.addEventListener("change", event => style.setUnderline(event));
        basicStrikethrough.addEventListener("change", event => style.setStrikethrough(event));
        extraNormal.addEventListener("click", event => style.setSlopeNormal(event));
        extraOblique.addEventListener("click", event => style.setSlopeOblique(event));
        extraItalic.addEventListener("click", event => style.setSlopeItalic(event));
        extraUnderline.addEventListener("change", event => style.setUnderline(event));
        extraStrikethrough.addEventListener("change", event => style.setStrikethrough(event));

        basicWeightValue.addEventListener("click", selectController);
        basicWeightSelect.addEventListener("click", event => {
            const name = event.target.parentElement.dataset.type;
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            style.setWeight(name, value, textContent);
            basicWeightValue.textContent = textContent;
        });

        extraWeightValue.addEventListener("click", selectController);
        extraWeightSelect.addEventListener("click", event => {
            const name = event.target.parentElement.dataset.type;
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            style.setWeight(name, value, textContent);
            extraWeightValue.textContent = textContent;
        });

        basicWeightValue.textContent = pluginConfig.get("style")["basic"]["weight"]["textContent"];
        basicUnderline.checked = pluginConfig.get("style")["basic"]["underline"];
        basicStrikethrough.checked = pluginConfig.get("style")["basic"]["strikethrough"];
        extraWeightValue.textContent = pluginConfig.get("style")["extra"]["weight"]["textContent"];
        extraUnderline.checked = pluginConfig.get("style")["extra"]["underline"];
        extraStrikethrough.checked = pluginConfig.get("style")["extra"]["strikethrough"];
    }


    // 歌词设置
    {
        const reset = configView.querySelector(".content.lyrics .lyrics-settings .reset");

        const lyricsSwitch = configView.querySelector(".content.lyrics .lyrics-settings .lyrics-switch");
        const retrievalMethodValue = configView.querySelector(".content.lyrics .lyrics-settings .retrieval-method .value");
        const retrievalMethodSelect = configView.querySelector(".content.lyrics .lyrics-settings .retrieval-method .select");

        const elements = {
            retrievalMethodValue
        }

        reset.addEventListener("click", () => lyrics.reset(elements));

        lyricsSwitch.addEventListener("change", event => lyrics.lyricsSwitch(event));

        retrievalMethodValue.addEventListener("click", selectController);
        retrievalMethodSelect.addEventListener("click", event => {
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            if ((value == "2") && (!window.currentLyrics)) {
                channel.call(
                    "trayicon.popBalloon",
                    () => { },
                    [{
                        title: "任务栏歌词",
                        text: "无法使用RefinedNowPlaying歌词！\n是否安装RefinedNowPlaying插件？\n将回退到使用LibLyric解析获取歌词",
                        icon: "path",
                        hasSound: true,
                        delayTime: 2e3
                    }]
                );
                return;
            }
            lyrics.setRetrievalMethod(value, textContent);
            retrievalMethodValue.textContent = textContent;
        });

        retrievalMethodValue.textContent = pluginConfig.get("lyrics")["retrieval_method"]["textContent"];
    }


    // 显示效果
    {
        const apply = configView.querySelector(".content.lyrics .effect-settings .apply");
        const reset = configView.querySelector(".content.lyrics .effect-settings .reset");

        const nextLineLyricsPositionValue = configView.querySelector(".content.lyrics .effect-settings .next-line-lyrics-position .value");
        const nextLineLyricsPositionSelect = configView.querySelector(".content.lyrics .effect-settings .next-line-lyrics-position .select");
        const extraShowValue = configView.querySelector(".content.lyrics .effect-settings .extra-show .value");
        const extraShowSelect = configView.querySelector(".content.lyrics .effect-settings .extra-show .select");
        const adjust = configView.querySelector(".content.lyrics .effect-settings .adjust");

        const elements = {
            nextLineLyricsPositionValue,
            extraShowValue,
            adjust
        }

        apply.addEventListener("click", () => effect.apply(elements));
        reset.addEventListener("click", () => effect.reset(elements));

        nextLineLyricsPositionValue.addEventListener("click", selectController);
        nextLineLyricsPositionSelect.addEventListener("click", event => {
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            effect.setNextLineLyricsPosition(value, textContent);
            nextLineLyricsPositionValue.textContent = textContent;
        });

        extraShowValue.addEventListener("click", selectController);
        extraShowSelect.addEventListener("click", event => {
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            effect.setExtraShow(value, textContent);
            extraShowValue.textContent = textContent;
        });

        nextLineLyricsPositionValue.textContent = pluginConfig.get("effect")["next_line_lyrics_position"]["textContent"];
        extraShowValue.textContent = pluginConfig.get("effect")["extra_show"]["textContent"];
        adjust.value = pluginConfig.get("effect")["adjust"];
    }


    // 对齐方式
    {
        const reset = configView.querySelector(".content.lyrics .align-settings .reset");

        const basicLeft = configView.querySelector(".content.lyrics .align-settings .basic-left");
        const basicCenter = configView.querySelector(".content.lyrics .align-settings .basic-center");
        const basicRight = configView.querySelector(".content.lyrics .align-settings .basic-right");
        const extraLeft = configView.querySelector(".content.lyrics .align-settings .extra-left");
        const extraCenter = configView.querySelector(".content.lyrics .align-settings .extra-center");
        const extraRight = configView.querySelector(".content.lyrics .align-settings .extra-right");

        reset.addEventListener("click", () => align.reset());

        basicLeft.addEventListener("click", event => align.setLeft(event));
        basicCenter.addEventListener("click", event => align.setCenter(event));
        basicRight.addEventListener("click", event => align.setRight(event));
        extraLeft.addEventListener("click", event => align.setLeft(event));
        extraCenter.addEventListener("click", event => align.setCenter(event));
        extraRight.addEventListener("click", event => align.setRight(event));
    }


    // 修改位置
    {
        const reset = configView.querySelector(".content.window .position-settings .reset");

        const windowPositionValue = configView.querySelector(".content.window .position-settings .window-position .value");
        const windowPositionSelect = configView.querySelector(".content.window .position-settings .window-position .select");

        const elements = {
            windowPositionValue
        }

        reset.addEventListener("click", () => position.reset(elements));

        windowPositionValue.addEventListener("click", selectController);
        windowPositionSelect.addEventListener("click", event => {
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            position.setWindowPosition(value, textContent);
            windowPositionValue.textContent = textContent;
        });

        windowPositionValue.textContent = pluginConfig.get("position")["position"]["textContent"];
    }


    // 修改边距
    {
        const apply = configView.querySelector(".content.window .margin-settings .apply");
        const reset = configView.querySelector(".content.window .margin-settings .reset");

        const left = configView.querySelector(".content.window .margin-settings .left");
        const right = configView.querySelector(".content.window .margin-settings .right");

        const elements = {
            left,
            right
        }

        apply.addEventListener("click", () => margin.apply(elements));
        reset.addEventListener("click", () => margin.reset(elements));

        left.value = pluginConfig.get("margin")["left"];
        right.value = pluginConfig.get("margin")["right"];
    }


    // 切换屏幕
    {
        const reset = configView.querySelector(".content.window .screen-settings .reset");

        const parentTaskbarValue = configView.querySelector(".content.window .screen-settings .parent-taskbar .value");
        const parentTaskbarSelect = configView.querySelector(".content.window .screen-settings .parent-taskbar .select");

        const elements = {
            parentTaskbarValue
        }

        reset.addEventListener("click", () => screen.reset(elements));

        parentTaskbarValue.addEventListener("click", selectController);
        parentTaskbarSelect.addEventListener("click", event => {
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            screen.setParentTaskbar(value, textContent);
            parentTaskbarValue.textContent = textContent;
        });

        parentTaskbarValue.textContent = pluginConfig.get("screen")["parent_taskbar"]["textContent"];
    }
});