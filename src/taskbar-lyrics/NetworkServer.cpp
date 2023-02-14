#include "NetworkServer.hpp"
#include "CreateWindow.hpp"
#include "nlohmann/json.hpp"


网络服务器类::网络服务器类(
    任务栏窗口类* 任务栏窗口,
    unsigned short 端口
) {
    this->任务栏窗口 = 任务栏窗口;

    auto handler = [this] (auto func) {
        auto bind = std::bind(func,this,std::placeholders::_1,std::placeholders::_2);
        return httplib::Server::Handler(bind);
    };

    auto 线程函数 = [this, handler, 端口] () {
        this->网络服务器.Post("/taskbar/lyrics", handler(&网络服务器类::歌词));
        this->网络服务器.Post("/taskbar/font", handler(&网络服务器类::字体));
        this->网络服务器.Post("/taskbar/style", handler(&网络服务器类::样式));
        this->网络服务器.Post("/taskbar/color", handler(&网络服务器类::颜色));
        this->网络服务器.Post("/taskbar/position", handler(&网络服务器类::位置));
        this->网络服务器.Post("/taskbar/margin", handler(&网络服务器类::边距));
        this->网络服务器.Post("/taskbar/align", handler(&网络服务器类::对齐));
        this->网络服务器.Post("/taskbar/screen", handler(&网络服务器类::屏幕));
        this->网络服务器.Post("/taskbar/start", handler(&网络服务器类::开始));
        this->网络服务器.Post("/taskbar/stop", handler(&网络服务器类::停止));
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

    this->任务栏窗口->呈现窗口->主歌词 = this->字符转换.from_bytes(basic);
    this->任务栏窗口->呈现窗口->副歌词 = this->字符转换.from_bytes(extra);

    this->任务栏窗口->呈现窗口->更新窗口();
    res.status = 200;
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
        this->任务栏窗口->呈现窗口->字体名称 = this->字符转换.from_bytes(font_family).c_str();
        DeleteObject(font);
    }

    res.status = 200;
    this->任务栏窗口->呈现窗口->更新窗口();
}


void 网络服务器类::样式(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);
    auto basic = json["basic"].get<Gdiplus::FontStyle>();
    auto extra = json["extra"].get<Gdiplus::FontStyle>();

    this->任务栏窗口->呈现窗口->字体样式_主歌词 = basic;
    this->任务栏窗口->呈现窗口->字体样式_副歌词 = extra;

    res.status = 200;
    this->任务栏窗口->呈现窗口->更新窗口();
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
        if (color_str.at(0) == '#' && color_str.size() == 7) {
            int color_hex = std::stoul(color_str.substr(1, 7), nullptr, 16);
            BYTE r = (color_hex & 0xFF0000) >> 16;
            BYTE g = (color_hex & 0x00FF00) >> 8;
            BYTE b = (color_hex & 0x0000FF);
            color_obj = Gdiplus::Color(r, g, b);
        }
    };

    设置颜色(light_basic, this->任务栏窗口->呈现窗口->字体颜色_浅色_主歌词);
    设置颜色(light_extra, this->任务栏窗口->呈现窗口->字体颜色_浅色_副歌词);
    设置颜色(dark_basic, this->任务栏窗口->呈现窗口->字体颜色_深色_主歌词);
    设置颜色(dark_extra, this->任务栏窗口->呈现窗口->字体颜色_深色_副歌词);

    this->任务栏窗口->呈现窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::位置(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);
    auto position = json["position"].get<WindowAlignment>();
    auto lock = json["lock"].get<bool>();

    this->任务栏窗口->呈现窗口->窗口位置 = position;
    this->任务栏窗口->呈现窗口->锁定对齐 = lock;

    this->任务栏窗口->呈现窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::边距(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);
    auto left = json["left"].get<int>();
    auto right = json["right"].get<int>();

    this->任务栏窗口->呈现窗口->左边距 = left;
    this->任务栏窗口->呈现窗口->右边距 = right;

    this->任务栏窗口->呈现窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::对齐(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);
    auto basic = json["basic"].get<Gdiplus::StringAlignment>();
    auto extra = json["extra"].get<Gdiplus::StringAlignment>();

    this->任务栏窗口->呈现窗口->对齐方式_主歌词 = basic;
    this->任务栏窗口->呈现窗口->对齐方式_副歌词 = extra;

    this->任务栏窗口->呈现窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::屏幕(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);
    auto parent_taskbar = json["parent_taskbar"].get<std::string>();

    this->任务栏窗口->呈现窗口->任务栏_句柄 = FindWindow(this->字符转换.from_bytes(parent_taskbar).c_str(), NULL);
    this->任务栏窗口->呈现窗口->开始按钮_句柄 = FindWindowEx(this->任务栏窗口->呈现窗口->任务栏_句柄, NULL, L"Start", NULL);

    GetWindowRect(this->任务栏窗口->呈现窗口->任务栏_句柄, &this->任务栏窗口->呈现窗口->任务栏_矩形);
    GetWindowRect(this->任务栏窗口->呈现窗口->开始按钮_句柄, &this->任务栏窗口->呈现窗口->开始按钮_矩形);

    SetParent(this->任务栏窗口->窗口句柄, this->任务栏窗口->呈现窗口->任务栏_句柄);

    this->任务栏窗口->呈现窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::开始(
    const httplib::Request& req,
    httplib::Response& res
) {
    this->任务栏窗口->呈现窗口->主歌词 = L"成功连接到插件端";
    this->任务栏窗口->呈现窗口->副歌词 = L"等待下一句歌词...";

    this->任务栏窗口->呈现窗口->更新窗口();
    res.status = 200;
}


void 网络服务器类::停止(
    const httplib::Request& req,
    httplib::Response& res
) {
    this->任务栏窗口->呈现窗口->主歌词 = L"检测到网易云音乐重载页面";
    this->任务栏窗口->呈现窗口->副歌词 = L"正在尝试关闭任务栏歌词...";

    this->网络服务器.stop();
    this->任务栏窗口->呈现窗口->更新窗口();
    SendMessage(任务栏窗口->窗口句柄, WM_CLOSE, NULL, NULL);
    res.status = 200;
}