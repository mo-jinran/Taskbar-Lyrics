export module window.Renderer;

import <d3d11.h>;
import <d2d1.h>;
import <dwrite.h>;
import <dcomp.h>;
import <dxgi.h>;
import <wrl/client.h>;
import <chrono>;
import <string>;
import plugin.Config;
import window.Lyrics;

export class Renderer {
private:
    struct LyricGroup {
        std::wstring primary{L" "};
        std::wstring secondary{L" "};

        auto operator==(const LyricGroup &) const -> bool = default;
    };

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
    LyricGroup previousLyrics{};
    LyricGroup currentLyrics{};
    std::chrono::steady_clock::time_point transitionStart{};
    bool lyricsInitialized = false;
    bool animating = false;
    float direction = 1.f;

    static constexpr auto transitionDuration = std::chrono::milliseconds(260);
    static constexpr auto transitionDistance = 10.f;

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
        if (width == 0 || height == 0) {
            return;
        }
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

    auto startTransition() -> bool {
        const auto nextLyrics = LyricGroup{
            .primary = config.lyric_primary,
            .secondary = config.lyric_secondary
        };

        if (!this->lyricsInitialized) {
            this->currentLyrics = nextLyrics;
            this->lyricsInitialized = true;
            return false;
        }
        if (nextLyrics == this->currentLyrics) {
            return false;
        }

        this->previousLyrics = this->currentLyrics;
        this->currentLyrics = nextLyrics;
        this->direction = -this->direction;
        this->transitionStart = std::chrono::steady_clock::now();
        this->animating = true;
        return true;
    }

    auto isAnimating() const -> bool {
        return this->animating;
    }

    auto onPaint() -> void {
        if (this->d2dRenderTarget == nullptr) {
            return;
        }
        if (!this->lyricsInitialized) {
            this->currentLyrics = {
                .primary = config.lyric_primary,
                .secondary = config.lyric_secondary
            };
            this->lyricsInitialized = true;
        }

        Lyrics lyrics{
            this->d2dRenderTarget.Get(),
            this->dwriteFactory.Get()
        };
        this->d2dRenderTarget->BeginDraw();
        this->d2dRenderTarget->Clear();

        if (this->animating) {
            const auto elapsed = std::chrono::steady_clock::now() - this->transitionStart;
            auto progress = std::chrono::duration<float>(elapsed).count() /
                std::chrono::duration<float>(transitionDuration).count();
            if (progress >= 1.f) {
                progress = 1.f;
                this->animating = false;
            }

            const auto remaining = 1.f - progress;
            const auto eased = 1.f - remaining * remaining * remaining;
            lyrics.onDraw(
                this->previousLyrics.primary,
                this->previousLyrics.secondary,
                1.f - eased,
                -this->direction * transitionDistance * eased,
                -2.f * eased
            );
            lyrics.onDraw(
                this->currentLyrics.primary,
                this->currentLyrics.secondary,
                eased,
                this->direction * transitionDistance * (1.f - eased),
                2.f * (1.f - eased)
            );
        } else {
            lyrics.onDraw(this->currentLyrics.primary, this->currentLyrics.secondary);
        }

        this->d2dRenderTarget->EndDraw();
        this->dxgiSwapChain->Present(1, 0);
        this->dcompDevice->Commit();
    }
};
