import plugin.Plugin;
import plugin.Receiver;

enum NativeAPIType {
    Int,
    Boolean,
    Double,
    String,
    V8Value
};

enum NCMProcessType {
    Undetected = 0x0,
    Main = 0x0001,
    Renderer = 0x10,
    GPU = 0x100,
    Utility = 0x1000,
};

struct PluginAPI {
    int (*addNativeAPI)(NativeAPIType args[], int argsNum, const char *identifier, const char *function(void **));
    const char *betterncmVersion;
    NCMProcessType processType;
    const unsigned short (*ncmVersion)[3];
};

extern "C" __declspec(dllexport) auto BetterNCMPluginMain(const PluginAPI *api) -> int {
    if (api->processType == NCMProcessType::Renderer) {
        if (Plugin::getInstance().mutex) {
            api->addNativeAPI(new NativeAPIType[]{String, String}, 2, "taskbar_lyrics.config", Receiver::config);
            api->addNativeAPI(nullptr, 0, "taskbar_lyrics.update", Receiver::update);
        }
    }
    return 0;
}