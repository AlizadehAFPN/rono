import SwiftUI

/// Rono color tokens, ported 1:1 from `frontend/app/globals.css`
/// (X "Light" + "Dim" themes, WCAG-AA verified). Every token is a dynamic
/// color that flips automatically with the active color scheme.
enum Palette {
    // ── Core surfaces ──────────────────────────────────────────────
    static let background        = Color(light: 0xF7F9F9, dark: 0x15202B)
    static let foreground        = Color(light: 0x0F1419, dark: 0xF7F9F9)
    static let card              = Color(light: 0xFFFFFF, dark: 0x1E2732)
    static let cardForeground    = Color(light: 0x0F1419, dark: 0xF7F9F9)
    static let popover           = Color(light: 0xFFFFFF, dark: 0x1E2732)
    static let popoverForeground = Color(light: 0x0F1419, dark: 0xF7F9F9)

    // ── Brand / actions ────────────────────────────────────────────
    static let primary            = Color(light: 0x1478BE, dark: 0x1D9BF0)
    static let primaryForeground  = Color(hex: 0xFFFFFF)
    static let secondary          = Color(light: 0xEFF3F4, dark: 0x273340)
    static let secondaryForeground = Color(light: 0x0F1419, dark: 0xF7F9F9)
    static let muted              = Color(light: 0xEFF3F4, dark: 0x1E2732)
    static let mutedForeground    = Color(light: 0x536471, dark: 0x8B98A5)
    static let accent             = Color(light: 0xEFF3F4, dark: 0x273340)
    static let accentForeground   = Color(light: 0x0F1419, dark: 0xF7F9F9)
    static let destructive        = Color(hex: 0xF4212E)

    // ── Lines ──────────────────────────────────────────────────────
    static let border = Color(light: 0xCFD9DE, dark: 0x38444D)
    static let input  = Color(light: 0xCFD9DE, dark: 0x38444D)
    static let ring   = Color(light: 0x1478BE, dark: 0x1D9BF0)

    // ── Charts ─────────────────────────────────────────────────────
    static let chart1 = Color(hex: 0x1D9BF0)
    static let chart2 = Color(hex: 0x00BA7C)
    static let chart3 = Color(hex: 0x7856FF)
    static let chart4 = Color(hex: 0xFF7A00)
    static let chart5 = Color(hex: 0xF91880)

    // ── Sidebar (used by More menu / nav surfaces) ─────────────────
    static let sidebar                  = Color(light: 0xFFFFFF, dark: 0x15202B)
    static let sidebarForeground        = Color(light: 0x0F1419, dark: 0xF7F9F9)
    static let sidebarPrimary           = Color(light: 0x1478BE, dark: 0x1D9BF0)
    static let sidebarPrimaryForeground = Color(hex: 0xFFFFFF)
    static let sidebarAccent            = Color(light: 0xEFF3F4, dark: 0x273340)

    // ── Study feature — state & mastery (WCAG-AA both modes) ───────
    static let studySuccess = Color(light: 0x00734C, dark: 0x00BA7C)
    static let studyDanger  = Color(light: 0xC0142B, dark: 0xFF6172)
    static let studyWarning = Color(light: 0x9C5B05, dark: 0xFFB23E)

    // mastery ring strokes (graphic, not text)
    static let masteryNone   = mutedForeground
    static let masteryReview = Color(light: 0x9C5B05, dark: 0xFFB23E)
    static let masteryDev    = primary
    static let masteryProf   = Color(light: 0x0E8F8F, dark: 0x2FC4C4)
    static let masteryMaster = Color(light: 0x00734C, dark: 0x00BA7C)

    // ── Exam booklet palette — ink on paper, flips with theme ──────
    static let examPaper  = Color(light: 0xF7F3EA, dark: 0x1A1D24)
    static let examInk    = Color(light: 0x23201A, dark: 0xE8E4D9)
    static let examInk2   = Color(light: 0x3B362D, dark: 0xC9C4B8)
    static let examMuted  = Color(light: 0x6B6457, dark: 0x98948A)
    static let examLine   = Color(light: 0xD8CFB8, dark: 0x313641)
    static let examSoft   = Color(light: 0xEFE9DA, dark: 0x232833)
    static let examAccent = Color(light: 0x9B2D20, dark: 0xE0907F)
    static let examMargin = Color(light: 0xC0473B, dark: 0xE0907F)
}

/// Spacing / radius scale. Tuned for a calm, premium rhythm on an 8-pt grid.
enum Metric {
    static let radiusSm: CGFloat = 8
    static let radiusMd: CGFloat = 12
    static let radius:   CGFloat = 14
    static let radiusLg: CGFloat = 16
    static let radiusXl: CGFloat = 20
    static let radius2xl: CGFloat = 26

    static let control: CGFloat = 14   // buttons / fields radius
    static let card:    CGFloat = 20   // card radius
    static let screen:  CGFloat = 20   // screen horizontal inset

    static let pad: CGFloat = 16
    static let padSm: CGFloat = 12
    static let padLg: CGFloat = 22
    static let gap: CGFloat = 12
    static let section: CGFloat = 22   // vertical gap between sections
    static let contentTop: CGFloat = 16 // gap from an inline nav title to the first content

    static let buttonHeight: CGFloat = 52
}

/// Soft, theme-aware elevation for cards and floating surfaces.
extension View {
    func cardShadow(_ scheme: ColorScheme) -> some View {
        shadow(color: .black.opacity(scheme == .dark ? 0.28 : 0.06),
               radius: 14, x: 0, y: 6)
    }
}
