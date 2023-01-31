#include "NetworkServer.hpp"
#include "TaskbarWindow.hpp"
#include "TaskbarLyrics.hpp"

#define _CRT_SECURE_NO_WARNINGS


任务栏窗口类* 任务栏歌词类::任务栏窗口;
网络服务器类* 任务栏歌词类::网络服务器;


任务栏歌词类::任务栏歌词类(
    HINSTANCE   hInstance,
    int         nCmdShow
) {
    this->检测实例();
    this->获取端口();

    this->任务栏窗口 = new 任务栏窗口类(hInstance, nCmdShow);
    this->网络服务器 = new 网络服务器类(this->任务栏窗口, this->端口);

    this->网易云进程检测();

    this->任务栏窗口->注册窗口();
    this->任务栏窗口->创建窗口();
    this->任务栏窗口->窗口消息();
}


任务栏歌词类::~任务栏歌词类()
{
    FreeConsole();
    static_cast<void>(UnregisterWaitEx(this->关闭窗口, INVALID_HANDLE_VALUE));
    delete this->网络服务器;
    delete this->任务栏窗口;
    this->网络服务器 = nullptr;
    this->任务栏窗口 = nullptr;
}


void 任务栏歌词类::检测实例()
{
    this->互斥锁 = CreateMutex(NULL, TRUE, this->互斥锁名称.c_str());
    if (GetLastError() == ERROR_ALREADY_EXISTS) {
        HWND 任务栏_句柄 = FindWindow(L"Shell_TrayWnd", NULL);
        HWND 旧句柄 = FindWindowEx(任务栏_句柄, NULL, this->互斥锁名称.c_str(), NULL);
        if (!旧句柄) 旧句柄 = FindWindow(this->互斥锁名称.c_str(), NULL);
        PostMessage(旧句柄, WM_CLOSE, NULL, NULL);
    }
}


void 任务栏歌词类::获取端口()
{
    int argCount;
    LPWSTR* szArgList = CommandLineToArgvW(GetCommandLine(), &argCount);

    if (szArgList[1])
    {
        std::wstringstream 宽字符转换流;
        宽字符转换流 << szArgList[1];
        宽字符转换流 >> this->端口;
    }

    LocalFree(szArgList);
}


void 任务栏歌词类::网易云进程检测()
{
    HWND 网易云句柄 = FindWindow(L"OrpheusBrowserHost", NULL);
    if (网易云句柄)
    {
        DWORD pid;
        GetWindowThreadProcessId(网易云句柄, &pid);
        HANDLE process = OpenProcess(PROCESS_ALL_ACCESS, FALSE, pid);
        RegisterWaitForSingleObject(
            &this->waitHandle,
            process,
            this->关闭窗口,
            NULL,
            INFINITE,
            WT_EXECUTEONLYONCE
        );
    }
}


void CALLBACK 任务栏歌词类::关闭窗口(
    PVOID lpParameter,
    BOOLEAN TimerOrWaitFired
) {
    SendMessage(任务栏窗口->hwnd, WM_CLOSE, NULL, NULL);
}


int APIENTRY wWinMain(
    _In_        HINSTANCE   hInstance,
    _In_opt_    HINSTANCE   hPrevInstance,
    _In_        LPWSTR      lpCmdLine,
    _In_        int         nCmdShow
) {
    #ifdef _DEBUG
        AllocConsole();
        SetConsoleOutputCP(65001);
        static_cast<void>(freopen("conout$", "w", stdout));
    #endif

    任务栏歌词类 任务栏歌词(hInstance, nCmdShow);

    return 0;
}
