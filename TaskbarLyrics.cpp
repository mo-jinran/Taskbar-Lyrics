#include "TaskbarLyrics.hpp"


int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPWSTR lpCmdLine, int nCmdShow) {
    任务栏歌词 任务栏歌词(hInstance, lpCmdLine, nCmdShow);
    任务栏歌词.注册窗口();
    任务栏歌词.创建窗口();
    任务栏歌词.寿命检测();
    任务栏歌词.网络线程();
    任务栏歌词.显示窗口();
    任务栏歌词.窗口消息();
    return 0;
}


任务栏歌词::任务栏歌词(HINSTANCE hInstance, LPWSTR lpCmdLine, int nCmdShow) {
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
    this->wcex.lpfnWndProc = &任务栏歌词::窗口过程;
    this->wcex.cbClsExtra = 0;
    this->wcex.cbWndExtra = 0;
    this->wcex.hInstance = this->hInstance;
    this->wcex.lpszClassName = this->窗口类名.c_str();
    RegisterClassEx(&this->wcex);
}


void 任务栏歌词::创建窗口()
{
    this->parentHwnd = FindWindow(L"Shell_TrayWnd", NULL);
    this->hwnd = CreateWindowEx(
        WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE,
        this->窗口类名.c_str(),
        this->窗口名字.c_str(),
        WS_POPUP | WS_CLIPSIBLINGS,
        CW_USEDEFAULT,
        CW_USEDEFAULT,
        this->DPI(500),
        this->DPI(48),
        this->parentHwnd,
        nullptr,
        hInstance,
        (LPVOID) this
    );
    SetParent(this->hwnd, this->parentHwnd);
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


LRESULT CALLBACK 任务栏歌词::窗口过程(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    任务栏歌词* _this = nullptr;
    if (message == WM_CREATE)
    {
        _this = (任务栏歌词*) (((LPCREATESTRUCT) lParam)->lpCreateParams);
        SetWindowLong(hwnd, GWL_USERDATA, (LONG) _this);
    }
    _this = (任务栏歌词*) GetWindowLong(hwnd, GWL_USERDATA);

    switch (message) {
        case WM_PAINT:      _this->OnPaint();       break;
        case WM_ERASEBKGND: _this->OnEraseBkgnd();  break;
        case WM_CLOSE:      _this->OnClose();       break;
        case WM_DESTROY:    _this->OnDestroy();     break;
        default: return DefWindowProc(hwnd, message, wParam, lParam);
    }

    return 0;
}


void 任务栏歌词::OnPaint()
{
    this->hdc = BeginPaint(this->hwnd, &this->ps);
    GetClientRect(this->hwnd, &this->clientRect);

    auto 宽 = this->clientRect.right - this->clientRect.left;
    auto 高 = this->clientRect.bottom - this->clientRect.top;

    HBITMAP memBitmap = CreateCompatibleBitmap(hdc, 宽, 高);
    HDC memDC = CreateCompatibleDC(this->hdc);
    HBITMAP oldBitmap = (HBITMAP) SelectObject(memDC, memBitmap);

    Graphics graphics(memDC);

    SolidBrush brush(Color(255, 255, 255));
    FontFamily fontFamily(L"Microsoft YaHei");
    Font font(&fontFamily, this->DPI(16), FontStyleRegular, UnitPixel);

    graphics.SetTextRenderingHint(TextRenderingHintSystemDefault);
    graphics.DrawString(this->基本歌词.c_str(), this->基本歌词.size(), &font, PointF((REAL) this->DPI(3), (REAL) this->DPI(3)), &brush);
    graphics.DrawString(this->扩展歌词.c_str(), this->扩展歌词.size(), &font, PointF((REAL) this->DPI(3), (REAL) this->DPI(23)), &brush);

    BitBlt(this->hdc, 0, 0, 宽, 高, memDC, 0, 0, SRCCOPY);

    SelectObject(memDC, oldBitmap);
    DeleteObject(memBitmap);
    DeleteDC(memDC);
    EndPaint(this->hwnd, &this->ps);
}


int 任务栏歌词::OnEraseBkgnd()
{
    return 1;
}


void 任务栏歌词::OnClose()
{
    DestroyWindow(this->hwnd);
}


void 任务栏歌词::OnDestroy()
{
    PostQuitMessage(0);
}


UINT 任务栏歌词::DPI(UINT pixel)
{
    UINT dpi = GetDpiForWindow(this->parentHwnd);
    return dpi * pixel / 96;
}