#include "NetworkServer.hpp"
#include "CreateWindow.hpp"


网络服务器类::网络服务器类(
    任务栏窗口类* 任务栏窗口,
    unsigned short 端口
) {
    std::cout << u8"端口号：" << 端口 << std::endl;

    this->任务栏窗口 = 任务栏窗口;

    std::vector<Route> routes = {
        {"/taskbar/lyrics", std::bind(&网络服务器类::歌词, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/font", std::bind(&网络服务器类::字体, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/style", std::bind(&网络服务器类::样式, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/color", std::bind(&网络服务器类::颜色, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/position", std::bind(&网络服务器类::位置, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/align", std::bind(&网络服务器类::对齐, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/screen", std::bind(&网络服务器类::屏幕, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/start", std::bind(&网络服务器类::开始, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/stop", std::bind(&网络服务器类::停止, this, std::placeholders::_1, std::placeholders::_2)}
    };

    for (const auto& route : routes)
    {
        this->网络服务器.Get(route.path, route.callback);
    }

    auto 线程函数 = [端口, this] () {
        this->网络服务器.listen("127.0.0.1", 端口);
    };

    this->网络服务器_线程 = new std::thread(线程函数);
}


网络服务器类::~网络服务器类()
{
    this->网络服务器.stop();

    this->网络服务器_线程->detach();
    delete this->网络服务器_线程;
    this->网络服务器_线程 = nullptr;

    this->任务栏窗口 = nullptr;
}


void 网络服务器类::歌词(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto basic = req.get_param_value("basic");
    auto extra = req.get_param_value("extra");

    this->任务栏窗口->绘制窗口->基本歌词 = this->字符转换.from_bytes(basic);
    this->任务栏窗口->绘制窗口->扩展歌词 = this->字符转换.from_bytes(extra);

    this->任务栏窗口->绘制窗口->更新窗口();
    res.status = 200;

    std::cout << u8"基本歌词：" << basic << std::endl;
    std::cout << u8"扩展歌词：" << extra << std::endl;
}


void 网络服务器类::字体(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto font_family = req.get_param_value("font_family");

    HFONT font = CreateFont(
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        this->字符转换.from_bytes(font_family).c_str()
    );

    if (font)
    {
        this->任务栏窗口->绘制窗口->字体名称 = this->字符转换.from_bytes(font_family).c_str();
        DeleteObject(font);
    }

    res.status = 200;
    this->任务栏窗口->绘制窗口->更新窗口();
}


void 网络服务器类::样式(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto basic = req.get_param_value("basic");
    auto extra = req.get_param_value("extra");

    // 基本歌词
    if (basic == std::string("Regular"))
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleRegular;
    }
    else if (basic == std::string("Bold"))
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleBold;
    }
    else if (basic == std::string("Italic"))
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleItalic;
    }
    else if (basic == std::string("BoldItalic"))
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleBoldItalic;
    }
    else if (basic == std::string("Underline"))
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleUnderline;
    }
    else if (basic == std::string("Strikeout"))
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleStrikeout;
    }

    // 扩展歌词
    if (extra == std::string("Regular"))
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleRegular;
    }
    else if (extra == std::string("Bold"))
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleBold;
    }
    else if (extra == std::string("Italic"))
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleItalic;
    }
    else if (extra == std::string("BoldItalic"))
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleBoldItalic;
    }
    else if (extra == std::string("Underline"))
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleUnderline;
    }
    else if (extra == std::string("Strikeout"))
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleStrikeout;
    }

    res.status = 200;
    this->任务栏窗口->绘制窗口->更新窗口();
}


void 网络服务器类::颜色(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto light_basic = req.get_param_value("light_basic");
    auto light_extra = req.get_param_value("light_extra");
    auto dark_basic = req.get_param_value("dark_basic");
    auto dark_extra = req.get_param_value("dark_extra");

    auto 设置颜色 = [&](const std::string& color_str, Gdiplus::Color& color_obj) {
        if (color_str.size() == 6) {
            int color_hex = std::stoul(color_str, nullptr, 16);
            int r = (color_hex & 0xFF0000) >> 16;
            int g = (color_hex & 0x00FF00) >> 8;
            int b = (color_hex & 0x0000FF);
            color_obj = Gdiplus::Color(r, g, b);
        }
    };

    设置颜色(light_basic, this->任务栏窗口->绘制窗口->字体颜色_浅色_基本歌词);
    设置颜色(light_extra, this->任务栏窗口->绘制窗口->字体颜色_浅色_扩展歌词);
    设置颜色(dark_basic, this->任务栏窗口->绘制窗口->字体颜色_深色_基本歌词);
    设置颜色(dark_extra, this->任务栏窗口->绘制窗口->字体颜色_深色_扩展歌词);

    this->任务栏窗口->绘制窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::位置(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto position = req.get_param_value("position");
    auto lock = req.get_param_value("lock");

    if (lock == std::string("true"))
    {
        this->任务栏窗口->绘制窗口->锁定对齐 = true;
    }
    else if (lock == std::string("false"))
    {
        this->任务栏窗口->绘制窗口->锁定对齐 = false;
    }

    if (position == std::string("left"))
    {
        this->任务栏窗口->绘制窗口->居中对齐 = true;
    }
    else if (position == std::string("right"))
    {
        this->任务栏窗口->绘制窗口->居中对齐 = false;
    }

    this->任务栏窗口->绘制窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::对齐(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto basic = req.get_param_value("basic");
    auto extra = req.get_param_value("extra");

    // 基本歌词
    if (basic == std::string("left"))
    {
        this->任务栏窗口->绘制窗口->对齐方式_基本歌词 = Gdiplus::StringAlignmentNear;
    }
    else if (basic == std::string("center"))
    {
        this->任务栏窗口->绘制窗口->对齐方式_基本歌词 = Gdiplus::StringAlignmentCenter;
    }
    else if (basic == std::string("right"))
    {
        this->任务栏窗口->绘制窗口->对齐方式_基本歌词 = Gdiplus::StringAlignmentFar;
    }

    // 扩展歌词
    if (extra == std::string("left"))
    {
        this->任务栏窗口->绘制窗口->对齐方式_扩展歌词 = Gdiplus::StringAlignmentNear;
    }
    else if (extra == std::string("center"))
    {
        this->任务栏窗口->绘制窗口->对齐方式_扩展歌词 = Gdiplus::StringAlignmentCenter;
    }
    else if (extra == std::string("right"))
    {
        this->任务栏窗口->绘制窗口->对齐方式_扩展歌词 = Gdiplus::StringAlignmentFar;
    }

    this->任务栏窗口->绘制窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::屏幕(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto parent_taskbar = req.get_param_value("parent_taskbar");

    this->任务栏窗口->绘制窗口->任务栏_句柄 = FindWindow(this->字符转换.from_bytes(parent_taskbar).c_str(), NULL);
    this->任务栏窗口->绘制窗口->开始按钮_句柄 = FindWindowEx(this->任务栏窗口->绘制窗口->任务栏_句柄, NULL, L"Start", NULL);

    GetWindowRect(this->任务栏窗口->绘制窗口->任务栏_句柄, &this->任务栏窗口->绘制窗口->任务栏_矩形);
    GetWindowRect(this->任务栏窗口->绘制窗口->开始按钮_句柄, &this->任务栏窗口->绘制窗口->开始按钮_矩形);

    SetParent(this->任务栏窗口->窗口句柄, this->任务栏窗口->绘制窗口->任务栏_句柄);

    this->任务栏窗口->绘制窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::开始(
    const httplib::Request& req,
    httplib::Response& res
) {
    this->任务栏窗口->绘制窗口->基本歌词 = L"成功连接到插件端";
    this->任务栏窗口->绘制窗口->扩展歌词 = L"等待下一句歌词...";

    this->任务栏窗口->绘制窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::停止(
    const httplib::Request& req,
    httplib::Response& res
) {
    this->任务栏窗口->绘制窗口->基本歌词 = L"检测到网易云音乐重载页面";
    this->任务栏窗口->绘制窗口->扩展歌词 = L"正在尝试关闭任务栏歌词...";

    this->网络服务器.stop();
    this->任务栏窗口->绘制窗口->更新窗口();
    SendMessage(任务栏窗口->窗口句柄, WM_CLOSE, NULL, NULL);
    res.status = 200;
}