#include "RenderWindow.hpp"

#pragma comment (lib, "d2d1.lib")
#pragma comment (lib, "dwrite.lib")


呈现窗口类::呈现窗口类(
    HWND* 窗口句柄
) {
    this->窗口句柄 = 窗口句柄;

    this->任务栏_句柄 = FindWindow(L"Shell_TrayWnd", NULL);
    this->通知区域_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"TrayNotifyWnd", NULL);
    this->开始按钮_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"Start", NULL);
    HWND 最小化区域_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"ReBarWindow32", NULL);
    this->活动区域_句柄 = FindWindowEx(最小化区域_句柄, NULL, L"MSTaskSwWClass", NULL);

    // 创建D2D工厂
    D2D1CreateFactory(
        D2D1_FACTORY_TYPE_SINGLE_THREADED,
        &this->D2D工厂
    );

    D2D1_RENDER_TARGET_PROPERTIES renderTargetProperties = D2D1::RenderTargetProperties();
    renderTargetProperties.pixelFormat.format = DXGI_FORMAT_B8G8R8A8_UNORM;
    renderTargetProperties.pixelFormat.alphaMode = D2D1_ALPHA_MODE_PREMULTIPLIED;

    // 创建DC渲染目标
    this->D2D工厂->CreateDCRenderTarget(
        &renderTargetProperties,
        &this->D2D呈现目标
    );

    // 主歌词笔刷
    this->D2D呈现目标->CreateSolidColorBrush(
        D2D1::ColorF(0x000000, 1),
        &this->D2D纯色笔刷
    );

    // 创建DWrite工厂
    DWriteCreateFactory(
        DWRITE_FACTORY_TYPE_SHARED,
        __uuidof(IDWriteFactory),
        reinterpret_cast<IUnknown**>(&this->DWrite工厂)
    );
}


呈现窗口类::~呈现窗口类()
{
    this->D2D工厂->Release();
    this->D2D工厂 = nullptr;

    this->D2D呈现目标->Release();
    this->D2D呈现目标 = nullptr;

    this->D2D纯色笔刷->Release();
    this->D2D纯色笔刷 = nullptr;

    this->DWrite工厂->Release();
    this->DWrite工厂 = nullptr;

    this->窗口句柄 = nullptr;
}


void 呈现窗口类::更新窗口()
{
    GetWindowRect(this->任务栏_句柄, &this->任务栏_矩形);
    GetWindowRect(this->通知区域_句柄, &this->通知区域_矩形);
    GetWindowRect(this->开始按钮_句柄, &this->开始按钮_矩形);
    GetWindowRect(this->活动区域_句柄, &this->活动区域_矩形);

    long 左 = 0;
    long 上 = 0;
    long 宽 = 0;
    long 高 = this->任务栏_矩形.bottom - this->任务栏_矩形.top;

    switch (this->窗口位置)
    {
        case WindowAlignment::WindowAlignmentLeft:
        {
            if (this->居中对齐)
            {
                左 = static_cast<long>(this->组件按钮 ? this->DPI(160) : 0) + this->左边距;
                宽 = this->开始按钮_矩形.left - static_cast<long>(this->组件按钮 ? this->DPI(160) : 0) - this->左边距 - this->右边距;
            }
            else
            {
                左 = 0 + this->左边距;
                宽 = this->通知区域_矩形.left - 0 - this->左边距 - this->右边距;
            }
        }
        break;

        case WindowAlignment::WindowAlignmentCenter:
        {
            int center = (this->任务栏_矩形.right - this->任务栏_矩形.left) / 2;
            int lw = this->活动区域_矩形.right - this->开始按钮_矩形.left;
            int rw = this->通知区域_矩形.right - this->通知区域_矩形.left;

            if (lw > rw)
            {
                左 = lw + this->左边距;
                宽 = (center - lw) * 2 - this->左边距 - this->右边距;
            }
            else
            {
                左 = center - (center - rw) + this->左边距;
                宽 = (center - rw) * 2 - this->左边距 - this->右边距;
            }
        }
        break;

        case WindowAlignment::WindowAlignmentRight:
        {
            左 = this->活动区域_矩形.right + this->左边距;;
            宽 = this->通知区域_矩形.left - this->活动区域_矩形.right - this->左边距 - this->右边距;
        }
        break;
    }

    MoveWindow(*this->窗口句柄, 左, 上, 宽, 高, false);
    this->绘制窗口(左, 上, 宽, 高);
}


void 呈现窗口类::绘制窗口(
    long 左,
    long 上,
    long 宽,
    long 高
) {
    RECT rect = {};
    GetClientRect(*this->窗口句柄, &rect);

    HDC hdc = GetDC(*this->窗口句柄);
    HDC memDC = CreateCompatibleDC(hdc);
    HBITMAP memBitmap = CreateCompatibleBitmap(hdc, 宽, 高);
    HBITMAP oldBitmap = HBITMAP(SelectObject(memDC, memBitmap));

    this->绘制歌词(memDC, rect);

    BLENDFUNCTION blend = {
        AC_SRC_OVER,
        0,
        255,
        AC_SRC_ALPHA
    };

    POINT 目标位置 = { 左, 上 };
    SIZE 大小 = { 宽, 高 };
    POINT 来源位置 = { 0, 0 };

    UpdateLayeredWindow(*this->窗口句柄, hdc, &目标位置, &大小, memDC, &来源位置, 0, &blend, ULW_ALPHA);

    SelectObject(memDC, oldBitmap);
    DeleteObject(memBitmap);
    DeleteDC(memDC);
    ReleaseDC(*this->窗口句柄, hdc);
}


void 呈现窗口类::绘制歌词(
    HDC& hdc,
    RECT& rect
) {
    this->D2D呈现目标->BindDC(hdc, &rect);
    this->D2D呈现目标->BeginDraw();

    if (this->副歌词.empty())
    {
        // 创建文字格式
        this->DWrite工厂->CreateTextFormat(
            this->字体名称.c_str(),
            nullptr,
            this->字体样式_主歌词_字重,
            this->字体样式_主歌词_斜体,
            DWRITE_FONT_STRETCH_NORMAL,
            this->DPI(20),
            L"zh-CN",
            &this->DWrite主歌词文本格式
        );

        // 创建文字布局
        this->DWrite工厂->CreateTextLayout(
            this->主歌词.c_str(),
            this->主歌词.size(),
            this->DWrite主歌词文本格式,
            (float) (rect.right - rect.left),
            (float) (rect.bottom - rect.top),
            &this->DWrite主歌词文本布局
        );

        this->DWrite主歌词文本布局->SetWordWrapping(DWRITE_WORD_WRAPPING_NO_WRAP);
        this->DWrite主歌词文本布局->SetTextAlignment(this->对齐方式_主歌词);
        this->DWrite主歌词文本布局->SetUnderline(this->字体样式_主歌词_下划线, DWRITE_TEXT_RANGE{0, this->主歌词.size()});
        this->DWrite主歌词文本布局->SetStrikethrough(this->字体样式_主歌词_删除线, DWRITE_TEXT_RANGE{0, this->主歌词.size()});
        this->D2D纯色笔刷->SetColor(this->深浅模式 ? this->字体颜色_浅色_主歌词 : this->字体颜色_深色_主歌词);

        //绘制文字显示
        this->D2D呈现目标->DrawTextLayout(
            D2D1::Point2F(this->DPI(10), this->DPI(10)),
            this->DWrite主歌词文本布局,
            this->D2D纯色笔刷,
            D2D1_DRAW_TEXT_OPTIONS_NO_SNAP
        );

        this->DWrite主歌词文本格式->Release();
        this->DWrite主歌词文本格式 = nullptr;
        this->DWrite主歌词文本布局->Release();
        this->DWrite主歌词文本布局 = nullptr;
    }
    else
    {
        // 创建文字格式
        this->DWrite工厂->CreateTextFormat(
            this->字体名称.c_str(),
            nullptr,
            this->字体样式_主歌词_字重,
            this->字体样式_主歌词_斜体,
            DWRITE_FONT_STRETCH_NORMAL,
            this->DPI(15),
            L"zh-CN",
            &this->DWrite主歌词文本格式
        );

        // 创建文字布局
        this->DWrite工厂->CreateTextLayout(
            this->主歌词.c_str(),
            this->主歌词.size(),
            this->DWrite主歌词文本格式,
            (float) (rect.right - rect.left),
            (float) (rect.bottom - rect.top),
            &this->DWrite主歌词文本布局
        );

        this->DWrite主歌词文本布局->SetWordWrapping(DWRITE_WORD_WRAPPING_NO_WRAP);
        this->DWrite主歌词文本布局->SetTextAlignment(this->对齐方式_主歌词);
        this->DWrite主歌词文本布局->SetUnderline(this->字体样式_主歌词_下划线, DWRITE_TEXT_RANGE{0, this->主歌词.size()});
        this->DWrite主歌词文本布局->SetStrikethrough(this->字体样式_主歌词_删除线, DWRITE_TEXT_RANGE{0, this->主歌词.size()});
        this->D2D纯色笔刷->SetColor(this->深浅模式 ? this->字体颜色_浅色_主歌词 : this->字体颜色_深色_主歌词);

        //绘制文字显示
        this->D2D呈现目标->DrawTextLayout(
            D2D1::Point2F(this->DPI(5), this->DPI(5)),
            this->DWrite主歌词文本布局,
            this->D2D纯色笔刷,
            D2D1_DRAW_TEXT_OPTIONS_NO_SNAP
        );

        /******************************************/

        // 创建文字格式
        this->DWrite工厂->CreateTextFormat(
            this->字体名称.c_str(),
            nullptr,
            this->字体样式_副歌词_字重,
            this->字体样式_副歌词_斜体,
            DWRITE_FONT_STRETCH_NORMAL,
            this->DPI(15),
            L"zh-CN",
            &this->DWrite副歌词文本格式
        );

        // 创建文字布局
        this->DWrite工厂->CreateTextLayout(
            this->副歌词.c_str(),
            this->副歌词.size(),
            this->DWrite副歌词文本格式,
            (float) (rect.right - rect.left),
            (float) (rect.bottom - rect.top),
            &this->DWrite副歌词文本布局
        );

        this->DWrite副歌词文本布局->SetWordWrapping(DWRITE_WORD_WRAPPING_NO_WRAP);
        this->DWrite副歌词文本布局->SetTextAlignment(this->对齐方式_副歌词);
        this->DWrite副歌词文本布局->SetUnderline(this->字体样式_副歌词_下划线, DWRITE_TEXT_RANGE{0, this->副歌词.size()});
        this->DWrite副歌词文本布局->SetStrikethrough(this->字体样式_副歌词_删除线, DWRITE_TEXT_RANGE{0, this->副歌词.size()});
        this->D2D纯色笔刷->SetColor(this->深浅模式 ? this->字体颜色_浅色_副歌词 : this->字体颜色_深色_副歌词);

        //绘制文字显示
        this->D2D呈现目标->DrawTextLayout(
            D2D1::Point2F(this->DPI(5), (float) (rect.bottom - rect.top) / 2),
            this->DWrite副歌词文本布局,
            this->D2D纯色笔刷,
            D2D1_DRAW_TEXT_OPTIONS_NO_SNAP
        );

        this->DWrite主歌词文本格式->Release();
        this->DWrite主歌词文本格式 = nullptr;
        this->DWrite主歌词文本布局->Release();
        this->DWrite主歌词文本布局 = nullptr;
        this->DWrite副歌词文本格式->Release();
        this->DWrite副歌词文本格式 = nullptr;
        this->DWrite副歌词文本布局->Release();
        this->DWrite副歌词文本布局 = nullptr;
    }

    this->D2D呈现目标->EndDraw();
}


float 呈现窗口类::DPI(
    UINT 像素大小
) {
    auto 屏幕DPI = GetDpiForWindow(*this->窗口句柄);
    auto 新像素大小 = static_cast<float>(像素大小 * 屏幕DPI / 96);
    return 新像素大小;
}
