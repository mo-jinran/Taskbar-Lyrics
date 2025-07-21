export module window.Renderer;

import <d3d11.h>;
import <d2d1.h>;
import <dwrite.h>;
import <dcomp.h>;
import <dxgi.h>;
import <wrl/client.h>;
import window.Lyrics;

export class Renderer {
private:
    Microsoft::WRL::ComPtr<ID3D11Device> d3dDevice{};
    Microsoft::WRL::ComPtr<ID2D1Factory> d2dFactory{};
    Microsoft::WRL::ComPtr<ID2D1RenderTarget> d2dRenderTarget{};
    Microsoft::WRL::ComPtr<IDWriteFactory> dwriteFactory{};
    Microsoft::WRL::ComPtr<IDXGIFactory2> dxgiFactory{};
    Microsoft::WRL::ComPtr<IDXGIDevice> dxgiDevice{};
    Microsoft::WRL::ComPtr<IDXGISwapChain1> dxgiSwapChain{};
    Microsoft::WRL::ComPtr<IDXGISurface1> dxgiSurface{};
    Microsoft::WRL::ComPtr<IDCompositionDevice> dcompDevice{};
    Microsoft::WRL::ComPtr<IDCompositionTarget> dcompTarget{};
    Microsoft::WRL::ComPtr<IDCompositionVisual> dcompVisual{};

    auto initializeDirectX() -> void {
        D3D11CreateDevice(
            nullptr,
            D3D_DRIVER_TYPE_HARDWARE,
            nullptr,
            D3D11_CREATE_DEVICE_BGRA_SUPPORT,
            nullptr,
            0,
            D3D11_SDK_VERSION,
            &this->d3dDevice,
            nullptr,
            nullptr
        );
        D2D1CreateFactory(D2D1_FACTORY_TYPE_SINGLE_THREADED, IID_PPV_ARGS(&this->d2dFactory));
        DWriteCreateFactory(DWRITE_FACTORY_TYPE_SHARED, __uuidof(this->dwriteFactory), &this->dwriteFactory);
    }

    auto initializeSwapChain() -> void {
        constexpr auto desc = DXGI_SWAP_CHAIN_DESC1{
            .Width = 1,
            .Height = 1,
            .Format = DXGI_FORMAT_B8G8R8A8_UNORM,
            .SampleDesc{.Count = 1},
            .BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT,
            .BufferCount = 2,
            .SwapEffect = DXGI_SWAP_EFFECT_FLIP_SEQUENTIAL,
            .AlphaMode = DXGI_ALPHA_MODE_PREMULTIPLIED,
        };
        CreateDXGIFactory(IID_PPV_ARGS(&this->dxgiFactory));
        this->d3dDevice.As(&this->dxgiDevice);
        this->dxgiFactory->CreateSwapChainForComposition(this->dxgiDevice.Get(), &desc, nullptr, &this->dxgiSwapChain);
    }

    auto initializeComposition(const HWND hwnd) -> void {
        DCompositionCreateDevice(this->dxgiDevice.Get(), IID_PPV_ARGS(&this->dcompDevice));
        this->dcompDevice->CreateTargetForHwnd(hwnd, false, &this->dcompTarget);
        this->dcompDevice->CreateVisual(&this->dcompVisual);
        this->dcompVisual->SetContent(this->dxgiSwapChain.Get());
        this->dcompTarget->SetRoot(this->dcompVisual.Get());
    }

public:
    auto onCreate(const HWND hwnd) -> void {
        this->initializeDirectX();
        this->initializeSwapChain();
        this->initializeComposition(hwnd);
    }

    auto onSize(const UINT width, const UINT height, const UINT dpi) -> void {
        this->dxgiSurface.Reset();
        this->d2dRenderTarget.Reset();
        this->dxgiSwapChain->ResizeBuffers(0, width, height, DXGI_FORMAT_UNKNOWN, 0);
        this->dxgiSwapChain->GetBuffer(0, IID_PPV_ARGS(&this->dxgiSurface));
        this->d2dFactory->CreateDxgiSurfaceRenderTarget(
            this->dxgiSurface.Get(),
            D2D1::RenderTargetProperties(
                D2D1_RENDER_TARGET_TYPE_DEFAULT,
                D2D1::PixelFormat(DXGI_FORMAT_B8G8R8A8_UNORM, D2D1_ALPHA_MODE_PREMULTIPLIED),
                dpi,
                dpi
            ),
            &this->d2dRenderTarget
        );
    }

    auto onPaint() -> void {
        Lyrics lyrics{
            this->d2dRenderTarget.Get(),
            this->dwriteFactory.Get()
        };
        this->d2dRenderTarget->BeginDraw();
        this->d2dRenderTarget->Clear();
        lyrics.onDraw();
        this->d2dRenderTarget->EndDraw();
        this->dxgiSwapChain->Present(1, 0);
        this->dcompDevice->Commit();
    }
};
