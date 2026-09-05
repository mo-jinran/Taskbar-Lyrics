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
        if (event == nullptr || RegOpenKeyExW(HKEY_CURRENT_USER, L"Software\\Microsoft\\Windows\\CurrentVersion", 0, KEY_NOTIFY, &key) != ERROR_SUCCESS || key == nullptr) {
            if (event != nullptr) {
                CloseHandle(event);
            }
            return;
        }
        while (RegNotifyChangeKeyValue(key, true, REG_NOTIFY_CHANGE_LAST_SET, event, true) == ERROR_SUCCESS) {
            if (WaitForSingleObject(event, INFINITE) != WAIT_OBJECT_0) {
                break;
            }
            ResetEvent(event);
            if (callback) {
                callback();
            }
        }
        RegCloseKey(key);
        CloseHandle(event);
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
