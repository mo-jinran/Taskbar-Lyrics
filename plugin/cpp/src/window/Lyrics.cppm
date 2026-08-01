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
    }

    auto onDraw(
        const std::wstring &primary,
        const std::wstring &secondary,
        const float opacity = 1.f,
        const float offsetX = 0.f,
        const float offsetY = 0.f
    ) -> void {
        if (this->render == nullptr || this->dwrite == nullptr || opacity <= 0.f) {
            return;
        }

        this->format1.Reset();
        this->format2.Reset();
        this->layout1.Reset();
        this->layout2.Reset();

        const auto [width, height] = this->render->GetSize();
        const auto primaryText = primary.empty() ? std::wstring(L" ") : primary;
        const auto secondaryText = secondary.empty() ? std::wstring(L" ") : secondary;

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

        this->dwrite->CreateTextLayout(primaryText.data(), primaryText.size(), this->format1.Get(), width, height, &this->layout1);
        this->dwrite->CreateTextLayout(secondaryText.data(), secondaryText.size(), this->format2.Get(), width, height, &this->layout2);
        this->layout1->SetWordWrapping(DWRITE_WORD_WRAPPING_NO_WRAP);
        this->layout2->SetWordWrapping(DWRITE_WORD_WRAPPING_NO_WRAP);
        this->layout1->SetTextAlignment(config.align_primary);
        this->layout2->SetTextAlignment(config.align_secondary);
        this->layout1->SetUnderline(config.underline_primary, DWRITE_TEXT_RANGE(0, primaryText.size()));
        this->layout2->SetUnderline(config.underline_secondary, DWRITE_TEXT_RANGE(0, secondaryText.size()));
        this->layout1->SetStrikethrough(config.strikethrough_primary, DWRITE_TEXT_RANGE(0, primaryText.size()));
        this->layout2->SetStrikethrough(config.strikethrough_secondary, DWRITE_TEXT_RANGE(0, secondaryText.size()));
        this->layout1->GetMetrics(&metrics1);
        this->layout2->GetMetrics(&metrics2);

        auto margin = (height - this->metrics1.height - this->metrics2.height) / 2;
        if (margin < 0.f) {
            margin = 0.f;
        }
        const auto rect1 = D2D1::RectF(
            margin + offsetX,
            margin + offsetY,
            width - margin + offsetX,
            margin + this->metrics1.height + offsetY
        );
        const auto rect2 = D2D1::RectF(rect1.left, rect1.bottom, rect1.right, rect1.bottom + this->metrics2.height);

        this->drawText(rect1, this->layout1.Get(), config.color_primary, opacity);
        this->drawText(rect2, this->layout2.Get(), config.color_secondary, opacity);
    }

    auto drawText(
        const D2D1_RECT_F &rect,
        IDWriteTextLayout *layout,
        const unsigned int color,
        const float opacity
    ) -> void {
        Microsoft::WRL::ComPtr<ID2D1SolidColorBrush> brush{};
        const auto alpha = (color >> 24 & 0xFF) / 255.f * opacity;
        this->render->CreateSolidColorBrush(D2D1::ColorF(color, alpha), &brush);
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
