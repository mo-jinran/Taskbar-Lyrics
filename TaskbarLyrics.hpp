#pragma once

#ifndef UNICODE
#define UNICODE
#endif

#include "httplib.h"
#include <windows.h>
#include <gdiplus.h>
#include <string>
#include <codecvt>
#include <regex>
#include <thread>
#include <sstream>

#pragma comment (lib, "Gdiplus.lib")


using namespace Gdiplus;


class 任务栏歌词
{
    public:
    int 寿命 = 30;
    std::thread* 寿命线程 = nullptr;
    void 寿命检测();


    private:
    HINSTANCE hInstance;
    LPWSTR lpCmdLine;
    int nCmdShow;


    private:
    std::wstring_convert<std::codecvt_utf8<wchar_t>> 字符转换;
    std::wstringstream 宽字符转换流;
    UINT DPI(UINT);
    void 更新窗口大小();


    private:
    WNDCLASSEX wcex;
    MSG msg;
    HWND hwnd;


    private:
    HWND taskbarHwnd;
    HWND rebarHwnd;
    HWND trayNotifyHwnd;

    RECT taskbarRect;
    RECT rebarRect;
    RECT trayNotifyRect;


    private:
    std::wstring 窗口类名 = L"betterncm_taskbar_lyrics";
    std::wstring 窗口名字 = L"BetterNCM 任务栏歌词";


    private:
    httplib::Server 网络服务器;
    std::thread* 网络服务器_线程 = nullptr;
    unsigned short 网络服务器_端口 = 3798;


    private:
    std::wstring 基本歌词 = L"桌面歌词：目前暂无歌词";
    std::wstring 扩展歌词 = L"等待插件端传输下一句歌词";


    public:
    任务栏歌词(HINSTANCE, LPWSTR, int);
    ~任务栏歌词();


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
    HDC hdc;
    PAINTSTRUCT ps;
    RECT rect;


    private:
    //UINT 任务栏_运行中的程序_左侧按钮大小 = DPI(48);
    //UINT 任务栏_运行中的程序_左侧搜索大小 = DPI(110);
    Color 画笔颜色 = Color(255, 255, 255);


    private:
    static LRESULT CALLBACK 窗口过程(HWND, UINT, WPARAM, LPARAM);
    void OnPaint();
    bool OnEraseBkgnd();
    void OnSettingChange();
    void OnClose();
    void OnDestroy();
};
