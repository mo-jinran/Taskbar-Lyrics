export module taskbar.Taskbar;

import <Windows.h>;
import <UIAutomation.h>;
import <wrl/client.h>;
import <thread>;
import <functional>;
import taskbar.Handler;
import taskbar.Registry;

export class Taskbar {
public:
    typedef std::function<void()> Callback;

private:
    Microsoft::WRL::ComPtr<Handler> handler{};
    Microsoft::WRL::ComPtr<IUIAutomation> automation{};
    Microsoft::WRL::ComPtr<IUIAutomationElement> root{};

    auto createConditionByProperty(PROPERTYID propertyId, const wchar_t *value) const -> Microsoft::WRL::ComPtr<IUIAutomationCondition> {
        VARIANT var{};
        VariantInit(&var);
        var.vt = VT_BSTR;
        var.bstrVal = SysAllocString(value);
        Microsoft::WRL::ComPtr<IUIAutomationCondition> condition{};
        this->automation->CreatePropertyCondition(propertyId, var, &condition);
        SysFreeString(var.bstrVal);
        VariantClear(&var);
        return condition;
    }

public:
    Taskbar() {
        CoInitializeEx(nullptr, COINIT_MULTITHREADED | COINIT_DISABLE_OLE1DDE);
    }

    ~Taskbar() {
        CoUninitialize();
    }

    auto initialize() {
        CoCreateInstance(CLSID_CUIAutomation, nullptr, CLSCTX_INPROC_SERVER, IID_IUIAutomation, &this->automation);
        Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
        this->automation->ElementFromHandle(Taskbar::getHWND(), &element);
        const auto condition = this->createConditionByProperty(UIA_ClassNamePropertyId, L"Windows.UI.Input.InputSite.WindowClass");
        element->FindFirst(TreeScope_Children, condition.Get(), &this->root);
    }

    auto setListener(const Taskbar::Callback &callback) {
        this->handler = new Handler(callback);
        this->automation->AddStructureChangedEventHandler(this->root.Get(), TreeScope_Descendants, nullptr, this->handler.Get());
        std::thread([callback] {
            Registry::onWatch(callback);
        }).detach();
    }

    auto getRectForTaskbarFrame() const -> RECT {
        RECT rect{};
        this->root->get_CurrentBoundingRectangle(&rect);
        return rect;
    }

    auto getRectForTaskList() const -> RECT {
        RECT rect{
            .left = LONG_MAX,
            .top = LONG_MAX,
            .right = LONG_MIN,
            .bottom = LONG_MIN
        };
        const auto conditionID = this->createConditionByProperty(UIA_AutomationIdPropertyId, L"StartButton");
        const auto conditionCN = this->createConditionByProperty(UIA_ClassNamePropertyId, L"Taskbar.TaskListButtonAutomationPeer");
        Microsoft::WRL::ComPtr<IUIAutomationCondition> condition{};
        this->automation->CreateOrCondition(conditionID.Get(), conditionCN.Get(), &condition);
        Microsoft::WRL::ComPtr<IUIAutomationElementArray> elements{};
        this->root->FindAll(TreeScope_Descendants, condition.Get(), &elements);
        int length = 0;
        elements->get_Length(&length);
        for (int i = 0; i < length; i++) {
            RECT tempRect{};
            Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
            elements->GetElement(i, &element);
            element->get_CurrentBoundingRectangle(&tempRect);
            rect = {
                .left = min(rect.left, tempRect.left),
                .top = min(rect.top, tempRect.top),
                .right = max(rect.right, tempRect.right),
                .bottom = max(rect.bottom, tempRect.bottom)
            };
        }
        return rect;
    }

    auto getRectForTrayFrame() const -> RECT {
        RECT rect{
            .left = LONG_MAX,
            .top = LONG_MAX,
            .right = LONG_MIN,
            .bottom = LONG_MIN
        };
        const auto condition = this->createConditionByProperty(UIA_AutomationIdPropertyId, L"SystemTrayIcon");
        Microsoft::WRL::ComPtr<IUIAutomationElementArray> elements{};
        this->root->FindAll(TreeScope_Children, condition.Get(), &elements);
        int length = 0;
        elements->get_Length(&length);
        for (int i = 0; i < length; i++) {
            RECT tempRect{};
            Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
            elements->GetElement(i, &element);
            element->get_CurrentBoundingRectangle(&tempRect);
            rect = {
                .left = min(rect.left, tempRect.left),
                .top = min(rect.top, tempRect.top),
                .right = max(rect.right, tempRect.right),
                .bottom = max(rect.bottom, tempRect.bottom)
            };
        }
        return rect;
    }

    auto getRectForWidgetsButton() const -> RECT {
        RECT rect{};
        if (Registry::isWidgetsEnabled()) {
            const auto condition = this->createConditionByProperty(UIA_AutomationIdPropertyId, L"WidgetsButton");
            Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
            this->root->FindFirst(TreeScope_Descendants, condition.Get(), &element);
            element->get_CurrentBoundingRectangle(&rect);
        }
        return rect;
    }

    static auto getHWND() -> HWND {
        return FindWindow(L"Shell_TrayWnd", nullptr);
    }
};
