#include "NetworkServer.hpp"
#include "CreateWindow.hpp"
#include "nlohmann/json.hpp"
#include <d2d1_3.h>


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
        this->网络服务器.Post("/taskbar/color", handler(&网络服务器类::颜色));
        this->网络服务器.Post("/taskbar/style", handler(&网络服务器类::样式));
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

    this->任务栏窗口->呈现窗口->主歌词 = this->字符转换.from_bytes(
        json["basic"].get<std::string>()
    );
    this->任务栏窗口->呈现窗口->副歌词 = this->字符转换.from_bytes(
        json["extra"].get<std::string>()
    );

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    res.status = 200;
}


void 网络服务器类::字体(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);

    this->任务栏窗口->呈现窗口->字体名称 = this->字符转换.from_bytes(
        json["font_family"].get<std::string>()
    );

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    res.status = 200;
}


void 网络服务器类::颜色(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);

    this->任务栏窗口->呈现窗口->字体颜色_浅色_主歌词 = D2D1::ColorF(
        json["basic"]["light"]["hex_color"].get<unsigned int>(),
        json["basic"]["light"]["opacity"].get<float>()
    );
    this->任务栏窗口->呈现窗口->字体颜色_深色_主歌词 = D2D1::ColorF(
        json["basic"]["dark"]["hex_color"].get<unsigned int>(),
        json["basic"]["dark"]["opacity"].get<float>()
    );
    this->任务栏窗口->呈现窗口->字体颜色_浅色_副歌词 = D2D1::ColorF(
        json["extra"]["light"]["hex_color"].get<unsigned int>(),
        json["extra"]["light"]["opacity"].get<float>()
    );
    this->任务栏窗口->呈现窗口->字体颜色_深色_副歌词 = D2D1::ColorF(
        json["extra"]["dark"]["hex_color"].get<unsigned int>(),
        json["extra"]["dark"]["opacity"].get<float>()
    );

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    res.status = 200;
}


void 网络服务器类::样式(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);

    this->任务栏窗口->呈现窗口->字体样式_主歌词_字重 = json["basic"]["weight"].get<DWRITE_FONT_WEIGHT>();
    this->任务栏窗口->呈现窗口->字体样式_主歌词_斜体 = json["basic"]["slope"].get<DWRITE_FONT_STYLE>();
    this->任务栏窗口->呈现窗口->字体样式_主歌词_下划线 = json["basic"]["underline"].get<bool>();
    this->任务栏窗口->呈现窗口->字体样式_主歌词_删除线 = json["basic"]["strikethrough"].get<bool>();
    this->任务栏窗口->呈现窗口->字体样式_副歌词_字重 = json["extra"]["weight"].get<DWRITE_FONT_WEIGHT>();
    this->任务栏窗口->呈现窗口->字体样式_副歌词_斜体 = json["extra"]["slope"].get<DWRITE_FONT_STYLE>();
    this->任务栏窗口->呈现窗口->字体样式_副歌词_下划线 = json["extra"]["underline"].get<bool>();
    this->任务栏窗口->呈现窗口->字体样式_副歌词_删除线 = json["extra"]["strikethrough"].get<bool>();
    
    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    res.status = 200;
}


void 网络服务器类::位置(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);

    this->任务栏窗口->呈现窗口->窗口位置 = json["position"].get<WindowAlignment>();

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    res.status = 200;
}


void 网络服务器类::边距(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);

    this->任务栏窗口->呈现窗口->左边距 = json["left"].get<int>();
    this->任务栏窗口->呈现窗口->右边距 = json["right"].get<int>();

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    res.status = 200;
}


void 网络服务器类::对齐(
    const httplib::Request& req,
    httplib::Response& res
) {
    auto json = nlohmann::json::parse(req.body);

    this->任务栏窗口->呈现窗口->对齐方式_主歌词 = json["basic"].get<DWRITE_TEXT_ALIGNMENT>();
    this->任务栏窗口->呈现窗口->对齐方式_副歌词 = json["extra"].get<DWRITE_TEXT_ALIGNMENT>();

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
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

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    res.status = 200;
}


void 网络服务器类::开始(
    const httplib::Request& req,
    httplib::Response& res
) {
    this->任务栏窗口->呈现窗口->主歌词 = L"成功连接到插件端";
    this->任务栏窗口->呈现窗口->副歌词 = L"等待下一句歌词...";

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    res.status = 200;
}


void 网络服务器类::停止(
    const httplib::Request& req,
    httplib::Response& res
) {
    this->任务栏窗口->呈现窗口->主歌词 = L"检测到网易云音乐重载页面";
    this->任务栏窗口->呈现窗口->副歌词 = L"正在尝试关闭任务栏歌词...";

    PostMessage(this->任务栏窗口->窗口句柄, WM_PAINT, NULL, NULL);
    PostMessage(任务栏窗口->窗口句柄, WM_CLOSE, NULL, NULL);
    res.status = 200;
}