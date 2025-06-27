export module plugin.Config;

import <dwrite.h>;
import <string>;
import <unordered_map>;

auto stringToWString(const std::string &str) {
    std::wstring result(MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, str.c_str(), -1, nullptr, 0), 0);
    MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, str.c_str(), -1, result.data(), result.size());
    return result;
}

export enum TASKBAR_WINDOW_ALIGNMENT {
    TASKBAR_WINDOW_ALIGNMENT_AUTO,
    TASKBAR_WINDOW_ALIGNMENT_LEFT,
    TASKBAR_WINDOW_ALIGNMENT_CENTER,
    TASKBAR_WINDOW_ALIGNMENT_RIGHT
};

export struct Config {
    // 歌词内容
    std::wstring lyric_primary = L" ";
    std::wstring lyric_secondary = L" ";
    // 通用设置
    std::wstring font_family = L"Microsoft YaHei UI";
    int margin_left = 0;
    int margin_right = 0;
    TASKBAR_WINDOW_ALIGNMENT window_alignment = TASKBAR_WINDOW_ALIGNMENT::TASKBAR_WINDOW_ALIGNMENT_AUTO;
    // 主要歌词设置
    unsigned int color_primary = 0xFFFFFFFF;
    int size_primary = 14;
    bool underline_primary = false;
    bool strikethrough_primary = false;
    DWRITE_FONT_WEIGHT weight_primary = DWRITE_FONT_WEIGHT::DWRITE_FONT_WEIGHT_NORMAL;
    DWRITE_FONT_STYLE slope_primary = DWRITE_FONT_STYLE::DWRITE_FONT_STYLE_NORMAL;
    DWRITE_TEXT_ALIGNMENT align_primary = DWRITE_TEXT_ALIGNMENT::DWRITE_TEXT_ALIGNMENT_LEADING;
    // 次要歌词设置
    unsigned int color_secondary = 0xFFFFFFFF;
    int size_secondary = 14;
    bool underline_secondary = false;
    bool strikethrough_secondary = false;
    DWRITE_FONT_WEIGHT weight_secondary = DWRITE_FONT_WEIGHT::DWRITE_FONT_WEIGHT_NORMAL;
    DWRITE_FONT_STYLE slope_secondary = DWRITE_FONT_STYLE::DWRITE_FONT_STYLE_NORMAL;
    DWRITE_TEXT_ALIGNMENT align_secondary = DWRITE_TEXT_ALIGNMENT::DWRITE_TEXT_ALIGNMENT_LEADING;
} config;

export auto setConfig(const std::string &key, const std::string &value) {
    static const auto setters = std::unordered_map<std::string, void(*)(const std::string &)>{
        // 歌词内容
        {"lyric_primary", [](const std::string &str) { config.lyric_primary = stringToWString(str); }},
        {"lyric_secondary", [](const std::string &str) { config.lyric_secondary = stringToWString(str); }},
        // 通用设置
        {"font_family", [](const std::string &str) { config.font_family = stringToWString(str); }},
        {"margin_left", [](const std::string &str) { config.margin_left = std::stoi(str); }},
        {"margin_right", [](const std::string &str) { config.margin_right = std::stoi(str); }},
        {"window_alignment", [](const std::string &str) { config.window_alignment = static_cast<TASKBAR_WINDOW_ALIGNMENT>(std::stoi(str)); }},
        // 主要歌词设置
        {"size_primary", [](const std::string &str) { config.size_primary = std::stoi(str); }},
        {"color_primary", [](const std::string &str) { config.color_primary = std::stoul(str, nullptr, 0); }},
        {"underline_primary", [](const std::string &str) { config.underline_primary = (str == "true"); }},
        {"strikethrough_primary", [](const std::string &str) { config.strikethrough_primary = (str == "true"); }},
        {"weight_primary", [](const std::string &str) { config.weight_primary = static_cast<DWRITE_FONT_WEIGHT>(std::stoi(str)); }},
        {"slope_primary", [](const std::string &str) { config.slope_primary = static_cast<DWRITE_FONT_STYLE>(std::stoi(str)); }},
        {"align_primary", [](const std::string &str) { config.align_primary = static_cast<DWRITE_TEXT_ALIGNMENT>(std::stoi(str)); }},
        // 次要歌词设置
        {"size_secondary", [](const std::string &str) { config.size_secondary = std::stoi(str); }},
        {"color_secondary", [](const std::string &str) { config.color_secondary = std::stoul(str, nullptr, 0); }},
        {"underline_secondary", [](const std::string &str) { config.underline_secondary = (str == "true"); }},
        {"strikethrough_secondary", [](const std::string &str) { config.strikethrough_secondary = (str == "true"); }},
        {"weight_secondary", [](const std::string &str) { config.weight_secondary = static_cast<DWRITE_FONT_WEIGHT>(std::stoi(str)); }},
        {"slope_secondary", [](const std::string &str) { config.slope_secondary = static_cast<DWRITE_FONT_STYLE>(std::stoi(str)); }},
        {"align_secondary", [](const std::string &str) { config.align_secondary = static_cast<DWRITE_TEXT_ALIGNMENT>(std::stoi(str)); }},
    };
    if (const auto it = setters.find(key); it != setters.end()) {
        it->second(value);
    }
}
