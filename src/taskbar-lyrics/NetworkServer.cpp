#include "NetworkServer.hpp"
#include "CreateWindow.hpp"
#include "nlohmann/json.hpp"


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
        {"/taskbar/margin", std::bind(&网络服务器类::边距, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/align", std::bind(&网络服务器类::对齐, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/screen", std::bind(&网络服务器类::屏幕, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/start", std::bind(&网络服务器类::开始, this, std::placeholders::_1, std::placeholders::_2)},
        {"/taskbar/stop", std::bind(&网络服务器类::停止, this, std::placeholders::_1, std::placeholders::_2)}
    };

    for (const auto& route : routes)
    {
        this->网络服务器.Post(route.path, route.callback);
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
    auto json = nlohmann::json::parse(req.body);
    auto basic = json["basic"].get<std::string>();
    auto extra = json["extra"].get<std::string>();

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
    auto json = nlohmann::json::parse(req.body);
    auto font_family = json["font_family"].get<std::string>();

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
    auto json = nlohmann::json::parse(req.body);
    auto basic = json["basic"].get<std::string>();
    auto extra = json["extra"].get<std::string>();

    // 基本歌词
    if (basic == "Regular")
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleRegular;
    }
    else if (basic == "Bold")
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleBold;
    }
    else if (basic == "Italic")
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleItalic;
    }
    else if (basic == "BoldItalic")
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleBoldItalic;
    }
    else if (basic == "Underline")
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleUnderline;
    }
    else if (basic == "Strikeout")
    {
        this->任务栏窗口->绘制窗口->字体样式_基本歌词 = Gdiplus::FontStyleStrikeout;
    }

    // 扩展歌词
    if (extra == "Regular")
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleRegular;
    }
    else if (extra == "Bold")
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleBold;
    }
    else if (extra == "Italic")
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleItalic;
    }
    else if (extra == "BoldItalic")
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleBoldItalic;
    }
    else if (extra =="Underline")
    {
        this->任务栏窗口->绘制窗口->字体样式_扩展歌词 = Gdiplus::FontStyleUnderline;
    }
    else if (extra == "Strikeout")
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
    auto json = nlohmann::json::parse(req.body);
    auto light_basic = json["light_basic"].get<std::string>();
    auto light_extra = json["light_extra"].get<std::string>();
    auto dark_basic = json["dark_basic"].get<std::string>();
    auto dark_extra = json["dark_extra"].get<std::string>();

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
    auto json = nlohmann::json::parse(req.body);
    auto position = json["position"].get<std::string>();
    auto lock = json["lock"].get<std::string>();

    this->任务栏窗口->绘制窗口->窗口位置 = position;

    if (lock == "true")
    {
        this->任务栏窗口->绘制窗口->锁定对齐 = true;
    }
    else if (lock == "false")
    {
        this->任务栏窗口->绘制窗口->锁定对齐 = false;
    }

    this->任务栏窗口->绘制窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::边距(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);
    auto left = json["left"].get<std::string>();
    auto right = json["right"].get<std::string>();

    int 左;
    int 右;

    std::stringstream 字符转换流;

    if (left.at(0) == '-')
    {
        字符转换流 << left.substr(1, left.size());
        字符转换流 >> 左;
        字符转换流.clear();
        this->任务栏窗口->绘制窗口->左边距 = (0 - 左);
    }
    else
    {
        字符转换流 << left;
        字符转换流 >> 左;
        字符转换流.clear();
        this->任务栏窗口->绘制窗口->左边距 = 左;
    }

    if (right.at(0) == '-')
    {
        字符转换流 << right.substr(1, right.size());
        字符转换流 >> 右;
        字符转换流.clear();
        this->任务栏窗口->绘制窗口->右边距 = (0 - 右);
    }
    else
    {
        字符转换流 << right;
        字符转换流 >> 右;
        字符转换流.clear();
        this->任务栏窗口->绘制窗口->右边距 = 右;
    }

    this->任务栏窗口->绘制窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::对齐(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);
    auto basic = json["basic"].get<std::string>();
    auto extra = json["extra"].get<std::string>();

    // 基本歌词
    if (basic == "left")
    {
        this->任务栏窗口->绘制窗口->对齐方式_基本歌词 = Gdiplus::StringAlignmentNear;
    }
    else if (basic == "center")
    {
        this->任务栏窗口->绘制窗口->对齐方式_基本歌词 = Gdiplus::StringAlignmentCenter;
    }
    else if (basic == "right")
    {
        this->任务栏窗口->绘制窗口->对齐方式_基本歌词 = Gdiplus::StringAlignmentFar;
    }

    // 扩展歌词
    if (extra == "left")
    {
        this->任务栏窗口->绘制窗口->对齐方式_扩展歌词 = Gdiplus::StringAlignmentNear;
    }
    else if (extra == "center")
    {
        this->任务栏窗口->绘制窗口->对齐方式_扩展歌词 = Gdiplus::StringAlignmentCenter;
    }
    else if (extra == "right")
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
    auto json = nlohmann::json::parse(req.body);
    auto parent_taskbar = json["parent_taskbar"].get<std::string>();

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