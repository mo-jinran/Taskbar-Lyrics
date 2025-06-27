export module taskbar.Registry;

import <Windows.h>;
import <vector>;
import <functional>;

export class Registry {
public:
    typedef std::function<void()> Callback;

private:
    Callback callback{};

public:
    static auto onWatch(const Registry::Callback &callback) -> void {
        HKEY key = nullptr;
        HANDLE event = CreateEventW(nullptr, true, false, nullptr);
        RegOpenKeyExW(HKEY_CURRENT_USER, L"Software\\Microsoft\\Windows\\CurrentVersion", 0, KEY_NOTIFY, &key);
        while (true) {
            RegNotifyChangeKeyValue(key, true, REG_NOTIFY_CHANGE_LAST_SET, event, true);
            WaitForSingleObject(event, INFINITE);
            ResetEvent(event);
            callback();
        }
    }

    static auto isLightTheme() -> bool {
        const auto path = L"Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize";
        const auto name = L"SystemUsesLightTheme";
        DWORD data = 0;
        DWORD size = sizeof(data);
        RegGetValue(HKEY_CURRENT_USER, path, name, RRF_RT_REG_DWORD, nullptr, &data, &size);
        return data;
    }

    static auto isTaskbarCentered() -> bool {
        const auto path = L"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced";
        const auto name = L"TaskbarAl";
        DWORD data = 0;
        DWORD size = sizeof(data);
        RegGetValue(HKEY_CURRENT_USER, path, name, RRF_RT_REG_DWORD, nullptr, &data, &size);
        return data;
    }

    static auto isWidgetsEnabled() -> bool {
        const auto path = L"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced";
        const auto name = L"TaskbarDa";
        DWORD data = 0;
        DWORD size = sizeof(data);
        RegGetValue(HKEY_CURRENT_USER, path, name, RRF_RT_REG_DWORD, nullptr, &data, &size);
        return data;
    }
};
