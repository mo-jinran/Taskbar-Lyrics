export module plugin.Receiver;

import plugin.Plugin;
import plugin.Config;

export class Receiver {
public:
    static auto config(void **args) -> const char * {
        const auto key = static_cast<const char *>(args[0]);
        const auto value = static_cast<const char *>(args[1]);
        setConfig(key, value);
        return nullptr;
    }

    static auto update(void **args) -> const char * {
        Plugin::getInstance().window->update();
        return nullptr;
    }
};
