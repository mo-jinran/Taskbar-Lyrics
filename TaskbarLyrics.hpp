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
    ;
    UINT DPI(UINT);


    private:
    WNDCLASSEX wcex;
    HWND hwnd;
    HWND parentHwnd;
    MSG msg;


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
    RECT clientRect;


    private:
    static LRESULT CALLBACK 窗口过程(HWND, UINT, WPARAM, LPARAM);
    void OnPaint();
    int OnEraseBkgnd();
    void OnClose();
    void OnDestroy();
};
