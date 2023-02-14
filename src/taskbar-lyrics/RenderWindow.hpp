#pragma once

#include <Windows.h>
#include <gdiplus.h>
#include <string>


enum WindowAlignment
{
    WindowAlignmentLeft = 0,
    WindowAlignmentCenter = 1,
    WindowAlignmentRight = 2
};


class 呈现窗口类
{
    private:
    HWND *窗口句柄;


    public:
    HWND 任务栏_句柄;
    HWND 通知区域_句柄;
    HWND 开始按钮_句柄;
    HWND 活动区域_句柄;

    RECT 任务栏_矩形;
    RECT 通知区域_矩形;
    RECT 开始按钮_矩形;
    RECT 活动区域_矩形;


    public:
    呈现窗口类(HWND*);


    public:
    bool 深浅模式 = true;
    bool 组件按钮 = true;
    bool 居中对齐 = true;
    bool 锁定对齐 = false;

    std::wstring 主歌词 = L"桌面歌词启动成功";
    std::wstring 副歌词 = L"等待插件端连接";

    std::wstring 字体名称 = L"Microsoft YaHei";

    Gdiplus::FontStyle 字体样式_主歌词 = Gdiplus::FontStyleRegular;
    Gdiplus::FontStyle 字体样式_副歌词 = Gdiplus::FontStyleRegular;

    Gdiplus::Color 字体颜色_浅色_主歌词 = Gdiplus::Color(0, 0, 0);
    Gdiplus::Color 字体颜色_浅色_副歌词 = Gdiplus::Color(0, 0, 0);
    Gdiplus::Color 字体颜色_深色_主歌词 = Gdiplus::Color(255, 255, 255);
    Gdiplus::Color 字体颜色_深色_副歌词 = Gdiplus::Color(255, 255, 255);

    WindowAlignment 窗口位置 = WindowAlignment::WindowAlignmentLeft;

    int 左边距 = 0;
    int 右边距 = 0;

    Gdiplus::StringAlignment 对齐方式_主歌词 = Gdiplus::StringAlignmentNear;
    Gdiplus::StringAlignment 对齐方式_副歌词 = Gdiplus::StringAlignmentNear;


	public:
    void 更新窗口();


    private:
	void 绘制窗口(long, long, long, long);
    void 绘制歌词(HDC&);


    private:
    Gdiplus::REAL DPI(UINT);
};
