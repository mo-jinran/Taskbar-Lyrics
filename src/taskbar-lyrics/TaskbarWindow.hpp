#pragma once

#include <Windows.h>
#include <gdiplus.h>
#include <string>
#include <thread>


using namespace Gdiplus;


class 任务栏窗口类
{
    public:
    static 任务栏窗口类* _this;


    private:
    HINSTANCE hInstance;
    int nCmdShow;


    private:
    std::thread* 剩余宽度检测_线程 = nullptr;
    void 剩余宽度检测();


    public:
    WNDCLASSEX wcex;
    MSG msg;
    HWND hwnd;


    public:
    HWND 任务栏_句柄;
    HWND 开始按钮_句柄;
    HWND 活动区域_句柄;
    HWND 通知区域_句柄;

    RECT 任务栏_矩形;
    RECT 开始按钮_矩形;
    RECT 活动区域_矩形;
    RECT 通知区域_矩形;


    private:
    std::wstring 窗口类名 = L"betterncm_taskbar_lyrics";
    std::wstring 窗口名字 = L"BetterNCM 任务栏歌词类";


    public:
    任务栏窗口类(HINSTANCE, int);
    ~任务栏窗口类();


    public:
    void 注册窗口();
    void 创建窗口();
    void 显示窗口();
    void 窗口消息();
    void 更新窗口();


    private:
    ULONG_PTR gdiplusToken;
    Gdiplus::GdiplusStartupInput gdiplusStartupInput;


    public:
    bool 深浅模式;
    bool 组件按钮;
    bool 居中对齐;
    bool 强制使用设置位置选项;


    public:
    std::wstring 基本歌词 = L"桌面歌词启动成功";
    std::wstring 扩展歌词 = L"等待插件端连接";


    public:
    std::wstring 字体名称 = L"Microsoft YaHei";
    Color 字体颜色_浅色_基本歌词 = Color(0, 0, 0);
    Color 字体颜色_浅色_扩展歌词 = Color(0, 0, 0);
    Color 字体颜色_深色_基本歌词 = Color(255, 255, 255);
    Color 字体颜色_深色_扩展歌词 = Color(255, 255, 255);

    StringAlignment 对齐方式_基本歌词 = StringAlignmentNear;
    StringAlignment 对齐方式_扩展歌词 = StringAlignmentNear;


    private:
    static LRESULT CALLBACK 窗口过程(HWND, UINT, WPARAM, LPARAM);
    void OnPaint();
    void OnEraseBkgnd();
    void OnSettingChange();
    void OnClose();
    void OnDestroy();
};
