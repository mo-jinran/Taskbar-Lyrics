#pragma once

#ifndef UNICODE
#define UNICODE
#endif

#include "httplib.h"
#include <windows.h>
#include <gdiplus.h>
#include <string>
#include <codecvt>
#include <thread>

#pragma comment (lib, "Gdiplus.lib")


using namespace Gdiplus;


class 任务栏歌词类
{
    public:
    static 任务栏歌词类* _this;
    HANDLE 互斥锁;

    private:
    HINSTANCE hInstance;
    LPWSTR lpCmdLine;
    int nCmdShow;


    private:
    HANDLE waitHandle;
    std::thread* 剩余宽度检测_线程 = nullptr;
    void 剩余宽度检测();


    private:
    std::wstring_convert<std::codecvt_utf8<wchar_t>> 字符转换;
    std::wstringstream 宽字符转换流;
    UINT DPI(UINT);
    void 更新窗口();
    bool 读取注册表(std::wstring, std::wstring, DWORD&);


    private:
    WNDCLASSEX wcex;
    MSG msg;
    HWND hwnd;


    private:
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


    private:
    httplib::Server 网络服务器;
    std::thread* 网络服务器_线程 = nullptr;
    unsigned short 网络服务器_端口 = 3798;


    private:
    std::wstring 基本歌词 = L"桌面歌词启动成功";
    std::wstring 扩展歌词 = L"等待插件端连接";


    public:
    任务栏歌词类(HINSTANCE, LPWSTR, int);
    ~任务栏歌词类();


    public:
    void 注册窗口();
    void 创建窗口();
    void 网络线程();
    void 显示窗口();
    void 窗口消息();


    private:
    ULONG_PTR gdiplusToken;
    GdiplusStartupInput gdiplusStartupInput;


    private:
    bool 深浅模式;
    bool 组件按钮;
    bool 居中对齐;


    private:
    std::wstring 字体名称 = L"Microsoft YaHei";
    Color 字体颜色_浅色_基本歌词 = Color(0, 0, 0);
    Color 字体颜色_浅色_扩展歌词 = Color(0, 0, 0);
    Color 字体颜色_深色_基本歌词 = Color(255, 255, 255);
    Color 字体颜色_深色_扩展歌词 = Color(255, 255, 255);

    StringAlignment 对齐方式_基本歌词 = StringAlignmentNear;
    StringAlignment 对齐方式_扩展歌词 = StringAlignmentNear;

    bool 强制使用设置位置选项;


    private:
    static void CALLBACK 网易云进程结束(PVOID, BOOLEAN);
    static LRESULT CALLBACK 窗口过程(HWND, UINT, WPARAM, LPARAM);
    void OnPaint();
    void OnEraseBkgnd();
    void OnSettingChange();
    void OnClose();
    void OnDestroy();
};

任务栏歌词类* 任务栏歌词类::_this = nullptr;
