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
    HWND taskbarWindow = nullptr;
    Callback callback{};
    bool structureListenerRegistered = false;
    bool registryWatcherStarted = false;

    auto createConditionByProperty(PROPERTYID propertyId, const wchar_t *value) const -> Microsoft::WRL::ComPtr<IUIAutomationCondition> {
        if (!this->automation || value == nullptr) {
            return nullptr;
        }
        VARIANT var{};
        VariantInit(&var);
        var.vt = VT_BSTR;
        var.bstrVal = SysAllocString(value);
        Microsoft::WRL::ComPtr<IUIAutomationCondition> condition{};
        if (var.bstrVal != nullptr) {
            this->automation->CreatePropertyCondition(propertyId, var, &condition);
        }
        VariantClear(&var);
        return condition;
    }

    auto resetAutomation() -> void {
        if (this->structureListenerRegistered && this->automation && this->handler) {
            this->automation->RemoveStructureChangedEventHandler(
                this->root.Get(),
                this->handler.Get()
            );
        }
        this->structureListenerRegistered = false;
        this->handler.Reset();
        this->root.Reset();
        this->automation.Reset();
    }

public:
    Taskbar() {
        CoInitializeEx(nullptr, COINIT_MULTITHREADED | COINIT_DISABLE_OLE1DDE);
    }

    ~Taskbar() {
        this->resetAutomation();
        CoUninitialize();
    }

    auto initialize() -> bool {
        const auto currentTaskbar = Taskbar::getHWND();
        if (currentTaskbar == nullptr) {
            return false;
        }
        if (currentTaskbar == this->taskbarWindow && this->automation && this->root) {
            return true;
        }

        this->resetAutomation();
        this->taskbarWindow = currentTaskbar;

        if (FAILED(CoCreateInstance(CLSID_CUIAutomation, nullptr, CLSCTX_INPROC_SERVER, IID_IUIAutomation, &this->automation)) || !this->automation) {
            return false;
        }
        Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
        if (FAILED(this->automation->ElementFromHandle(currentTaskbar, &element)) || !element) {
            return false;
        }
        const auto condition = this->createConditionByProperty(UIA_ClassNamePropertyId, L"Windows.UI.Input.InputSite.WindowClass");
        if (!condition || FAILED(element->FindFirst(TreeScope_Children, condition.Get(), &this->root)) || !this->root) {
            return false;
        }
        return true;
    }

    auto ensureInitialized() -> bool {
        if (!this->initialize()) {
            return false;
        }
        if (!this->structureListenerRegistered && this->callback && this->automation && this->root) {
            this->handler = new Handler(this->callback);
            if (SUCCEEDED(this->automation->AddStructureChangedEventHandler(this->root.Get(), TreeScope_Descendants, nullptr, this->handler.Get()))) {
                this->structureListenerRegistered = true;
            } else {
                this->handler.Reset();
            }
        }
        return true;
    }

    auto setListener(const Taskbar::Callback &callback) {
        this->callback = callback;
        this->ensureInitialized();
        if (!this->registryWatcherStarted) {
            this->registryWatcherStarted = true;
            std::thread([callback] {
                Registry::onWatch(callback);
            }).detach();
        }
    }

    auto getRectForTaskbarFrame() const -> RECT {
        RECT rect{};
        if (!this->root) {
            return rect;
        }
        const auto condition = this->createConditionByProperty(UIA_ClassNamePropertyId, L"Taskbar.TaskbarFrameAutomationPeer");
        Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
        if (!condition || FAILED(this->root->FindFirst(TreeScope_Children, condition.Get(), &element)) || !element) {
            return rect;
        }
        element->get_CurrentBoundingRectangle(&rect);
        return rect;
    }

    auto getRectForTaskList() const -> RECT {
        RECT rect{};
        if (!this->automation || !this->root) {
            return rect;
        }
        const auto conditionID = this->createConditionByProperty(UIA_AutomationIdPropertyId, L"StartButton");
        const auto conditionCN = this->createConditionByProperty(UIA_ClassNamePropertyId, L"Taskbar.TaskListButtonAutomationPeer");
        Microsoft::WRL::ComPtr<IUIAutomationCondition> condition{};
        if (!conditionID || !conditionCN || FAILED(this->automation->CreateOrCondition(conditionID.Get(), conditionCN.Get(), &condition))) {
            return rect;
        }
        Microsoft::WRL::ComPtr<IUIAutomationElementArray> elements{};
        if (FAILED(this->root->FindAll(TreeScope_Descendants, condition.Get(), &elements)) || !elements) {
            return rect;
        }
        int length = 0;
        if (FAILED(elements->get_Length(&length))) {
            return rect;
        }
        for (int i = 0; i < length; i++) {
            RECT tempRect{};
            Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
            if (SUCCEEDED(elements->GetElement(i, &element)) && element && SUCCEEDED(element->get_CurrentBoundingRectangle(&tempRect))) {
                if (rect.right <= rect.left || rect.bottom <= rect.top) {
                    rect = tempRect;
                } else {
                    rect = {
                        .left = min(rect.left, tempRect.left),
                        .top = min(rect.top, tempRect.top),
                        .right = max(rect.right, tempRect.right),
                        .bottom = max(rect.bottom, tempRect.bottom)
                    };
                }
            }
        }
        return rect;
    }

    auto getRectForTrayFrame() const -> RECT {
        RECT rect{};
        if (!this->automation || !this->root) {
            return rect;
        }
        const auto condition = this->createConditionByProperty(UIA_AutomationIdPropertyId, L"SystemTrayIcon");
        Microsoft::WRL::ComPtr<IUIAutomationElementArray> elements{};
        if (!condition || FAILED(this->root->FindAll(TreeScope_Children, condition.Get(), &elements)) || !elements) {
            return rect;
        }
        int length = 0;
        if (FAILED(elements->get_Length(&length))) {
            return rect;
        }
        for (int i = 0; i < length; i++) {
            RECT tempRect{};
            Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
            if (SUCCEEDED(elements->GetElement(i, &element)) && element && SUCCEEDED(element->get_CurrentBoundingRectangle(&tempRect))) {
                if (rect.right <= rect.left || rect.bottom <= rect.top) {
                    rect = tempRect;
                } else {
                    rect = {
                        .left = min(rect.left, tempRect.left),
                        .top = min(rect.top, tempRect.top),
                        .right = max(rect.right, tempRect.right),
                        .bottom = max(rect.bottom, tempRect.bottom)
                    };
                }
            }
        }
        return rect;
    }

    auto getRectForWidgetsButton() const -> RECT {
        RECT rect{};
        if (Registry::isWidgetsEnabled() && this->automation && this->root) {
            const auto condition = this->createConditionByProperty(UIA_AutomationIdPropertyId, L"WidgetsButton");
            Microsoft::WRL::ComPtr<IUIAutomationElement> element{};
            if (condition && SUCCEEDED(this->root->FindFirst(TreeScope_Descendants, condition.Get(), &element)) && element) {
                element->get_CurrentBoundingRectangle(&rect);
            }
        }
        return rect;
    }

    static auto getHWND() -> HWND {
        return FindWindow(L"Shell_TrayWnd", nullptr);
    }
};
