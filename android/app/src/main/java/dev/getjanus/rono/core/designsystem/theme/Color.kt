package dev.getjanus.rono.core.designsystem.theme

import androidx.compose.ui.graphics.Color

/**
 * Rono color tokens, ported 1:1 from `frontend/app/globals.css` and
 * `ios/Rono/DesignSystem/Theme.swift` (X "Light" + "Dim", WCAG-AA verified).
 *
 * Suffix `L` = light theme value, `D` = dark theme value. The brand stays fixed
 * across web / iOS / Android (no Material You dynamic color) so the three
 * clients are visually one product.
 *
 * WCAG notes (computed): body text `onSurface` pairs exceed 15:1 in both modes;
 * `mutedForeground` is 5.8:1 (light) / 5.1:1 (dark). The brand `primary` keeps
 * white labels — light violet #7C3AED → 5.7:1 (passes AA), dark #9B6BFF →
 * ~3.5:1 (passes AA for the bold/large button text it is used on). Primary
 * buttons therefore always use a bold, ≥16sp label.
 */
internal object Tokens {
    // Core surfaces
    val BackgroundL = Color(0xFFF7F9F9)
    val BackgroundD = Color(0xFF15202B)
    val ForegroundL = Color(0xFF0F1419)
    val ForegroundD = Color(0xFFF7F9F9)
    val CardL = Color(0xFFFFFFFF)
    val CardD = Color(0xFF1E2732)

    // Brand / actions
    val PrimaryL = Color(0xFF7C3AED)
    val PrimaryD = Color(0xFF9B6BFF)
    val OnPrimary = Color(0xFFFFFFFF)
    val SecondarySurfaceL = Color(0xFFEFF3F4)
    val SecondarySurfaceD = Color(0xFF273340)
    val MutedSurfaceL = Color(0xFFEFF3F4)
    val MutedSurfaceD = Color(0xFF1E2732)
    val MutedForegroundL = Color(0xFF536471)
    val MutedForegroundD = Color(0xFF8B98A5)

    // Lines
    val BorderL = Color(0xFFCFD9DE)
    val BorderD = Color(0xFF38444D)
    val OutlineVariantL = Color(0xFFE1E8EA)
    val OutlineVariantD = Color(0xFF2A3540)

    // Tertiary (teal — also mastery "proficient")
    val TertiaryL = Color(0xFF0E8F8F)
    val TertiaryD = Color(0xFF2FC4C4)

    // Containers (derived, AA-checked against their on* roles)
    val PrimaryContainerL = Color(0xFFCFE5F6)
    val PrimaryContainerD = Color(0xFF0B3A5C)
    val OnPrimaryContainerL = Color(0xFF06304E)
    val OnPrimaryContainerD = Color(0xFFCFE5F6)

    // Destructive / error
    val DangerL = Color(0xFFC0142B)
    val DangerD = Color(0xFFFF6172)
    val ErrorContainerL = Color(0xFFF9DEDC)
    val ErrorContainerD = Color(0xFF5C1A22)

    // Surface container ramp (M3 tonal surfaces)
    val SurfaceContainerLowestL = Color(0xFFFFFFFF)
    val SurfaceContainerLowL = Color(0xFFFBFCFC)
    val SurfaceContainerL = Color(0xFFF2F5F6)
    val SurfaceContainerHighL = Color(0xFFECF0F1)
    val SurfaceContainerHighestL = Color(0xFFE6EBEC)
    val SurfaceContainerLowestD = Color(0xFF10181F)
    val SurfaceContainerLowD = Color(0xFF18222C)
    val SurfaceContainerD = Color(0xFF1E2732)
    val SurfaceContainerHighD = Color(0xFF243039)
    val SurfaceContainerHighestD = Color(0xFF2B3742)

    // Charts (shared with iOS chart1..5)
    val Chart1 = Color(0xFF1D9BF0)
    val Chart2 = Color(0xFF00BA7C)
    val Chart3 = Color(0xFF7856FF)
    val Chart4 = Color(0xFFFF7A00)
    val Chart5 = Color(0xFFF91880)

    // Study state (WCAG-AA both modes)
    val StudySuccessL = Color(0xFF00734C)
    val StudySuccessD = Color(0xFF00BA7C)
    val StudyDangerL = Color(0xFFC0142B)
    val StudyDangerD = Color(0xFFFF6172)
    val StudyWarningL = Color(0xFF9C5B05)
    val StudyWarningD = Color(0xFFFFB23E)

    // Mastery ring strokes (graphic, not text)
    val MasteryReviewL = Color(0xFF9C5B05)
    val MasteryReviewD = Color(0xFFFFB23E)
    val MasteryProfL = Color(0xFF0E8F8F)
    val MasteryProfD = Color(0xFF2FC4C4)
    val MasteryMasterL = Color(0xFF00734C)
    val MasteryMasterD = Color(0xFF00BA7C)

    // Exam booklet palette — ink on paper, flips with theme
    val ExamPaperL = Color(0xFFF7F3EA)
    val ExamPaperD = Color(0xFF1A1D24)
    val ExamInkL = Color(0xFF23201A)
    val ExamInkD = Color(0xFFE8E4D9)
    val ExamInk2L = Color(0xFF3B362D)
    val ExamInk2D = Color(0xFFC9C4B8)
    val ExamMutedL = Color(0xFF6B6457)
    val ExamMutedD = Color(0xFF98948A)
    val ExamLineL = Color(0xFFD8CFB8)
    val ExamLineD = Color(0xFF313641)
    val ExamSoftL = Color(0xFFEFE9DA)
    val ExamSoftD = Color(0xFF232833)
    val ExamAccentL = Color(0xFF9B2D20)
    val ExamAccentD = Color(0xFFE0907F)
}
