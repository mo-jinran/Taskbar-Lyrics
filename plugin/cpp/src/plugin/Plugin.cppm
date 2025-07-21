export module plugin.Plugin;

import <Windows.h>;
import <thread>;
import plugin.Config;
import window.Window;

export class Plugin {
public:
    HANDLE mutex = nullptr;
    Window *window = nullptr;

private:
    Plugin() {
        this->mutex = CreateMutex(nullptr, true, L"Global\\Taskbar-Lyrics");
        if (GetLastError() == ERROR_ALREADY_EXISTS) {
            CloseHandle(this->mutex);
            this->mutex = nullptr;
        } else {
            this->initialize();
        }
    }

    ~Plugin() {
        if (this->mutex) {
            ReleaseMutex(this->mutex);
            CloseHandle(this->mutex);
            this->mutex = nullptr;
        }
        if (this->window) {
            delete this->window;
            this->window = nullptr;
        }
    }

    auto initialize() -> void {
        std::thread([this] {
            this->window = new Window();
            this->window->create();
            this->window->runner();
        }).detach();
    }

public:
    static auto getInstance() -> Plugin & {
        static Plugin instance;
        return instance;
    }
};
