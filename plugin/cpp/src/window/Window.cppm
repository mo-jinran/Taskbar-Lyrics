export module window.Window;

import <Windows.h>;
import <functional>;
import plugin.Config;
import taskbar.Taskbar;
import taskbar.Registry;
import window.Renderer;

export class Window {
private:
    HWND hwnd = nullptr;

    static auto CALLBACK WindowProc(const HWND hwnd, const UINT message, const WPARAM wParam, const LPARAM lParam) -> LRESULT {
        if (message == WM_CREATE) [[unlikely]] {
            const auto create = reinterpret_cast<LPCREATESTRUCT>(lParam);
            const auto window = static_cast<Window *>(create->lpCreateParams);
            SetWindowLongPtr(hwnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(window));
        }
        if (const auto that = reinterpret_cast<Window *>(GetWindowLongPtr(hwnd, GWLP_USERDATA))) [[likely]] {
            return that->handleMessage(hwnd, message, wParam, lParam);
        }
        return DefWindowProc(hwnd, message, wParam, lParam);
    }

    auto handleMessage(const HWND hwnd, const UINT message, const WPARAM wParam, const LPARAM lParam) -> LRESULT {
        switch (message) {
            case WM_CREATE: {
                this->hwnd = hwnd;
                this->taskbar.initialize();
                this->taskbar.setListener(std::bind(&Window::update, this));
                this->renderer.onCreate(hwnd);
                break;
            }
            case WM_SIZE: {
                const auto width = LOWORD(lParam);
                const auto height = HIWORD(lParam);
                const auto dpi = GetDpiForWindow(hwnd);
                this->renderer.onSize(width, height, dpi);
                break;
            }
            case WM_PAINT: {
                this->renderer.onPaint();
                ValidateRect(hwnd, nullptr);
                break;
            }
            default: return DefWindowProc(hwnd, message, wParam, lParam);
        }
        return 0;
    }

public:
    Renderer renderer{};
    Taskbar taskbar{};

    auto create() -> void {
        const auto dll_instance = GetModuleHandle(nullptr);
        const auto class_name = L"taskbar_lyrics";
        RegisterClassEx(new WNDCLASSEX{
            .cbSize = sizeof(WNDCLASSEX),
            .lpfnWndProc = Window::WindowProc,
            .hInstance = dll_instance,
            .lpszClassName = class_name,
        });
        CreateWindowEx(
            WS_EX_NOPARENTNOTIFY | WS_EX_TRANSPARENT | WS_EX_NOACTIVATE | WS_EX_NOREDIRECTIONBITMAP,
            class_name,
            nullptr,
            WS_CHILD | WS_VISIBLE,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            Taskbar::getHWND(),
            nullptr,
            dll_instance,
            this
        );
    }

    auto runner() -> void {
        MSG msg{};
        while (GetMessage(&msg, nullptr, 0, 0)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
    }

    auto update() -> void {
        if (this->hwnd == nullptr) [[unlikely]] {
            return;
        }

        const auto taskbarFrame = this->taskbar.getRectForTaskbarFrame();
        const auto trayFrameRect = this->taskbar.getRectForTrayFrame();
        const auto widgetsButtonRect = this->taskbar.getRectForWidgetsButton();
        const auto taskListRect = this->taskbar.getRectForTaskList();

        auto offset = 0L;
        auto width = 0L;
        auto height = 0L;

        switch (config.window_alignment) {
            case TASKBAR_WINDOW_ALIGNMENT::TASKBAR_WINDOW_ALIGNMENT_AUTO: [[fallthrough]];
            case TASKBAR_WINDOW_ALIGNMENT::TASKBAR_WINDOW_ALIGNMENT_LEFT: {
                if (Registry::isTaskbarCentered()) {
                    width += taskListRect.left;
                    if (Registry::isWidgetsEnabled()) {
                        offset += widgetsButtonRect.right;
                    }
                    break;
                }
                [[fallthrough]];
            }
            case TASKBAR_WINDOW_ALIGNMENT::TASKBAR_WINDOW_ALIGNMENT_RIGHT: {
                offset += taskListRect.right;
                if (Registry::isTaskbarCentered()) {
                    width += trayFrameRect.left;
                } else if (Registry::isWidgetsEnabled()) {
                    width += widgetsButtonRect.left;
                } else {
                    width += trayFrameRect.left;
                }
                break;
            }
            case TASKBAR_WINDOW_ALIGNMENT::TASKBAR_WINDOW_ALIGNMENT_CENTER: {
                offset += taskbarFrame.left;
                width += taskbarFrame.right;
                break;
            }
        }

        offset += config.margin_left;
        width -= config.margin_right + offset;
        height += taskbarFrame.bottom - taskbarFrame.top;

        BringWindowToTop(this->hwnd);
        MoveWindow(this->hwnd, offset, 0, width, height, false);
        RedrawWindow(this->hwnd, nullptr, nullptr, RDW_INVALIDATE | RDW_UPDATENOW);
    }
};
