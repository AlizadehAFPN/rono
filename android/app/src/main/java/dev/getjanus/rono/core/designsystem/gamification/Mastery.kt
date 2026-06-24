package dev.getjanus.rono.core.designsystem.gamification

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.graphics.Color
import dev.getjanus.rono.core.designsystem.theme.rono
import dev.getjanus.rono.domain.model.MasteryLevel

/** Mastery band → its meaningful ring/accent color (color encodes data). */
@Composable
@ReadOnlyComposable
fun masteryColor(level: MasteryLevel): Color {
    val c = MaterialTheme.rono
    return when (level) {
        MasteryLevel.NONE -> c.masteryNone
        MasteryLevel.BEGINNER -> c.masteryReview
        MasteryLevel.DEVELOPING -> c.masteryDeveloping
        MasteryLevel.PROFICIENT -> c.masteryProficient
        MasteryLevel.ADVANCED -> c.masteryMastered
    }
}

/** Short human label for a mastery band (English base; tr handled at call sites with res). */
fun MasteryLevel.label(): String = when (this) {
    MasteryLevel.NONE -> "Not started"
    MasteryLevel.BEGINNER -> "Beginner"
    MasteryLevel.DEVELOPING -> "Developing"
    MasteryLevel.PROFICIENT -> "Proficient"
    MasteryLevel.ADVANCED -> "Advanced"
}
