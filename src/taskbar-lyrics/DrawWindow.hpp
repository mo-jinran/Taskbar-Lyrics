#pragma once

#include <Windows.h>
#include <gdiplus.h>
#include <iostream>
#include <string>


using namespace Gdiplus;


class 绘制窗口类
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
    绘制窗口类(HWND*);


    public:
    bool 深浅模式;
    bool 组件按钮;
    bool 居中对齐;
    bool 锁定对齐;

    std::wstring 基本歌词 = L"桌面歌词启动成功";
    std::wstring 扩展歌词 = L"等待插件端连接";

    std::wstring 字体名称 = L"Microsoft YaHei";

    FontStyle 字体样式_基本歌词 = FontStyleRegular;
    FontStyle 字体样式_扩展歌词 = FontStyleRegular;

    Color 字体颜色_浅色_基本歌词 = Color(0, 0, 0);
    Color 字体颜色_浅色_扩展歌词 = Color(0, 0, 0);
    Color 字体颜色_深色_基本歌词 = Color(255, 255, 255);
    Color 字体颜色_深色_扩展歌词 = Color(255, 255, 255);

    int 左边距 = 0;
    int 右边距 = 0;

    StringAlignment 对齐方式_基本歌词 = StringAlignmentNear;
    StringAlignment 对齐方式_扩展歌词 = StringAlignmentNear;


	public:
    void 更新窗口();


    private:
	void 绘制窗口(UINT, UINT, UINT, UINT);
    void 绘制歌词(HDC&);


    private:
    REAL DPI(UINT);
};
