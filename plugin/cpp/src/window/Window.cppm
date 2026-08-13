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
    std::atomic<bool> layoutPending{false};
    std::atomic<bool> lyricsPending{false};
    RECT lastWindowRect{};
    bool hasWindowRect = false;
    UINT taskbarCreatedMessage = 0;
    static constexpr auto LAYOUT_MESSAGE = WM_APP + 1;
    static constexpr auto LYRICS_MESSAGE = WM_APP + 2;
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
        if (this->taskbarCreatedMessage != 0 && message == this->taskbarCreatedMessage) {
            this->hasWindowRect = false;
            this->updateLayout();
            return 0;
        }
        switch (message) {
            case WM_CREATE: {
                this->hwnd.store(hwnd, std::memory_order_release);
                this->renderer.onCreate(hwnd);
                this->taskbar.initialize();
                this->taskbar.setListener(std::bind(&Window::updateLayout, this));
                if (this->layoutPending.exchange(false, std::memory_order_acq_rel)) {
                    PostMessage(hwnd, LAYOUT_MESSAGE, 0, 0);
                } else {
                    this->updateLayout();
                }
                if (this->lyricsPending.exchange(false, std::memory_order_acq_rel)) {
                    PostMessage(hwnd, LYRICS_MESSAGE, 0, 0);
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
                PAINTSTRUCT paint{};
                BeginPaint(hwnd, &paint);
                this->renderer.onPaint();
                EndPaint(hwnd, &paint);
                break;
            }
            case LAYOUT_MESSAGE: {
                this->updateWindow();
                this->layoutPending.store(false, std::memory_order_release);
                if (this->renderer.startTransition()) {
                    SetTimer(hwnd, ANIMATION_TIMER, 16, nullptr);
                }
                InvalidateRect(hwnd, nullptr, false);
                break;
            }
            case LYRICS_MESSAGE: {
                this->lyricsPending.store(false, std::memory_order_release);
                if (this->renderer.startTransition()) {
                    SetTimer(hwnd, ANIMATION_TIMER, 16, nullptr);
                }
                InvalidateRect(hwnd, nullptr, false);
                break;
            }
            case WM_TIMER: {
                if (wParam == ANIMATION_TIMER) {
                    InvalidateRect(hwnd, nullptr, false);
                    if (!this->renderer.isAnimating()) {
                        KillTimer(hwnd, ANIMATION_TIMER);
                    }
                }
                break;
            }
            case WM_DESTROY: {
                KillTimer(hwnd, ANIMATION_TIMER);
                this->hwnd.store(nullptr, std::memory_order_release);
                this->hasWindowRect = false;
                break;
            }
            case WM_NCHITTEST: return HTTRANSPARENT;
            case WM_MOUSEACTIVATE: return MA_NOACTIVATE;
            case WM_ERASEBKGND: return 1;
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
            if (const auto window = this->hwnd.load(std::memory_order_acquire)) {
                ShowWindow(window, SW_HIDE);
            }
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
            if (const auto window = this->hwnd.load(std::memory_order_acquire)) {
                ShowWindow(window, SW_HIDE);
            }
            return;
        }

        const auto window = this->hwnd.load(std::memory_order_acquire);
        if (window != nullptr) {
            const RECT nextRect{
                .left = offset,
                .top = taskbarFrame.top,
                .right = offset + width,
                .bottom = taskbarFrame.top + height
            };
            if (SetWindowPos(
                window,
                HWND_TOPMOST,
                nextRect.left,
                nextRect.top,
                width,
                height,
                SWP_NOACTIVATE | SWP_NOOWNERZORDER | SWP_NOSENDCHANGING | SWP_SHOWWINDOW
            )) {
                this->lastWindowRect = nextRect;
                this->hasWindowRect = true;
            }
        }
    }

public:
    Renderer renderer{};
    Taskbar taskbar{};

    auto create() -> void {
        const auto dll_instance = GetModuleHandle(nullptr);
        const auto class_name = L"taskbar_lyrics";
        this->taskbarCreatedMessage = RegisterWindowMessage(L"TaskbarCreated");
        RegisterClassEx(new WNDCLASSEX{
            .cbSize = sizeof(WNDCLASSEX),
            .lpfnWndProc = Window::WindowProc,
            .hInstance = dll_instance,
            .lpszClassName = class_name,
        });
        CreateWindowEx(
            WS_EX_TRANSPARENT | WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW | WS_EX_NOREDIRECTIONBITMAP,
            class_name,
            nullptr,
            WS_POPUP | WS_DISABLED,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            nullptr,
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

    auto updateLayout() -> void {
        if (this->layoutPending.exchange(true, std::memory_order_acq_rel)) {
            return;
        }
        const auto window = this->hwnd.load(std::memory_order_acquire);
        if (window == nullptr) [[unlikely]] {
            this->layoutPending.store(false, std::memory_order_release);
            return;
        }
        if (!PostMessage(window, LAYOUT_MESSAGE, 0, 0)) {
            this->layoutPending.store(false, std::memory_order_release);
        }
    }

    auto updateLyrics() -> void {
        if (this->lyricsPending.exchange(true, std::memory_order_acq_rel)) {
            return;
        }
        const auto window = this->hwnd.load(std::memory_order_acquire);
        if (window == nullptr) [[unlikely]] {
            this->lyricsPending.store(false, std::memory_order_release);
            return;
        }
        if (!PostMessage(window, LYRICS_MESSAGE, 0, 0)) {
            this->lyricsPending.store(false, std::memory_order_release);
        }
    }
};
