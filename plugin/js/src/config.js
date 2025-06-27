export const DWRITE_TEXT_ALIGNMENT = Object.freeze({
    LEADING: 0,
    TRAILING: 1,
    CENTER: 2,
    JUSTIFIED: 3
});


export const DWRITE_FONT_WEIGHT = Object.freeze({
    THIN: 100,
    EXTRA_LIGHT: 200,
    ULTRA_LIGHT: 200,
    LIGHT: 300,
    SEMI_LIGHT: 350,
    NORMAL: 400,
    REGULAR: 400,
    MEDIUM: 500,
    DEMI_BOLD: 600,
    SEMI_BOLD: 600,
    BOLD: 700,
    EXTRA_BOLD: 800,
    ULTRA_BOLD: 800,
    BLACK: 900,
    HEAVY: 900,
    EXTRA_BLACK: 950,
    ULTRA_BLACK: 950
});


export const DWRITE_FONT_STYLE = Object.freeze({
    NORMAL: 0,
    OBLIQUE: 1,
    ITALIC: 2
});


export const TASKBAR_WINDOW_ALIGNMENT = Object.freeze({
    AUTO: 0,
    LEFT: 1,
    CENTER: 2,
    RIGHT: 3
});


export const DEFAULT_CONFIG = Object.freeze({
    // 歌词内容
    lyric_primary: "",
    lyric_secondary: "",
    // 通用设置
    font_family: "Microsoft YaHei UI",
    margin_left: 0,
    margin_right: 0,
    window_alignment: TASKBAR_WINDOW_ALIGNMENT.AUTO,
    // 主要歌词设置
    color_primary: 0xFFFFFFFF,
    size_primary: 14,
    underline_primary: false,
    strikethrough_primary: false,
    weight_primary: DWRITE_FONT_WEIGHT.NORMAL,
    slope_primary: DWRITE_FONT_STYLE.NORMAL,
    align_primary: DWRITE_TEXT_ALIGNMENT.LEADING,
    // 次要歌词设置
    color_secondary: 0xFFFFFFFF,
    size_secondary: 14,
    underline_secondary: false,
    strikethrough_secondary: false,
    weight_secondary: DWRITE_FONT_WEIGHT.NORMAL,
    slope_secondary: DWRITE_FONT_STYLE.NORMAL,
    align_secondary: DWRITE_TEXT_ALIGNMENT.LEADING
});


export const config = (() => {
    const config = new Proxy({...DEFAULT_CONFIG}, {
        get(target, property) {
            return plugin.getConfig(property, DEFAULT_CONFIG[property]);
        },
        set(target, property, value) {
            plugin.setConfig(property, value);
            betterncm_native.native_plugin.call("taskbar_lyrics.config", [property, String(value)]);
            return true;
        }
    });
    for (const key in DEFAULT_CONFIG) {
        config[key] = config[key];
    }
    return config;
})();


export function updateConfig() {
    betterncm_native.native_plugin.call("taskbar_lyrics.update", []);
}
