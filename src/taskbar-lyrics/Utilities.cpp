#include "Utilities.hpp"


HWND 工具类::任务栏_句柄;
std::wstring_convert<std::codecvt_utf8<wchar_t>> 工具类::字符转换;


bool 工具类::读取注册表(
    std::wstring path,
    std::wstring keyName,
    DWORD& value
) {
    HKEY key;
    DWORD bufferSize = sizeof(DWORD);
    if (RegOpenKeyEx(HKEY_CURRENT_USER, path.c_str(), NULL, KEY_READ, &key)) return true;
    if (RegQueryValueEx(key, keyName.c_str(), NULL, NULL, (LPBYTE) &value, &bufferSize)) return true;
    RegCloseKey(key);
    return false;
}


Gdiplus::REAL 工具类::DPI(
    UINT pixel
) {
    UINT dpi = GetDpiForWindow(工具类::任务栏_句柄);
    return static_cast<Gdiplus::REAL>(pixel * dpi / 96);
}
