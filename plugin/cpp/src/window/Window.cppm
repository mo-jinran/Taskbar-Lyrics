export module window.Window;

import <Windows.h>;
import <atomic>;
import <functional>;
import plugin.Config;
import taskbar.Taskbar;
import taskbar.Registry;
import window.Renderer;

export class Window {
private:
    std::atomic<HWND> hwnd{nullptr};
    std::atomic<bool> updatePending{false};
    static constexpr auto UPDATE_MESSAGE = WM_APP + 1;
    static constexpr auto ANIMATION_TIMER = 1;

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
                this->hwnd.store(hwnd, std::memory_order_release);
                this->renderer.onCreate(hwnd);
                this->taskbar.initialize();
                this->taskbar.setListener(std::bind(&Window::update, this));
                if (this->updatePending.exchange(false, std::memory_order_acq_rel)) {
                    PostMessage(hwnd, UPDATE_MESSAGE, 0, 0);
                }
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
            case UPDATE_MESSAGE: {
                this->updateWindow();
                if (this->renderer.startTransition()) {
                    SetTimer(hwnd, ANIMATION_TIMER, 16, nullptr);
                }
                RedrawWindow(hwnd, nullptr, nullptr, RDW_INVALIDATE | RDW_UPDATENOW);
                break;
            }
            case WM_TIMER: {
                if (wParam == ANIMATION_TIMER) {
                    RedrawWindow(hwnd, nullptr, nullptr, RDW_INVALIDATE | RDW_UPDATENOW);
                    if (!this->renderer.isAnimating()) {
                        KillTimer(hwnd, ANIMATION_TIMER);
                    }
                }
                break;
            }
            case WM_DESTROY: {
                KillTimer(hwnd, ANIMATION_TIMER);
                this->hwnd.store(nullptr, std::memory_order_release);
                break;
            }
            default: return DefWindowProc(hwnd, message, wParam, lParam);
        }
        return 0;
    }

    auto updateWindow() -> void {
        if (!this->taskbar.ensureInitialized()) {
            return;
        }

        const auto taskbarFrame = this->taskbar.getRectForTaskbarFrame();
        const auto trayFrameRect = this->taskbar.getRectForTrayFrame();
        const auto widgetsButtonRect = this->taskbar.getRectForWidgetsButton();
        const auto taskListRect = this->taskbar.getRectForTaskList();
        if (taskbarFrame.right <= taskbarFrame.left || taskbarFrame.bottom <= taskbarFrame.top) {
            return;
        }

        const auto snapshot = getConfigSnapshot();

        auto offset = 0L;
        auto width = 0L;
        auto height = 0L;

        switch (snapshot.window_alignment) {
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

        offset += snapshot.margin_left;
        width -= snapshot.margin_right + offset;
        height += taskbarFrame.bottom - taskbarFrame.top;
        if (width <= 0 || height <= 0) {
            return;
        }

        const auto window = this->hwnd.load(std::memory_order_acquire);
        if (window != nullptr) {
            BringWindowToTop(window);
            MoveWindow(window, offset, 0, width, height, false);
        }
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
        this->updatePending.store(true, std::memory_order_release);
        const auto window = this->hwnd.load(std::memory_order_acquire);
        if (window == nullptr) [[unlikely]] {
            return;
        }
        PostMessage(window, UPDATE_MESSAGE, 0, 0);
    }
};
