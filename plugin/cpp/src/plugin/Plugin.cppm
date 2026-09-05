export module plugin.Plugin;

import <Windows.h>;
import <atomic>;
import <thread>;
import plugin.Config;
import window.Window;

export class Plugin {
public:
    HANDLE mutex = nullptr;
    std::atomic<Window *> window{nullptr};

private:
    Plugin() {
        this->mutex = CreateMutex(nullptr, true, L"Global\\Taskbar-Lyrics");
        if (this->mutex == nullptr) {
            return;
        }
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
    }

    auto initialize() -> void {
        std::thread([this] {
            auto *window = new Window();
            this->window.store(window, std::memory_order_release);
            window->create();
            window->runner();
        }).detach();
    }

public:
    static auto getInstance() -> Plugin & {
        static Plugin instance;
        return instance;
    }
};
