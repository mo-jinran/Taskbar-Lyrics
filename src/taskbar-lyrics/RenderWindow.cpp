#include "RenderWindow.hpp"

#pragma comment (lib, "Gdiplus.lib")


呈现窗口类::呈现窗口类(
    HWND* 窗口句柄
) {
    this->窗口句柄 = 窗口句柄;

    this->任务栏_句柄 = FindWindow(L"Shell_TrayWnd", NULL);
    this->通知区域_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"TrayNotifyWnd", NULL);
    this->开始按钮_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"Start", NULL);
    HWND 最小化区域_句柄 = FindWindowEx(this->任务栏_句柄, NULL, L"ReBarWindow32", NULL);
    this->活动区域_句柄 = FindWindowEx(最小化区域_句柄, NULL, L"MSTaskSwWClass", NULL);
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
)
{
    HDC hdc = GetDC(*this->窗口句柄);
    HDC memDC = CreateCompatibleDC(hdc);
    HBITMAP memBitmap = CreateCompatibleBitmap(hdc, 宽, 高);
    HBITMAP oldBitmap = HBITMAP(SelectObject(memDC, memBitmap));

    this->绘制歌词(memDC);

    BLENDFUNCTION blend;
    blend.SourceConstantAlpha = 255;
    blend.AlphaFormat = AC_SRC_ALPHA;
    blend.BlendOp = AC_SRC_OVER;
    blend.BlendFlags = 0;

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
    HDC &hdc
) {
    RECT rect;
    GetClientRect(*this->窗口句柄, &rect);

    Gdiplus::Graphics 图形(hdc);
    Gdiplus::FontFamily 字体家族(this->字体名称.c_str());
    Gdiplus::StringFormat 字符串格式(Gdiplus::StringFormatFlagsNoWrap);
    Gdiplus::SolidBrush 画笔_主歌词(this->深浅模式 ? this->字体颜色_浅色_主歌词 : this->字体颜色_深色_主歌词);
    Gdiplus::SolidBrush 画笔_副歌词(this->深浅模式 ? this->字体颜色_浅色_副歌词 : this->字体颜色_深色_副歌词);

    图形.SetTextRenderingHint(Gdiplus::TextRenderingHintAntiAliasGridFit);

    if (this->副歌词.empty())
    {
        Gdiplus::Font 主歌词_字体(&字体家族, this->DPI(20), this->字体样式_主歌词, Gdiplus::UnitPixel);
        字符串格式.SetLineAlignment(Gdiplus::StringAlignmentCenter);
        字符串格式.SetAlignment(this->对齐方式_主歌词);
        // 矩形大小
        Gdiplus::RectF 主歌词_矩形(
            this->DPI(10),
            this->DPI(10),
            rect.right - this->DPI(20),
            rect.bottom - this->DPI(20)
        );
        // 绘制文字
        图形.DrawString(
            this->主歌词.c_str(),
            this->主歌词.size(),
            &主歌词_字体,
            主歌词_矩形,
            &字符串格式,
            &画笔_主歌词
        );
    }
    else
    {
        Gdiplus::Font 主歌词_字体(&字体家族, this->DPI(15), this->字体样式_主歌词, Gdiplus::UnitPixel);
        字符串格式.SetLineAlignment(Gdiplus::StringAlignmentNear);
        字符串格式.SetAlignment(this->对齐方式_主歌词);
        // 矩形大小
        Gdiplus::RectF 主歌词_矩形(
            this->DPI(4),
            this->DPI(4),
            static_cast<Gdiplus::REAL>(rect.right - this->DPI(8)),
            static_cast<Gdiplus::REAL>(rect.bottom / 2 - this->DPI(4))
        );
        // 绘制文字
        图形.DrawString(
            this->主歌词.c_str(),
            this->主歌词.size(),
            &主歌词_字体,
            主歌词_矩形,
            &字符串格式,
            &画笔_主歌词
        );

        Gdiplus::Font 副歌词_字体(&字体家族, this->DPI(15), this->字体样式_副歌词, Gdiplus::UnitPixel);
        字符串格式.SetLineAlignment(Gdiplus::StringAlignmentCenter);
        字符串格式.SetAlignment(this->对齐方式_副歌词);
        // 矩形大小
        Gdiplus::RectF 副歌词_矩形(
            this->DPI(4),
            static_cast<Gdiplus::REAL>(rect.bottom / 2),
            static_cast<Gdiplus::REAL>(rect.right - this->DPI(8)),
            static_cast<Gdiplus::REAL>(rect.bottom / 2 - this->DPI(4))
        );
        // 绘制文字
        图形.DrawString(
            this->副歌词.c_str(),
            this->副歌词.size(),
            &副歌词_字体,
            副歌词_矩形,
            &字符串格式,
            &画笔_副歌词
        );
    }
}


Gdiplus::REAL 呈现窗口类::DPI(
    UINT 像素大小
) {
    auto 屏幕DPI = GetDpiForWindow(*this->窗口句柄);
    auto 新像素大小 = static_cast<Gdiplus::REAL>(像素大小 * 屏幕DPI / 96);
    return 新像素大小;
}