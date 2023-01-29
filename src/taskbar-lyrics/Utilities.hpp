#pragma once

#include <Windows.h>
#include <gdiplus.h>
#include <sstream>
#include <codecvt>
#include <string>


class 工具类
{
    public:
    static HWND 任务栏_句柄;


    public:
    static std::wstring_convert<std::codecvt_utf8<wchar_t>> 字符转换;
    static std::wstringstream 宽字符转换流;
    static bool 读取注册表(std::wstring, std::wstring, DWORD&);
    static Gdiplus::REAL DPI(UINT);
};
