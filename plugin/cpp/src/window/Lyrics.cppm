export module window.Lyrics;

import <d2d1.h>;
import <dwrite.h>;
import <wrl/client.h>;
import <string>;
import plugin.Config;

export class Lyrics {
private:
    ID2D1RenderTarget *render = nullptr;
    IDWriteFactory *dwrite = nullptr;
    Microsoft::WRL::ComPtr<IDWriteTextFormat> format1{};
    Microsoft::WRL::ComPtr<IDWriteTextFormat> format2{};
    Microsoft::WRL::ComPtr<IDWriteTextLayout> layout1{};
    Microsoft::WRL::ComPtr<IDWriteTextLayout> layout2{};
    DWRITE_TEXT_METRICS metrics1{};
    DWRITE_TEXT_METRICS metrics2{};
public:
    Lyrics(ID2D1RenderTarget *render, IDWriteFactory *dwrite) {
        this->render = render;
        this->dwrite = dwrite;
        this->onDraw();
    }

    auto onDraw() -> void {
        const auto [width, height] = this->render->GetSize();

        this->dwrite->CreateTextFormat(
            config.font_family.data(),
            nullptr,
            config.weight_primary,
            config.slope_primary,
            DWRITE_FONT_STRETCH_NORMAL,
            config.size_primary,
            L"zh-CN",
            &format1
        );
        this->dwrite->CreateTextFormat(
            config.font_family.data(),
            nullptr,
            config.weight_secondary,
            config.slope_secondary,
            DWRITE_FONT_STRETCH_NORMAL,
            config.size_secondary,
            L"zh-CN",
            &format2
        );

        this->dwrite->CreateTextLayout(config.lyric_primary.data(), config.lyric_primary.size(), this->format1.Get(), width, height, &this->layout1);
        this->dwrite->CreateTextLayout(config.lyric_secondary.data(), config.lyric_secondary.size(), this->format2.Get(), width, height, &this->layout2);
        this->layout1->GetMetrics(&metrics1);
        this->layout2->GetMetrics(&metrics2);

        const auto margin = (height - this->metrics1.height - this->metrics2.height) / 2;
        const auto rect1 = D2D1::RectF(margin, margin, width - margin, margin + this->metrics1.height);
        const auto rect2 = D2D1::RectF(rect1.left, rect1.bottom, rect1.right, rect1.bottom + this->metrics2.height);

        this->createText(rect1, this->format1.Get(), this->layout1.Get(), config.lyric_primary, config.align_primary, config.underline_primary, config.strikethrough_primary);
        this->createText(rect2, this->format2.Get(), this->layout2.Get(), config.lyric_secondary, config.align_secondary, config.underline_secondary, config.strikethrough_secondary);
        this->drawText(rect1, this->layout1.Get(), config.color_primary);
        this->drawText(rect2, this->layout2.Get(), config.color_secondary);
    }

    auto createText(
        const D2D1_RECT_F &rect,
        IDWriteTextFormat *format,
        IDWriteTextLayout *layout,
        const std::wstring &string,
        const DWRITE_TEXT_ALIGNMENT alignment,
        const bool underline,
        const bool strikethrough
    ) -> void {
        this->dwrite->CreateTextLayout(string.data(), string.size(), format, rect.right - rect.left, rect.bottom - rect.top, &layout);
        layout->SetWordWrapping(DWRITE_WORD_WRAPPING_NO_WRAP);
        layout->SetTextAlignment(alignment);
        layout->SetUnderline(underline, DWRITE_TEXT_RANGE(0, string.size()));
        layout->SetStrikethrough(strikethrough, DWRITE_TEXT_RANGE(0, string.size()));
    }

    auto drawText(const D2D1_RECT_F &rect, IDWriteTextLayout *layout, const unsigned int color) -> void {
        Microsoft::WRL::ComPtr<ID2D1SolidColorBrush> brush{};
        this->render->CreateSolidColorBrush(D2D1::ColorF(color, (color >> 24 & 0xFF) / 255.f), &brush);
        this->render->PushAxisAlignedClip(rect, D2D1_ANTIALIAS_MODE_ALIASED);
        this->render->DrawTextLayout(
            D2D1::Point2F(rect.left, rect.top),
            layout,
            brush.Get(),
            D2D1_DRAW_TEXT_OPTIONS_NO_SNAP | D2D1_DRAW_TEXT_OPTIONS_DISABLE_COLOR_BITMAP_SNAPPING | D2D1_DRAW_TEXT_OPTIONS_ENABLE_COLOR_FONT
        );
        this->render->PopAxisAlignedClip();
    }
};
