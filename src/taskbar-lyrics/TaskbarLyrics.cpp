#include "NetworkServer.hpp"
#include "CreateWindow.hpp"
#include "TaskbarLyrics.hpp"


任务栏歌词类::任务栏歌词类(
    HINSTANCE   实例句柄,
    int         显示方法
) {
    this->检测实例();
    this->获取端口();

    this->任务栏窗口 = new 任务栏窗口类(实例句柄, 显示方法);
    this->网络服务器 = new 网络服务器类(this->任务栏窗口, this->端口);

    this->网易云进程检测();
}


任务栏歌词类::~任务栏歌词类()
{
    FreeConsole();
    static_cast<void>(UnregisterWaitEx(this->等待句柄, INVALID_HANDLE_VALUE));

    delete this->网络服务器;
    this->网络服务器 = nullptr;

    delete this->任务栏窗口;
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
    auto 关闭窗口 = [] (PVOID lpParameter, BOOLEAN TimerOrWaitFired)
    {
        UNREFERENCED_PARAMETER(TimerOrWaitFired);
        任务栏歌词类* _this = static_cast<任务栏歌词类*>(lpParameter);
        SendMessage(_this->任务栏窗口->窗口句柄, WM_CLOSE, NULL, NULL);
    };

    HWND 网易云句柄 = FindWindow(L"OrpheusBrowserHost", NULL);
    if (网易云句柄)
    {
        DWORD pid;
        GetWindowThreadProcessId(网易云句柄, &pid);
        HANDLE process = OpenProcess(PROCESS_ALL_ACCESS, FALSE, pid); 
        RegisterWaitForSingleObject(&this->等待句柄, process, 关闭窗口, this, INFINITE, WT_EXECUTEONLYONCE);
    }
}


int APIENTRY wWinMain(
    _In_        HINSTANCE   实例句柄,
    _In_opt_    HINSTANCE   前一个实例句柄,
    _In_        LPWSTR      命令行,
    _In_        int         显示方法
) {
    UNREFERENCED_PARAMETER(前一个实例句柄);
    UNREFERENCED_PARAMETER(命令行);

    #ifdef _DEBUG
        AllocConsole();
        SetConsoleOutputCP(65001);
        FILE* stream;
        freopen_s(&stream, "conout$", "w", stdout);
    #endif

    任务栏歌词类 任务栏歌词(实例句柄, 显示方法);

    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return msg.wParam;
}
