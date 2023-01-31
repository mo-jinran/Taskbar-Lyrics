#include "TaskbarWindow.hpp"
#include "Utilities.hpp"
#include <iostream>

#pragma comment (lib, "Gdiplus.lib")


任务栏窗口类* 任务栏窗口类::_this;


任务栏窗口类::任务栏窗口类(
    HINSTANCE   hInstance,
    int         nCmdShow
) {
    this->hInstance = hInstance;
    this->nCmdShow = nCmdShow;
    this->_this = this;

    GdiplusStartup(&this->gdiplusToken, &this->gdiplusStartupInput, NULL);

    this->任务栏_句柄 = FindWindow(L"Shell_TrayWnd", NULL);
    this->开始按钮_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"Start", NULL);
    this->活动区域_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"ReBarWindow32", NULL);
    this->活动区域_句柄 = FindWindowEx(this->活动区域_句柄, NULL, L"MSTaskSwWClass", NULL);
    this->通知区域_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"TrayNotifyWnd", NULL);

    GetWindowRect(this->任务栏_句柄, &this->任务栏_矩形);
    GetWindowRect(this->开始按钮_句柄, &this->开始按钮_矩形);
    GetWindowRect(this->活动区域_句柄, &this->活动区域_矩形);
    GetWindowRect(this->通知区域_句柄, &this->通知区域_矩形);

    this->剩余宽度检测();
    this->监听注册表();
}


任务栏窗口类::~任务栏窗口类()
{
    Gdiplus::GdiplusShutdown(this->gdiplusToken);
    this->剩余宽度检测_线程->detach();
    delete this->剩余宽度检测_线程;
    this->剩余宽度检测_线程 = nullptr;

    this->监听注册表_线程->detach();
    delete this->监听注册表_线程;
    this->监听注册表_线程 = nullptr;
}


void 任务栏窗口类::注册窗口()
{
    this->wcex.cbSize = sizeof(WNDCLASSEX);
    this->wcex.style = CS_HREDRAW | CS_VREDRAW;
    this->wcex.lpfnWndProc = 任务栏窗口类::窗口过程;
    this->wcex.cbClsExtra = 0;
    this->wcex.cbWndExtra = 0;
    this->wcex.hInstance = this->hInstance;
    this->wcex.lpszClassName = this->窗口类名.c_str();
    RegisterClassEx(&this->wcex);
}


void 任务栏窗口类::创建窗口()
{
    this->hwnd = CreateWindowEx(
        WS_EX_TOOLWINDOW,
        this->窗口类名.c_str(),
        this->窗口名字.c_str(),
        WS_POPUP | WS_CLIPSIBLINGS,
        CW_USEDEFAULT,
        CW_USEDEFAULT,
        NULL,
        NULL,
        NULL,
        NULL,
        this->hInstance,
        NULL
    );

    SetParent(this->hwnd, this->任务栏_句柄);
}


void 任务栏窗口类::显示窗口()
{
    this->更新窗口();
    ShowWindow(this->hwnd, this->nCmdShow);
    UpdateWindow(this->hwnd);
}


void 任务栏窗口类::窗口消息()
{
    while (GetMessage(&this->msg, NULL, 0, 0)) {
        TranslateMessage(&this->msg);
        DispatchMessage(&this->msg);
    }
}


void 任务栏窗口类::更新窗口()
{
    GetWindowRect(this->任务栏_句柄, &this->任务栏_矩形);
    GetWindowRect(this->开始按钮_句柄, &this->开始按钮_矩形);
    GetWindowRect(this->活动区域_句柄, &this->活动区域_矩形);
    GetWindowRect(this->通知区域_句柄, &this->通知区域_矩形);

    UINT 左;
    UINT 上;
    UINT 宽;
    UINT 高;

    if (this->居中对齐)
    {
        左 = static_cast<UINT>(this->组件按钮 ? 工具类::DPI(160) : 0);
        上 = 0;
        宽 = this->开始按钮_矩形.left - static_cast<UINT>(this->组件按钮 ? 工具类::DPI(160) : 0);
        高 = this->任务栏_矩形.bottom - this->任务栏_矩形.top;
    }
    else
    {
        左 = this->活动区域_矩形.right;
        上 = 0;
        宽 = this->通知区域_矩形.left - this->活动区域_矩形.right;
        高 = this->任务栏_矩形.bottom - this->任务栏_矩形.top;
    }

    MoveWindow(this->hwnd, 左, 上, 宽, 高, true);
    InvalidateRect(this->hwnd, nullptr, true);
}


void 任务栏窗口类::剩余宽度检测()
{
    auto 线程函数 = [&] () {
        while (true)
        {
            std::this_thread::sleep_for(std::chrono::seconds(1));

            RECT 任务栏_矩形;
            RECT 开始按钮_矩形;
            RECT 活动区域_矩形;
            RECT 通知区域_矩形;

            GetWindowRect(this->任务栏_句柄, &任务栏_矩形);
            GetWindowRect(this->开始按钮_句柄, &开始按钮_矩形);
            GetWindowRect(this->活动区域_句柄, &活动区域_矩形);
            GetWindowRect(this->通知区域_句柄, &通知区域_矩形);

            if (std::memcmp(&this->任务栏_矩形, &任务栏_矩形, sizeof(RECT)))
            {
                this->任务栏_矩形 = 任务栏_矩形;
                this->更新窗口();
            }

            if (this->居中对齐)
            {
                if (std::memcmp(&this->开始按钮_矩形, &开始按钮_矩形, sizeof(RECT)))
                {
                    this->开始按钮_矩形 = 开始按钮_矩形;
                    this->更新窗口();
                }
            }
            else
            {
                if (std::memcmp(&this->活动区域_矩形, &活动区域_矩形, sizeof(RECT)))
                {
                    this->活动区域_矩形 = 活动区域_矩形;
                    this->更新窗口();
                }
                if (std::memcmp(&this->通知区域_矩形, &通知区域_矩形, sizeof(RECT))) {
                    this->通知区域_矩形 = 通知区域_矩形;
                    this->更新窗口();
                }
            }

        }
    };

    this->剩余宽度检测_线程 = new std::thread(线程函数);
}


void 任务栏窗口类::监听注册表()
{
    auto 奇怪函数 = [this] () {
        std::vector<Registry> 注册表列表 = {
            {
                L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
                L"SystemUsesLightTheme",
                this->深浅模式
            },
            {
                L"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
                L"TaskbarAl",
                this->居中对齐
            },
            {
                L"Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced",
                L"TaskbarDa",
                this->组件按钮
            }
        };

        for (const auto& 注册表 : 注册表列表)
        {
            DWORD value;
            if (!工具类::读取注册表(注册表.路径, 注册表.键, value))
            {
                注册表.值 = static_cast<bool>(value);
            }
        }

        this->更新窗口();
    };

    奇怪函数();

    auto 线程函数 = [this, 奇怪函数] () {
        // 持续监听注册表
        while (true)
        {
            // 打开注册表
            if (!this->注册表句柄)
            {
                std::wstring path = L"Software\\Microsoft\\Windows\\CurrentVersion";
                RegOpenKeyEx(HKEY_CURRENT_USER, path.c_str(), NULL, KEY_NOTIFY, &this->注册表句柄);
                continue;
            }

            // 监听注册表
            if (RegNotifyChangeKeyValue(this->注册表句柄, true, REG_NOTIFY_CHANGE_LAST_SET, NULL, false))
            {
                continue;
            }

            奇怪函数();
        }
    };

    this->剩余宽度检测_线程 = new std::thread(线程函数);
}


LRESULT CALLBACK 任务栏窗口类::窗口过程(
    HWND    hwnd,
    UINT    message,
    WPARAM  wParam,
    LPARAM  lParam
) {
    任务栏窗口类* _this = 任务栏窗口类::_this;

    switch (message) {
        case WM_PAINT:          _this->OnPaint();           break;
        case WM_ERASEBKGND:     _this->OnEraseBkgnd();      break;
        case WM_CLOSE:          _this->OnClose();           break;
        case WM_DESTROY:        _this->OnDestroy();         break;
        default: return DefWindowProc(hwnd, message, wParam, lParam);
    }

    _this = nullptr;
    return 0;
}


void 任务栏窗口类::OnPaint()
{
    PAINTSTRUCT ps;
    RECT rect;
    HDC hdc = BeginPaint(this->hwnd, &ps);
    GetClientRect(this->hwnd, &rect);
    工具类::任务栏_句柄 = this->任务栏_句柄;

    auto 宽 = rect.right - rect.left;
    auto 高 = rect.bottom - rect.top;

    HBITMAP memBitmap = CreateCompatibleBitmap(hdc, 宽, 高);
    HDC memDC = CreateCompatibleDC(hdc);
    HBITMAP oldBitmap = (HBITMAP) SelectObject(memDC, memBitmap);


    Graphics graphics(memDC);
    graphics.SetTextRenderingHint(TextRenderingHintAntiAliasGridFit);


    #ifdef _DEBUG
    Pen myPen(Color(255, 255, 255), 1);
    Rect myRect(rect.left, rect.top, rect.right - 1, rect.bottom - 1);
    graphics.DrawRectangle(&myPen, myRect);
    #endif


    FontFamily fontFamily(this->字体名称.c_str());
    StringFormat stringFormat;
    stringFormat.SetLineAlignment(StringAlignmentFar);
    stringFormat.SetFormatFlags(StringFormatFlagsNoWrap);

    SolidBrush 画笔_基本歌词(this->深浅模式 ? this->字体颜色_浅色_基本歌词 : this->字体颜色_深色_基本歌词);
    SolidBrush 画笔_扩展歌词(this->深浅模式 ? this->字体颜色_浅色_扩展歌词 : this->字体颜色_深色_扩展歌词);

    if (this->扩展歌词.empty())
    {
        Font font(&fontFamily, 工具类::DPI(20), FontStyleRegular, UnitPixel);
        RectF 基本歌词_矩形(工具类::DPI(10), 工具类::DPI(10), rect.right - 工具类::DPI(20), rect.bottom - 工具类::DPI(20));
        stringFormat.SetAlignment(this->对齐方式_基本歌词);
        graphics.DrawString(this->基本歌词.c_str(), this->基本歌词.size(), &font, 基本歌词_矩形, &stringFormat, &画笔_基本歌词);

        #ifdef _DEBUG
        graphics.DrawRectangle(&myPen, 基本歌词_矩形);
        #endif
    }
    else
    {
        Font font(&fontFamily, 工具类::DPI(16), FontStyleRegular, UnitPixel);

        stringFormat.SetAlignment(this->对齐方式_基本歌词);
        RectF 基本歌词_矩形(工具类::DPI(3), 工具类::DPI(3), rect.right - 工具类::DPI(6), rect.bottom / 2 - 工具类::DPI(3));
        graphics.DrawString(this->基本歌词.c_str(), this->基本歌词.size(), &font, 基本歌词_矩形, &stringFormat, &画笔_基本歌词);

        stringFormat.SetAlignment(this->对齐方式_扩展歌词);
        RectF 扩展歌词_矩形(工具类::DPI(3), rect.bottom / 2, rect.right - 工具类::DPI(6), rect.bottom / 2 - 工具类::DPI(3));
        graphics.DrawString(this->扩展歌词.c_str(), this->扩展歌词.size(), &font, 扩展歌词_矩形, &stringFormat, &画笔_扩展歌词);

        #ifdef _DEBUG
        graphics.DrawRectangle(&myPen, 基本歌词_矩形);
        graphics.DrawRectangle(&myPen, 扩展歌词_矩形);
        #endif
    }


    BitBlt(hdc, 0, 0, 宽, 高, memDC, 0, 0, SRCCOPY);
    SelectObject(memDC, oldBitmap);
    DeleteObject(memBitmap);
    DeleteDC(memDC);
    EndPaint(this->hwnd, &ps);
}


void 任务栏窗口类::OnEraseBkgnd()
{
    return;
}


void 任务栏窗口类::OnClose()
{
    DestroyWindow(this->hwnd);
}


void 任务栏窗口类::OnDestroy()
{
    PostQuitMessage(0);
}
