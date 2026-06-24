package dev.getjanus.rono.ui.common

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import dev.getjanus.rono.R
import dev.getjanus.rono.domain.model.MasteryLevel

@Composable
fun masteryLabel(level: MasteryLevel): String = stringResource(
    when (level) {
        MasteryLevel.NONE -> R.string.mastery_none
        MasteryLevel.BEGINNER -> R.string.mastery_beginner
        MasteryLevel.DEVELOPING -> R.string.mastery_developing
        MasteryLevel.PROFICIENT -> R.string.mastery_proficient
        MasteryLevel.ADVANCED -> R.string.mastery_advanced
    },
)

@Composable
fun sessionTypeLabel(type: String): String = stringResource(
    when (type) {
        "review" -> R.string.session_type_review
        "daily_review" -> R.string.session_type_daily
        else -> R.string.session_type_adaptive
    },
)
