#pragma once

#include <windows.h>
#include <string>
#include <sstream>
#include <iostream>


class 任务栏歌词类
{
    public:
    任务栏歌词类(HINSTANCE, int);
    ~任务栏歌词类();


    private:
    HANDLE 互斥锁 = nullptr;
    std::wstring 互斥锁名称 = L"BetterNCM_TaskbarLyrics";
    unsigned short 端口 = 3798;

    private:
    任务栏窗口类* 任务栏窗口;
    网络服务器类* 网络服务器;


    private:
    void 检测实例();
    void 获取端口();
};
