#pragma once

#include "DrawWindow.hpp"
#include <Windows.h>
#include <gdiplus.h>
#include <string>
#include <thread>
#include <vector>


class 任务栏窗口类
{
    public:
    绘制窗口类* 绘制窗口;


    public:
    HWND 窗口句柄;


    private:
    std::thread* 剩余宽度检测_线程 = nullptr;
    void 剩余宽度检测();


    private:
    HKEY 注册表句柄;
    std::thread* 监听注册表_线程 = nullptr;
    void 监听注册表();


    private:
    ULONG_PTR gdiplusToken;
    Gdiplus::GdiplusStartupInput gdiplusStartupInput;


    private:
    std::wstring 窗口类名 = L"betterncm_taskbar_lyrics";
    std::wstring 窗口名字 = L"BetterNCM 任务栏歌词类";


    public:
    任务栏窗口类(HINSTANCE, int);
    ~任务栏窗口类();


    private:
    void 注册窗口(HINSTANCE);
    void 创建窗口(HINSTANCE, int);


    private:
    static LRESULT CALLBACK 窗口过程(HWND, UINT, WPARAM, LPARAM);
};


struct Registry
{
    std::wstring 路径;
    std::wstring 键;
    bool &值;
};