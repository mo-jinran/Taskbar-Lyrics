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
    任务栏歌词.寿命检测();
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
}


任务栏歌词::~任务栏歌词()
{
    GdiplusShutdown(this->gdiplusToken);
    this->网络服务器_线程->detach();
    delete this->网络服务器_线程;
    this->网络服务器_线程 = nullptr;
    this->寿命线程->detach();
    delete this->寿命线程;
    this->寿命线程 = nullptr;
}


void 任务栏歌词::寿命检测()
{
    auto 线程函数 = [&] () {
        while (this->寿命)
        {
            std::this_thread::sleep_for(std::chrono::seconds(1));
            this->寿命 -= 1;
        }
        PostMessage(this->hwnd, WM_CLOSE, NULL, NULL);
    };
    this->寿命线程 = new std::thread(线程函数);
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
        (LPVOID) this
    );

    this->taskbarHwnd = FindWindow(L"Shell_TrayWnd", NULL);
    this->rebarHwnd = FindWindowEx(this->taskbarHwnd, NULL, L"ReBarWindow32", NULL);
    this->trayNotifyHwnd = ::FindWindowEx(this->taskbarHwnd, 0, L"TrayNotifyWnd", NULL);

    GetWindowRect(this->taskbarHwnd, &this->taskbarRect);
    GetWindowRect(this->rebarHwnd, &this->rebarRect);
    GetWindowRect(this->trayNotifyHwnd, &this->trayNotifyRect);

    SetParent(this->hwnd, this->taskbarHwnd);
}


void 任务栏歌词::网络线程()
{
    auto heartbeat = [&] (const httplib::Request& req, httplib::Response& res) {
        this->寿命 = 30;
        res.status = 200;
    };

    auto lyrics = [&] (const httplib::Request& req, httplib::Response& res) {
        auto basic_value = req.get_param_value("basic");
        auto extra_value = req.get_param_value("extra");

        this->基本歌词 = this->字符转换.from_bytes(basic_value);
        this->扩展歌词 = this->字符转换.from_bytes(extra_value);

        InvalidateRect(this->hwnd, nullptr, true);
        res.status = 200;
    };

    auto 线程函数 = [&] () {
        this->网络服务器.Get("/taskbar/heartbeat", heartbeat);
        this->网络服务器.Get("/taskbar/lyrics", lyrics);
        this->网络服务器.listen("127.0.0.1", this->网络服务器_端口);
    };

    this->网络服务器_线程 = new std::thread(线程函数);
}


void 任务栏歌词::显示窗口()
{
    this->更新窗口大小();
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


LRESULT CALLBACK 任务栏歌词::窗口过程(
    HWND    hwnd,
    UINT    message,
    WPARAM  wParam,
    LPARAM  lParam
) {
    任务栏歌词* _this = nullptr;
    if (message == WM_CREATE)
    {
        _this = (任务栏歌词*) (((LPCREATESTRUCT) lParam)->lpCreateParams);
        SetWindowLong(hwnd, GWL_USERDATA, (LONG) _this);
    }
    _this = (任务栏歌词*) GetWindowLong(hwnd, GWL_USERDATA);

    switch (message) {
        case WM_PAINT: _this->OnPaint(); break;
        case WM_ERASEBKGND: _this->OnEraseBkgnd(); break;
        case WM_SETTINGCHANGE: _this->OnSettingChange(); break;
        case WM_CLOSE: _this->OnClose(); break;
        case WM_DESTROY: _this->OnDestroy(); break;
        default: return DefWindowProc(hwnd, message, wParam, lParam);
    }

    return 0;
}


void 任务栏歌词::OnPaint()
{
    this->hdc = BeginPaint(this->hwnd, &this->ps);
    GetClientRect(this->hwnd, &this->rect);

    auto 宽 = this->rect.right - this->rect.left;
    auto 高 = this->rect.bottom - this->rect.top;

    HBITMAP memBitmap = CreateCompatibleBitmap(hdc, 宽, 高);
    HDC memDC = CreateCompatibleDC(this->hdc);
    HBITMAP oldBitmap = (HBITMAP) SelectObject(memDC, memBitmap);


    Graphics graphics(memDC);

    SolidBrush brush(this->画笔颜色);
    FontFamily fontFamily(L"Microsoft YaHei");

    graphics.SetTextRenderingHint(TextRenderingHintAntiAlias);

    if (this->扩展歌词.empty())
    {
        Font font(&fontFamily, this->DPI(20), FontStyleRegular, UnitPixel);
        graphics.DrawString(this->基本歌词.c_str(), this->基本歌词.size(), &font, PointF((REAL) this->DPI(11), (REAL) this->DPI(11)), &brush);
    }
    else
    {
        Font font(&fontFamily, this->DPI(16), FontStyleRegular, UnitPixel);
        graphics.DrawString(this->基本歌词.c_str(), this->基本歌词.size(), &font, PointF((REAL) this->DPI(3), (REAL) this->DPI(3)), &brush);
        graphics.DrawString(this->扩展歌词.c_str(), this->扩展歌词.size(), &font, PointF((REAL) this->DPI(3), (REAL) this->DPI(23)), &brush);
    }


    BitBlt(this->hdc, 0, 0, 宽, 高, memDC, 0, 0, SRCCOPY);
    SelectObject(memDC, oldBitmap);
    DeleteObject(memBitmap);
    DeleteDC(memDC);
    EndPaint(this->hwnd, &this->ps);
}


bool 任务栏歌词::OnEraseBkgnd()
{
    return true;
}


void 任务栏歌词::OnSettingChange()
{
    HKEY key;
    DWORD value;
    DWORD bufferSize;

    std::wstring path = L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize";
    LONG result = RegOpenKeyEx(HKEY_CURRENT_USER, path.c_str(), NULL, KEY_READ, &key);

    if (result == ERROR_SUCCESS) {
        result = RegQueryValueEx(key, L"SystemUsesLightTheme", NULL, NULL, (LPBYTE) &value, &bufferSize);
        if (result == ERROR_SUCCESS) {
            if (value) {
                this->画笔颜色 = Color(31,47,63);
            }
            else {
                this->画笔颜色 = Color(255, 255, 255);
            }
        }
        RegCloseKey(key);
        InvalidateRect(this->hwnd, nullptr, true);
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
    return dpi * pixel / 96;
}


void 任务栏歌词::更新窗口大小()
{
    UINT x = this->DPI(0);
    UINT y = this->DPI(0);
    UINT 宽 = this->DPI(this->rebarRect.left);
    UINT 高 = this->DPI(this->taskbarRect.bottom - this->taskbarRect.top);
    MoveWindow(this->hwnd, x, y, 宽, 高, true);
    InvalidateRect(this->hwnd, nullptr, true);
}