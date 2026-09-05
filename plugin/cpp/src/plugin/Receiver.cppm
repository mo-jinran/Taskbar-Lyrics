export module plugin.Receiver;

import <atomic>;
import plugin.Plugin;
import plugin.Config;

export class Receiver {
public:
    static auto config(void **args) -> const char * {
        if (args == nullptr || args[0] == nullptr || args[1] == nullptr) {
            return nullptr;
        }
        const auto key = static_cast<const char *>(args[0]);
        const auto value = static_cast<const char *>(args[1]);
        setConfig(key, value);
        return nullptr;
    }

    static auto update(void **args) -> const char * {
        if (auto *window = Plugin::getInstance().window.load(std::memory_order_acquire)) {
            window->updateLayout();
        }
        return nullptr;
    }

    static auto lyrics(void **args) -> const char * {
        if (args == nullptr || args[0] == nullptr || args[1] == nullptr) {
            return nullptr;
        }
        setConfig("lyric_primary", static_cast<const char *>(args[0]));
        setConfig("lyric_secondary", static_cast<const char *>(args[1]));
        if (auto *window = Plugin::getInstance().window.load(std::memory_order_acquire)) {
            window->updateLyrics();
        }
        return nullptr;
    }
};
