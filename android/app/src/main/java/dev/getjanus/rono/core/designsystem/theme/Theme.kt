package dev.getjanus.rono.core.designsystem.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColors: ColorScheme = lightColorScheme(
    primary = Tokens.PrimaryL,
    onPrimary = Tokens.OnPrimary,
    primaryContainer = Tokens.PrimaryContainerL,
    onPrimaryContainer = Tokens.OnPrimaryContainerL,
    secondary = Tokens.MutedForegroundL,
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Tokens.SecondarySurfaceL,
    onSecondaryContainer = Tokens.ForegroundL,
    tertiary = Tokens.TertiaryL,
    onTertiary = Color(0xFFFFFFFF),
    background = Tokens.BackgroundL,
    onBackground = Tokens.ForegroundL,
    surface = Tokens.CardL,
    onSurface = Tokens.ForegroundL,
    surfaceVariant = Tokens.MutedSurfaceL,
    onSurfaceVariant = Tokens.MutedForegroundL,
    surfaceContainerLowest = Tokens.SurfaceContainerLowestL,
    surfaceContainerLow = Tokens.SurfaceContainerLowL,
    surfaceContainer = Tokens.SurfaceContainerL,
    surfaceContainerHigh = Tokens.SurfaceContainerHighL,
    surfaceContainerHighest = Tokens.SurfaceContainerHighestL,
    error = Tokens.DangerL,
    onError = Color(0xFFFFFFFF),
    errorContainer = Tokens.ErrorContainerL,
    onErrorContainer = Color(0xFF410E0B),
    outline = Tokens.BorderL,
    outlineVariant = Tokens.OutlineVariantL,
    scrim = Color(0xFF000000),
    inverseSurface = Tokens.CardD,
    inverseOnSurface = Tokens.ForegroundD,
    inversePrimary = Tokens.PrimaryD,
)

private val DarkColors: ColorScheme = darkColorScheme(
    primary = Tokens.PrimaryD,
    onPrimary = Tokens.OnPrimary,
    primaryContainer = Tokens.PrimaryContainerD,
    onPrimaryContainer = Tokens.OnPrimaryContainerD,
    secondary = Tokens.MutedForegroundD,
    onSecondary = Color(0xFF0F1419),
    secondaryContainer = Tokens.SecondarySurfaceD,
    onSecondaryContainer = Tokens.ForegroundD,
    tertiary = Tokens.TertiaryD,
    onTertiary = Color(0xFF00302F),
    background = Tokens.BackgroundD,
    onBackground = Tokens.ForegroundD,
    surface = Tokens.CardD,
    onSurface = Tokens.ForegroundD,
    surfaceVariant = Tokens.MutedSurfaceD,
    onSurfaceVariant = Tokens.MutedForegroundD,
    surfaceContainerLowest = Tokens.SurfaceContainerLowestD,
    surfaceContainerLow = Tokens.SurfaceContainerLowD,
    surfaceContainer = Tokens.SurfaceContainerD,
    surfaceContainerHigh = Tokens.SurfaceContainerHighD,
    surfaceContainerHighest = Tokens.SurfaceContainerHighestD,
    error = Tokens.DangerD,
    onError = Color(0xFF410E0B),
    errorContainer = Tokens.ErrorContainerD,
    onErrorContainer = Color(0xFFF9DEDC),
    outline = Tokens.BorderD,
    outlineVariant = Tokens.OutlineVariantD,
    scrim = Color(0xFF000000),
    inverseSurface = Tokens.BackgroundL,
    inverseOnSurface = Tokens.ForegroundL,
    inversePrimary = Tokens.PrimaryL,
)

/**
 * Semantic study/mastery/exam colors that have no Material role. Resolved per
 * theme and exposed through [LocalRonoColors] / `MaterialTheme.rono`.
 * Color encodes data (mastery level, correctness) — see feedback_design_taste.
 */
data class RonoColors(
    val success: Color,
    val danger: Color,
    val warning: Color,
    val masteryNone: Color,
    val masteryReview: Color,
    val masteryDeveloping: Color,
    val masteryProficient: Color,
    val masteryMastered: Color,
    val chart: List<Color>,
    val examPaper: Color,
    val examInk: Color,
    val examInk2: Color,
    val examMuted: Color,
    val examLine: Color,
    val examSoft: Color,
    val examAccent: Color,
)

private val LightRonoColors = RonoColors(
    success = Tokens.StudySuccessL,
    danger = Tokens.StudyDangerL,
    warning = Tokens.StudyWarningL,
    masteryNone = Tokens.MutedForegroundL,
    masteryReview = Tokens.MasteryReviewL,
    masteryDeveloping = Tokens.PrimaryL,
    masteryProficient = Tokens.MasteryProfL,
    masteryMastered = Tokens.MasteryMasterL,
    chart = listOf(Tokens.Chart1, Tokens.Chart2, Tokens.Chart3, Tokens.Chart4, Tokens.Chart5),
    examPaper = Tokens.ExamPaperL,
    examInk = Tokens.ExamInkL,
    examInk2 = Tokens.ExamInk2L,
    examMuted = Tokens.ExamMutedL,
    examLine = Tokens.ExamLineL,
    examSoft = Tokens.ExamSoftL,
    examAccent = Tokens.ExamAccentL,
)

private val DarkRonoColors = RonoColors(
    success = Tokens.StudySuccessD,
    danger = Tokens.StudyDangerD,
    warning = Tokens.StudyWarningD,
    masteryNone = Tokens.MutedForegroundD,
    masteryReview = Tokens.MasteryReviewD,
    masteryDeveloping = Tokens.PrimaryD,
    masteryProficient = Tokens.MasteryProfD,
    masteryMastered = Tokens.MasteryMasterD,
    chart = listOf(Tokens.Chart1, Tokens.Chart2, Tokens.Chart3, Tokens.Chart4, Tokens.Chart5),
    examPaper = Tokens.ExamPaperD,
    examInk = Tokens.ExamInkD,
    examInk2 = Tokens.ExamInk2D,
    examMuted = Tokens.ExamMutedD,
    examLine = Tokens.ExamLineD,
    examSoft = Tokens.ExamSoftD,
    examAccent = Tokens.ExamAccentD,
)

val LocalRonoColors = staticCompositionLocalOf { LightRonoColors }

/** `MaterialTheme.rono` accessor for the semantic palette. */
val MaterialTheme.rono: RonoColors
    @Composable @ReadOnlyComposable get() = LocalRonoColors.current

@Composable
fun RonoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColors else LightColors
    val ronoColors = if (darkTheme) DarkRonoColors else LightRonoColors

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            val controller = WindowCompat.getInsetsController(window, view)
            controller.isAppearanceLightStatusBars = !darkTheme
            controller.isAppearanceLightNavigationBars = !darkTheme
        }
    }

    androidx.compose.runtime.CompositionLocalProvider(LocalRonoColors provides ronoColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = RonoTypography,
            shapes = RonoShapes,
            content = content,
        )
    }
}
