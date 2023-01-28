#pragma once

#include "httplib.h"
#include <vector>
#include <thread>
#include <string>


class 网络服务器类
{
	private:
	httplib::Server 网络服务器;
	class 任务栏窗口类* 任务栏窗口;
	std::thread* 网络服务器_线程 = nullptr;

	public:
	网络服务器类(class 任务栏窗口类*, unsigned short);
	~网络服务器类();


	private:
	void 歌词(const httplib::Request&, httplib::Response&);
	void 字体(const httplib::Request&, httplib::Response&);
	void 颜色(const httplib::Request&, httplib::Response&);
	void 位置(const httplib::Request&, httplib::Response&);
	void 对齐(const httplib::Request&, httplib::Response&);
	void 屏幕(const httplib::Request&, httplib::Response&);
};


struct Route {
	std::string path;
	std::function<void(const httplib::Request&, httplib::Response&)> callback;
};
