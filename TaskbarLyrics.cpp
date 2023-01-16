#include "TaskbarLyrics.hpp"


int WINAPI wWinMain(
    _In_        HINSTANCE   hInstance,
    _In_opt_    HINSTANCE   hPrevInstance,
    _In_        LPWSTR      lpCmdLine,
    _In_        int         nCmdShow
) {
    任务栏歌词 任务栏歌词(hInstance, lpCmdLine, nCmdShow);
    任务栏歌词.注册窗口();
    任务栏歌词.创建窗口();
    任务栏歌词.网络线程();
    任务栏歌词.显示窗口();
    任务栏歌词.窗口消息();

    return 0;
}


任务栏歌词::任务栏歌词(
    HINSTANCE   hInstance,
    LPWSTR      lpCmdLine,
    int         nCmdShow
) {
    this->互斥锁 = CreateMutex(NULL, TRUE, this->窗口类名.c_str());
    if (GetLastError() == ERROR_ALREADY_EXISTS) {
        HWND taskbarHwnd = FindWindow(L"Shell_TrayWnd", NULL);
        HWND oldHwnd = FindWindowEx(taskbarHwnd, NULL, this->窗口类名.c_str(), NULL);
        PostMessage(oldHwnd, WM_CLOSE, NULL, NULL);
    }

    this->_this = this;

    this->hInstance = hInstance;
    this->lpCmdLine = lpCmdLine;
    this->nCmdShow = nCmdShow;

    int argCount;
    LPWSTR* szArgList = CommandLineToArgvW(GetCommandLine(), &argCount);

    if (szArgList[1])
    {
        this->宽字符转换流 << szArgList[1];
        this->宽字符转换流 >> this->网络服务器_端口;
    }

    LocalFree(szArgList);
    GdiplusStartup(&this->gdiplusToken, &this->gdiplusStartupInput, NULL);

    HWND OrpheusHwnd = FindWindow(L"OrpheusBrowserHost", NULL);
    if (OrpheusHwnd)
    {
        DWORD pid;
        GetWindowThreadProcessId(OrpheusHwnd, &pid);
        HANDLE process = OpenProcess(PROCESS_ALL_ACCESS, FALSE, pid);
        RegisterWaitForSingleObject(
            &this->waitHandle,
            process,
            this->网易云进程结束,
            NULL,
            INFINITE,
            WT_EXECUTEONLYONCE
        );
    }

    this->最小化区域检测();
}


任务栏歌词::~任务栏歌词()
{
    GdiplusShutdown(this->gdiplusToken);
    UnregisterWaitEx(this->网易云进程结束, INVALID_HANDLE_VALUE);
    ReleaseMutex(this->互斥锁);

    this->网络服务器_线程->detach();
    delete this->网络服务器_线程;
    this->网络服务器_线程 = nullptr;

    this->最小化区域检测_线程->detach();
    delete this->最小化区域检测_线程;
    this->最小化区域检测_线程 = nullptr;

    delete this->_this;
    this->_this = nullptr;
}


void 任务栏歌词::注册窗口()
{
    this->wcex.cbSize = sizeof(WNDCLASSEX);
    this->wcex.style = CS_HREDRAW | CS_VREDRAW;
    this->wcex.lpfnWndProc = this->窗口过程;
    this->wcex.cbClsExtra = 0;
    this->wcex.cbWndExtra = 0;
    this->wcex.hInstance = this->hInstance;
    this->wcex.lpszClassName = this->窗口类名.c_str();
    RegisterClassEx(&this->wcex);
}


void 任务栏歌词::创建窗口()
{
    this->hwnd = CreateWindowEx(
        WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE,
        this->窗口类名.c_str(),
        this->窗口名字.c_str(),
        WS_POPUP,
        CW_USEDEFAULT,
        CW_USEDEFAULT,
        NULL,
        NULL,
        NULL,
        NULL,
        this->hInstance,
        NULL
    );

    this->taskbarHwnd = FindWindow(L"Shell_TrayWnd", NULL);
    this->rebarHwnd = FindWindowEx(this->taskbarHwnd, NULL, L"ReBarWindow32", NULL);

    GetWindowRect(this->taskbarHwnd, &this->taskbarRect);
    GetWindowRect(this->rebarHwnd, &this->rebarRect);

    this->DPI(this->taskbarRect);
    this->DPI(this->rebarRect);

    SetParent(this->hwnd, this->taskbarHwnd);
}


void 任务栏歌词::网络线程()
{
    auto lyrics = [&] (const httplib::Request& req, httplib::Response& res) {
        auto basic_text = req.get_param_value("basic");
        auto extra_text = req.get_param_value("extra");

        this->基本歌词 = this->字符转换.from_bytes(basic_text);
        this->扩展歌词 = this->字符转换.from_bytes(extra_text);

        this->更新窗口();
        res.status = 200;
    };

    auto font = [&] (const httplib::Request& req, httplib::Response& res) {
        auto font_family = req.get_param_value("font_family");

        HFONT font = CreateFont(
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            this->字符转换.from_bytes(font_family).c_str()
        );
        if (font) this->字体名称 = this->字符转换.from_bytes(font_family).c_str();
        DeleteObject(font);

        this->更新窗口();
        res.status = 200;
    };

    auto color = [&] (const httplib::Request& req, httplib::Response& res) {
        auto light_basic_color_str = req.get_param_value("light_basic");
        auto light_extra_color_str = req.get_param_value("light_extra");
        auto dark_basic_color_str = req.get_param_value("dark_basic");
        auto dark_extra_color_str = req.get_param_value("dark_extra");

        if (light_basic_color_str.size() == 6)
        {
            int light_basic_color_hex = std::stoul(light_basic_color_str, nullptr, 16);
            int light_basic_r = (light_basic_color_hex & 0xFF0000) >> 16;
            int light_basic_g = (light_basic_color_hex & 0x00FF00) >> 8;
            int light_basic_b = (light_basic_color_hex & 0x0000FF);
            this->字体颜色_浅色_基本歌词 = Color(light_basic_r, light_basic_g, light_basic_b);
        }

        if (light_extra_color_str.size() == 6)
        {
            int light_extra_color_hex = std::stoul(light_extra_color_str, nullptr, 16);
            int light_extra_r = (light_extra_color_hex & 0xFF0000) >> 16;
            int light_extra_g = (light_extra_color_hex & 0x00FF00) >> 8;
            int light_extra_b = (light_extra_color_hex & 0x0000FF);
            this->字体颜色_浅色_扩展歌词 = Color(light_extra_r, light_extra_g, light_extra_b);
        }

        if (dark_basic_color_str.size() == 6)
        {
            int dark_basic_color_hex = std::stoul(dark_basic_color_str, nullptr, 16);
            int dark_basic_r = (dark_basic_color_hex & 0xFF0000) >> 16;
            int dark_basic_g = (dark_basic_color_hex & 0x00FF00) >> 8;
            int dark_basic_b = (dark_basic_color_hex & 0x0000FF);
            this->字体颜色_深色_基本歌词 = Color(dark_basic_r, dark_basic_g, dark_basic_b);
        }

        if (dark_extra_color_str.size() == 6)
        {
            int dark_extra_color_hex = std::stoul(dark_extra_color_str, nullptr, 16);
            int dark_extra_r = (dark_extra_color_hex & 0xFF0000) >> 16;
            int dark_extra_g = (dark_extra_color_hex & 0x00FF00) >> 8;
            int dark_extra_b = (dark_extra_color_hex & 0x0000FF);
            this->字体颜色_深色_扩展歌词 = Color(dark_extra_r, dark_extra_g, dark_extra_b);
        }

        this->更新窗口();
        res.status = 200;
    };

    auto screen = [&] (const httplib::Request& req, httplib::Response& res) {
        auto parent_taskbar = req.get_param_value("parent_taskbar");

        this->taskbarHwnd = FindWindow(this->字符转换.from_bytes(parent_taskbar).c_str(), NULL);
        this->rebarHwnd = FindWindowEx(this->taskbarHwnd, NULL, L"ReBarWindow32", NULL);

        GetWindowRect(this->taskbarHwnd, &this->taskbarRect);
        GetWindowRect(this->rebarHwnd, &this->rebarRect);

        this->DPI(this->taskbarRect);
        this->DPI(this->rebarRect);

        SetParent(this->hwnd, this->taskbarHwnd);
        this->更新窗口();
        res.status = 200;
    };

    auto 线程函数 = [&] () {
        this->网络服务器.Get("/taskbar/lyrics", lyrics);
        this->网络服务器.Get("/taskbar/font", font);
        this->网络服务器.Get("/taskbar/color", color);
        this->网络服务器.Get("/taskbar/screen", screen);
        this->网络服务器.listen("127.0.0.1", this->网络服务器_端口);
    };

    this->网络服务器_线程 = new std::thread(线程函数);
}


void 任务栏歌词::显示窗口()
{
    this->更新窗口();
    ShowWindow(this->hwnd, this->nCmdShow);
    UpdateWindow(this->hwnd);
}


void 任务栏歌词::窗口消息()
{
    while (GetMessage(&this->msg, NULL, 0, 0)) {
        TranslateMessage(&this->msg);
        DispatchMessage(&this->msg);
    }
}


void 任务栏歌词::网易云进程结束(
    PVOID lpParameter,
    BOOLEAN TimerOrWaitFired
) {
    任务栏歌词* _this = 任务栏歌词::_this;
    PostMessage(_this->hwnd, WM_CLOSE, NULL, NULL);
    _this = nullptr;
}


LRESULT CALLBACK 任务栏歌词::窗口过程(
    HWND    hwnd,
    UINT    message,
    WPARAM  wParam,
    LPARAM  lParam
) {
    任务栏歌词* _this = 任务栏歌词::_this;

    switch (message) {
        case WM_PAINT:          _this->OnPaint();           break;
        case WM_ERASEBKGND:     _this->OnEraseBkgnd();      break;
        case WM_SETTINGCHANGE:  _this->OnSettingChange();   break;
        case WM_CLOSE:          _this->OnClose();           break;
        case WM_DESTROY:        _this->OnDestroy();         break;
        default: return DefWindowProc(hwnd, message, wParam, lParam);
    }

    _this = nullptr;
    return 0;
}


void 任务栏歌词::OnPaint()
{
    PAINTSTRUCT ps;
    RECT rect;
    HDC hdc = BeginPaint(this->hwnd, &ps);
    GetClientRect(this->hwnd, &rect);

    auto 宽 = rect.right - rect.left;
    auto 高 = rect.bottom - rect.top;

    HBITMAP memBitmap = CreateCompatibleBitmap(hdc, 宽, 高);
    HDC memDC = CreateCompatibleDC(hdc);
    HBITMAP oldBitmap = (HBITMAP) SelectObject(memDC, memBitmap);


    Graphics graphics(memDC);
    graphics.SetTextRenderingHint(TextRenderingHintAntiAlias);

    FontFamily fontFamily(this->字体名称.c_str());

    SolidBrush 画笔_基本歌词(this->深浅模式 ? this->字体颜色_浅色_基本歌词 : this->字体颜色_深色_基本歌词);
    SolidBrush 画笔_扩展歌词(this->深浅模式 ? this->字体颜色_浅色_扩展歌词 : this->字体颜色_深色_扩展歌词);

    if (this->扩展歌词.empty())
    {
        Font font(&fontFamily, this->DPI(20), FontStyleRegular, UnitPixel);
        PointF 基本歌词位置((REAL) this->DPI(11), (REAL) this->DPI(11));
        graphics.DrawString(this->基本歌词.c_str(), this->基本歌词.size(), &font, 基本歌词位置, &画笔_基本歌词);
    }
    else
    {
        Font font(&fontFamily, this->DPI(16), FontStyleRegular, UnitPixel);
        PointF 基本歌词位置((REAL) this->DPI(3), (REAL) this->DPI(3));
        PointF 扩展歌词位置((REAL) this->DPI(3), (REAL) this->DPI(23));
        graphics.DrawString(this->基本歌词.c_str(), this->基本歌词.size(), &font, 基本歌词位置, &画笔_基本歌词);
        graphics.DrawString(this->扩展歌词.c_str(), this->扩展歌词.size(), &font, 扩展歌词位置, &画笔_扩展歌词);
    }


    BitBlt(hdc, 0, 0, 宽, 高, memDC, 0, 0, SRCCOPY);
    SelectObject(memDC, oldBitmap);
    DeleteObject(memBitmap);
    DeleteDC(memDC);
    EndPaint(this->hwnd, &ps);
}


bool 任务栏歌词::OnEraseBkgnd()
{
    return true;
}


void 任务栏歌词::OnSettingChange()
{
    RegistrySetting settings[] = {
        {
            L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
            L"SystemUsesLightTheme",
            this->深浅模式
        }, {
            L"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
            L"TaskbarDa",
            this->组件按钮
        }, {
            L"Software\\Microsoft\\Windows\\CurrentVersion\\Search",
            L"SearchboxTaskbarMode",
            this->搜索按钮
        }, {
            L"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
            L"ShowTaskViewButton",
            this->任务按钮
        }, {
            L"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
            L"TaskbarMn",
            this->聊天按钮
        }
    };

    for (auto& setting : settings)
    {
        DWORD value;
        if (!this->读取注册表(setting.path, setting.key, value))
        {
            setting.value = value ? true : false;
            this->更新窗口();
        }
    }
}


void 任务栏歌词::OnClose()
{
    DestroyWindow(this->hwnd);
}


void 任务栏歌词::OnDestroy()
{
    PostQuitMessage(0);
}


UINT 任务栏歌词::DPI(
    UINT pixel
) {
    UINT dpi = GetDpiForWindow(this->taskbarHwnd);
    return pixel * dpi / 96;
}


void 任务栏歌词::DPI(
    RECT& rect
) {
    rect.left = this->DPI(rect.left);
    rect.top = this->DPI(rect.top);
    rect.right = this->DPI(rect.right);
    rect.bottom = this->DPI(rect.bottom);
}


void 任务栏歌词::更新窗口()
{
    GetWindowRect(this->taskbarHwnd, &this->taskbarRect);
    GetWindowRect(this->rebarHwnd, &this->rebarRect);

    UINT 左 = 0;
    UINT 上 = 0;
    UINT 宽 = this->rebarRect.left - this->DPI(48);
    UINT 高 = this->taskbarRect.bottom - this->taskbarRect.top;

    左 += this->组件按钮 ? this->DPI(160) : 0;

    宽 -= this->组件按钮 ? this->DPI(160) : 0;
    宽 -= this->搜索按钮 ? this->DPI(106) : 0;
    宽 -= this->任务按钮 ? this->DPI(44) : 0;
    宽 -= this->聊天按钮 ? this->DPI(44) : 0;

    MoveWindow(this->hwnd, 左, 上, 宽, 高, true);
    InvalidateRect(this->hwnd, nullptr, true);
}


bool 任务栏歌词::读取注册表(
    std::wstring path,
    std::wstring keyName,
    DWORD& value
) {
    HKEY key;
    DWORD bufferSize;
    if (RegOpenKeyEx(HKEY_CURRENT_USER, path.c_str(), NULL, KEY_READ, &key)) return true;
    if (RegQueryValueEx(key, keyName.c_str(), NULL, NULL, (LPBYTE) &value, &bufferSize)) return true;
    RegCloseKey(key);
    return false;
}


void 任务栏歌词::最小化区域检测()
{
    auto 线程函数 = [&] () {
        while (true)
        {
            std::this_thread::sleep_for(std::chrono::seconds(1));
            RECT rect;
            GetWindowRect(this->rebarHwnd, &rect);
            if (
                this->rebarRect.left != rect.left ||
                this->rebarRect.top != rect.top ||
                this->rebarRect.right != rect.right ||
                this->rebarRect.bottom != rect.bottom
                ) {
                this->rebarRect = rect;
                this->更新窗口();
            }
        }
    };

    this->最小化区域检测_线程 = new std::thread(线程函数);
}
