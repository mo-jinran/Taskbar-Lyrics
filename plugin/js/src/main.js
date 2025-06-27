import {
    LyricObserver
} from "./lyrics.js";

import {
    createConfigView,
    createRow,
    createSection,
    createSelect,
    createNumberInput,
    createColorPicker,
    createCheckbox
} from "./view.js";

import {
    config,
    updateConfig,
    DWRITE_TEXT_ALIGNMENT,
    DWRITE_FONT_WEIGHT,
    DWRITE_FONT_STYLE,
    TASKBAR_WINDOW_ALIGNMENT
} from "./config.js";


new class {
    constructor() {
        plugin.onLoad(this.onLoad.bind(this));
        plugin.onConfig(this.onConfig.bind(this));
    }

    onLoad() {
        try {
            new LyricObserver((lyrics, index) => {
                try {
                    config.lyric_primary = lyrics[lyrics[index].time == -1 ? 0 : index + (index & 1)]?.text ?? "";
                    config.lyric_secondary = lyrics[lyrics[index].time == -1 ? 1 : index + !(index & 1)]?.text ?? "";
                    updateConfig();
                } catch (error) {
                    console.error("[Taskbar Lyrics] Error updating lyrics:", error);
                }
            });
            updateConfig();
        } catch (error) {
            console.error("[Taskbar Lyrics] Failed to initialize plugin:", error);
        }
    }

    onConfig() {
        const container = createConfigView();
        // 通用设置
        const generalSection = createSection("general", "通用设置");
        generalSection.appendChild(createRow(
            "字体",
            createSelect([
                "Microsoft YaHei UI",
                "SimSun",
                "SimHei",
                "KaiTi",
                "Arial",
                "Times New Roman",
                "Consolas"
            ], config.font_family, value => {
                config.font_family = value;
                updateConfig();
            })
        ));
        generalSection.appendChild(createRow(
            "左边距",
            createNumberInput(config.margin_left, value => {
                config.margin_left = value;
                updateConfig();
            })
        ));
        generalSection.appendChild(createRow(
            "右边距",
            createNumberInput(config.margin_right, value => {
                config.margin_right = value;
                updateConfig();
            })
        ));
        generalSection.appendChild(createRow(
            "窗口对齐方式",
            createSelect({
                [TASKBAR_WINDOW_ALIGNMENT.AUTO]: "自动",
                [TASKBAR_WINDOW_ALIGNMENT.LEFT]: "左对齐",
                [TASKBAR_WINDOW_ALIGNMENT.CENTER]: "居中",
                [TASKBAR_WINDOW_ALIGNMENT.RIGHT]: "右对齐"
            }, config.window_alignment, value => {
                config.window_alignment = parseInt(value);
                updateConfig();
            })
        ));
        container.appendChild(generalSection);
        // 主要歌词设置
        const primarySection = createSection("primary", "主要歌词设置");
        primarySection.appendChild(createRow(
            "颜色",
            createColorPicker(config.color_primary, value => {
                config.color_primary = value;
                updateConfig();
            })
        ));
        primarySection.appendChild(createRow(
            "字体大小",
            createNumberInput(config.size_primary, value => {
                config.size_primary = value;
                updateConfig();
            })
        ));
        primarySection.appendChild(createRow(
            "字体粗细",
            createSelect({
                [DWRITE_FONT_WEIGHT.THIN]: "极细",
                [DWRITE_FONT_WEIGHT.LIGHT]: "细体",
                [DWRITE_FONT_WEIGHT.NORMAL]: "正常",
                [DWRITE_FONT_WEIGHT.MEDIUM]: "中等",
                [DWRITE_FONT_WEIGHT.BOLD]: "粗体",
                [DWRITE_FONT_WEIGHT.BLACK]: "超粗"
            }, config.weight_primary, value => {
                config.weight_primary = parseInt(value);
                updateConfig();
            })
        ));
        primarySection.appendChild(createRow(
            "字体样式",
            createSelect({
                [DWRITE_FONT_STYLE.NORMAL]: "正常",
                [DWRITE_FONT_STYLE.ITALIC]: "斜体（字体包含的设计）",
                [DWRITE_FONT_STYLE.OBLIQUE]: "倾斜（强制将字符倾斜）"
            }, config.slope_primary, value => {
                config.slope_primary = parseInt(value);
                updateConfig();
            })
        ));
        primarySection.appendChild(createRow(
            "下划线",
            createCheckbox(config.underline_primary, value => {
                config.underline_primary = value;
                updateConfig();
            })
        ));
        primarySection.appendChild(createRow(
            "删除线",
            createCheckbox(config.strikethrough_primary, value => {
                config.strikethrough_primary = value;
                updateConfig();
            })
        ));
        primarySection.appendChild(createRow(
            "文本对齐",
            createSelect({
                [DWRITE_TEXT_ALIGNMENT.LEADING]: "左对齐",
                [DWRITE_TEXT_ALIGNMENT.CENTER]: "居中",
                [DWRITE_TEXT_ALIGNMENT.TRAILING]: "右对齐",
                [DWRITE_TEXT_ALIGNMENT.JUSTIFIED]: "两端对齐"
            }, config.align_primary, value => {
                config.align_primary = parseInt(value);
                updateConfig();
            })
        ));
        container.appendChild(primarySection);
        // 次要歌词设置
        const secondarySection = createSection("secondary", "次要歌词设置");
        secondarySection.appendChild(createRow(
            "颜色",
            createColorPicker(config.color_secondary, value => {
                config.color_secondary = value;
                updateConfig();
            })
        ));
        secondarySection.appendChild(createRow(
            "字体大小",
            createNumberInput(config.size_secondary, value => {
                config.size_secondary = value;
                updateConfig();
            })
        ));
        secondarySection.appendChild(createRow(
            "字体粗细",
            createSelect({
                [DWRITE_FONT_WEIGHT.THIN]: "极细",
                [DWRITE_FONT_WEIGHT.LIGHT]: "细体",
                [DWRITE_FONT_WEIGHT.NORMAL]: "正常",
                [DWRITE_FONT_WEIGHT.MEDIUM]: "中等",
                [DWRITE_FONT_WEIGHT.BOLD]: "粗体",
                [DWRITE_FONT_WEIGHT.BLACK]: "超粗"
            }, config.weight_secondary, value => {
                config.weight_secondary = parseInt(value);
                updateConfig();
            })
        ));
        secondarySection.appendChild(createRow(
            "字体样式",
            createSelect({
                [DWRITE_FONT_STYLE.NORMAL]: "正常",
                [DWRITE_FONT_STYLE.ITALIC]: "斜体（字体包含的设计）",
                [DWRITE_FONT_STYLE.OBLIQUE]: "倾斜（强制将字符倾斜）"
            }, config.slope_secondary, value => {
                config.slope_secondary = parseInt(value);
                updateConfig();
            })
        ));
        secondarySection.appendChild(createRow(
            "下划线",
            createCheckbox(config.underline_secondary, value => {
                config.underline_secondary = value;
                updateConfig();
            })
        ));
        secondarySection.appendChild(createRow(
            "删除线",
            createCheckbox(config.strikethrough_secondary, value => {
                config.strikethrough_secondary = value;
                updateConfig();
            })
        ));
        secondarySection.appendChild(createRow(
            "文本对齐",
            createSelect({
                [DWRITE_TEXT_ALIGNMENT.LEADING]: "左对齐",
                [DWRITE_TEXT_ALIGNMENT.CENTER]: "居中",
                [DWRITE_TEXT_ALIGNMENT.TRAILING]: "右对齐",
                [DWRITE_TEXT_ALIGNMENT.JUSTIFIED]: "两端对齐"
            }, config.align_secondary, value => {
                config.align_secondary = parseInt(value);
                updateConfig();
            })
        ));
        container.appendChild(secondarySection);
        return container;
    }
}
