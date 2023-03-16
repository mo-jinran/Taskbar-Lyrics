"use strict";


// 创建根视图
const configView = document.createElement("div");
configView.style.overflow = "hidden";
configView.style.height = "100%";
configView.style.width = "100%";


plugin.onConfig(tools => configView);


plugin.onLoad(async () => {
    const { defaultConfig } = { ...this.base };
    const {
        lyrics,
        font,
        color,
        style,
        position,
        margin,
        align,
        screen,
    } = { ...this.func };


    // 加载结构
    const injectHTML = async () => {
        const path = `${this.pluginPath}/config.html`;
        const text = await betterncm.fs.readFileText(path);
        const parser = new DOMParser();
        const dom = parser.parseFromString(text, "text/html");
        const element = dom.querySelector("#taskbar-lyrics-dom");
        configView.appendChild(element);
    }


    // 加载样式
    const injectCSS = async () => {
        const path = `${this.pluginPath}/style.css`;
        const text = await betterncm.fs.readFileText(path);
        const element = document.createElement("style");
        element.textContent = text;
        configView.appendChild(element);
    }


    // 页面切换
    const setTabSwitch = async () => {
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


    // 歌词设置
    const setLyricsSettings = async () => {
        const apply = configView.querySelector(".lyrics-settings .apply");
        const reset = configView.querySelector(".lyrics-settings .reset");

        const lyricsSwitch = configView.querySelector(".lyrics-settings .lyrics-switch");
        const LyricsRetrievalMethodValue = configView.querySelector(".lyrics-settings .lyrics-retrieval-method-value");
        const LyricsRetrievalMethodBox = configView.querySelector(".lyrics-settings .lyrics-retrieval-method-box");
        const extraShowWhatValue = configView.querySelector(".lyrics-settings .extra-show-what-value");
        const extraShowWhatBox = configView.querySelector(".lyrics-settings .extra-show-what-box");
        const adjust = configView.querySelector(".lyrics-settings .adjust");

        const elements = {
            LyricsRetrievalMethodValue,
            extraShowWhatValue,
            adjust
        }

        apply.addEventListener("click", () => lyrics.set(elements));
        reset.addEventListener("click", () => lyrics.default(elements));

        lyricsSwitch.addEventListener("change", event => lyrics.switch(event));

        LyricsRetrievalMethodValue.addEventListener("click", event => {
            const open = event.target.parentElement.classList.contains("z-open");
            if (open) event.target.parentElement.classList.remove("z-open");
            else event.target.parentElement.classList.add("z-open");
        });
        LyricsRetrievalMethodBox.addEventListener("click", event => {
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            lyrics.setRetrievalMethod(value, textContent);
            LyricsRetrievalMethodValue.textContent = textContent;
        });

        extraShowWhatValue.addEventListener("click", event => {
            const open = event.target.parentElement.classList.contains("z-open");
            if (open) event.target.parentElement.classList.remove("z-open");
            else event.target.parentElement.classList.add("z-open");
        });
        extraShowWhatBox.addEventListener("click", event => {
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            lyrics.setExtraShow(value, textContent);
            extraShowWhatValue.textContent = textContent;
        });

        LyricsRetrievalMethodValue.textContent = plugin.getConfig("lyrics", defaultConfig["lyrics"])["retrieval_method"]["textContent"];
        extraShowWhatValue.textContent = plugin.getConfig("lyrics", defaultConfig["lyrics"])["extra_show"]["textContent"];
        adjust.value = plugin.getConfig("lyrics", defaultConfig["lyrics"])["adjust"];
    }


    // 更换字体
    const setFontSettings = async () => {
        const apply = configView.querySelector(".font-settings .apply");
        const reset = configView.querySelector(".font-settings .reset");

        const font_family = configView.querySelector(".font-settings .font-family");

        const elements = {
            font_family
        };

        apply.addEventListener("click", () => font.set(elements));
        reset.addEventListener("click", () => font.default(elements));

        font_family.value = plugin.getConfig("font", defaultConfig["font"])["font_family"];
    }


    // 字体颜色
    const setColorSettings = async () => {
        const apply = configView.querySelector(".color-settings .apply");
        const reset = configView.querySelector(".color-settings .reset");

        const basicLightColor = configView.querySelector(".color-settings .basic-light-color");
        const basicLightOpacity = configView.querySelector(".color-settings .basic-light-opacity");
        const basicDarkColor = configView.querySelector(".color-settings .basic-dark-color");
        const basicDarkOpacity = configView.querySelector(".color-settings .basic-dark-opacity");
        const extraLightColor = configView.querySelector(".color-settings .extra-light-color");
        const extraLightOpacity = configView.querySelector(".color-settings .extra-light-opacity");
        const extraDarkColor = configView.querySelector(".color-settings .extra-dark-color");
        const extraDarkOpacity = configView.querySelector(".color-settings .extra-dark-opacity");

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

        apply.addEventListener("click", () => color.set(elements));
        reset.addEventListener("click", () => color.default(elements));

        basicLightColor.value = `#${plugin.getConfig("color", defaultConfig["color"])["basic"]["light"]["hex_color"].toString(16)}`;
        basicLightOpacity.value = plugin.getConfig("color", defaultConfig["color"])["basic"]["light"]["opacity"];
        basicDarkColor.value = `#${plugin.getConfig("color", defaultConfig["color"])["basic"]["dark"]["hex_color"].toString(16)}`;
        basicDarkOpacity.value = plugin.getConfig("color", defaultConfig["color"])["basic"]["dark"]["opacity"];
        extraLightColor.value = `#${plugin.getConfig("color", defaultConfig["color"])["extra"]["light"]["hex_color"].toString(16)}`;
        extraLightOpacity.value = plugin.getConfig("color", defaultConfig["color"])["extra"]["light"]["opacity"];
        extraDarkColor.value = `#${plugin.getConfig("color", defaultConfig["color"])["extra"]["dark"]["hex_color"].toString(16)}`;
        extraDarkOpacity.value = plugin.getConfig("color", defaultConfig["color"])["extra"]["dark"]["opacity"];
    }


    // 字体样式
    const setStyleSettings = async () => {
        const reset = configView.querySelector(".style-settings .reset");

        const basicWeightSelectValue = configView.querySelector(".style-settings .basic-weight-select-value");
        const basicWeightSelectBox = configView.querySelector(".style-settings .basic-weight-select-box");
        const basicNormal = configView.querySelector(".style-settings .basic-normal");
        const basicOblique = configView.querySelector(".style-settings .basic-oblique");
        const basicItalic = configView.querySelector(".style-settings .basic-italic");
        const basicUnderline = configView.querySelector(".style-settings .basic-underline");
        const basicStrikethrough = configView.querySelector(".style-settings .basic-strikethrough");
        const extraWeightSelectValue = configView.querySelector(".style-settings .extra-weight-select-value");
        const extraWeightSelectBox = configView.querySelector(".style-settings .extra-weight-select-box");
        const extraNormal = configView.querySelector(".style-settings .extra-normal");
        const extraOblique = configView.querySelector(".style-settings .extra-oblique");
        const extraItalic = configView.querySelector(".style-settings .extra-italic");
        const extraUnderline = configView.querySelector(".style-settings .extra-underline");
        const extraStrikethrough = configView.querySelector(".style-settings .extra-strikethrough");

        const elements = {
            basicWeightSelectValue,
            basicUnderline,
            basicStrikethrough,
            extraWeightSelectValue,
            extraUnderline,
            extraStrikethrough
        }

        reset.addEventListener("click", () => style.default(elements));

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

        basicWeightSelectValue.addEventListener("click", event => {
            const open = event.target.parentElement.classList.contains("z-open");
            if (open) event.target.parentElement.classList.remove("z-open");
            else event.target.parentElement.classList.add("z-open");
        });
        extraWeightSelectValue.addEventListener("click", event => {
            const open = event.target.parentElement.classList.contains("z-open");
            if (open) event.target.parentElement.classList.remove("z-open");
            else event.target.parentElement.classList.add("z-open");
        });

        basicWeightSelectBox.addEventListener("click", event => {
            const name = event.target.parentElement.dataset.type;
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            style.setWeight(name, value, textContent);
            basicWeightSelectValue.textContent = textContent;
        });
        extraWeightSelectBox.addEventListener("click", event => {
            const name = event.target.parentElement.dataset.type;
            const value = event.target.dataset.value;
            const textContent = event.target.textContent;
            style.setWeight(name, value, textContent);
            extraWeightSelectValue.textContent = textContent;
        });

        basicWeightSelectValue.textContent = plugin.getConfig("style", defaultConfig["style"])["basic"]["weight"]["textContent"];
        basicUnderline.checked = plugin.getConfig("style", defaultConfig["style"])["basic"]["underline"];
        basicStrikethrough.checked = plugin.getConfig("style", defaultConfig["style"])["basic"]["strikethrough"];
        extraWeightSelectValue.textContent = plugin.getConfig("style", defaultConfig["style"])["extra"]["weight"]["textContent"];
        extraUnderline.checked = plugin.getConfig("style", defaultConfig["style"])["extra"]["underline"];
        extraStrikethrough.checked = plugin.getConfig("style", defaultConfig["style"])["extra"]["strikethrough"];
    }


    // 修改位置
    const setPositionSettings = async () => {
        const reset = configView.querySelector(".position-settings .reset");

        const left = configView.querySelector(".position-settings .left");
        const center = configView.querySelector(".position-settings .center");
        const right = configView.querySelector(".position-settings .right");

        reset.addEventListener("click", () => position.default());

        left.addEventListener("click", () => position.setLeft());
        center.addEventListener("click", () => position.setCenter());
        right.addEventListener("click", () => position.setRight());
    }


    // 修改边距
    const setMarginSettings = async () => {
        const apply = configView.querySelector(".margin-settings .apply");
        const reset = configView.querySelector(".margin-settings .reset");

        const left = configView.querySelector(".margin-settings .left");
        const right = configView.querySelector(".margin-settings .right");

        const elements = {
            left,
            right
        }

        apply.addEventListener("click", () => margin.set(elements));
        reset.addEventListener("click", () => margin.default(elements));

        left.value = plugin.getConfig("margin", defaultConfig["margin"])["left"];
        right.value = plugin.getConfig("margin", defaultConfig["margin"])["right"];
    }


    // 对齐方式
    const setAlignSettings = async () => {
        const reset = configView.querySelector(".align-settings .reset");
        const basicLeft = configView.querySelector(".align-settings .basic-left");
        const basicCenter = configView.querySelector(".align-settings .basic-center");
        const basicRight = configView.querySelector(".align-settings .basic-right");
        const extraLeft = configView.querySelector(".align-settings .extra-left");
        const extraCenter = configView.querySelector(".align-settings .extra-center");
        const extraRight = configView.querySelector(".align-settings .extra-right");
        reset.addEventListener("click", () => align.default());
        basicLeft.addEventListener("click", event => align.setLeft(event));
        basicCenter.addEventListener("click", event => align.setCenter(event));
        basicRight.addEventListener("click", event => align.setRight(event));
        extraLeft.addEventListener("click", event => align.setLeft(event));
        extraCenter.addEventListener("click", event => align.setCenter(event));
        extraRight.addEventListener("click", event => align.setRight(event));
    }


    // 切换屏幕
    const setScreenSettings = async () => {
        const reset = configView.querySelector(".screen-settings .reset");
        const primary = configView.querySelector(".screen-settings .primary");
        const secondary = configView.querySelector(".screen-settings .secondary");
        reset.addEventListener("click", () => screen.default());
        primary.addEventListener("click", () => screen.setPrimary());
        secondary.addEventListener("click", () => screen.setSecondary());
    }


    await injectHTML();
    await injectCSS();


    setTabSwitch();
    setLyricsSettings();
    setFontSettings();
    setColorSettings();
    setStyleSettings();
    setPositionSettings();
    setMarginSettings();
    setAlignSettings();
    setScreenSettings();
});