package dev.getjanus.rono.ui.study

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.rono.R
import dev.getjanus.rono.core.designsystem.components.AppCard
import dev.getjanus.rono.core.designsystem.components.Eyebrow
import dev.getjanus.rono.core.designsystem.components.IconChip
import dev.getjanus.rono.core.designsystem.components.Pill
import dev.getjanus.rono.core.designsystem.gamification.ProgressRing
import dev.getjanus.rono.core.designsystem.gamification.masteryColor
import dev.getjanus.rono.core.designsystem.theme.Spacing
import dev.getjanus.rono.core.designsystem.theme.rono
import dev.getjanus.rono.core.util.UiState
import dev.getjanus.rono.data.study.CategoryCardDto
import dev.getjanus.rono.domain.model.MasteryLevel
import dev.getjanus.rono.ui.common.ErrorState
import dev.getjanus.rono.ui.common.LoadingState
import dev.getjanus.rono.ui.common.masteryLabel
import dev.getjanus.rono.ui.navigation.SessionRoute

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudyScreen(
    contentPadding: PaddingValues,
    onStartSession: (SessionRoute) -> Unit,
    onOpenDaily: () -> Unit,
    onOpenExam: () -> Unit,
    viewModel: StudyViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val refreshing by viewModel.refreshing.collectAsStateWithLifecycle()

    when (val s = state) {
        is UiState.Loading -> LoadingState(Modifier.padding(contentPadding))
        is UiState.Error -> ErrorState(s.message, onRetry = viewModel::load, modifier = Modifier.padding(contentPadding))
        is UiState.Success -> PullToRefreshBox(
            isRefreshing = refreshing,
            onRefresh = viewModel::refresh,
            modifier = Modifier.padding(contentPadding),
        ) {
            StudyContent(s.data, onStartSession, onOpenDaily, onOpenExam)
        }
    }
}

@Composable
private fun StudyContent(
    categories: List<CategoryCardDto>,
    onStartSession: (SessionRoute) -> Unit,
    onOpenDaily: () -> Unit,
    onOpenExam: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = PaddingValues(Spacing.screen, Spacing.md, Spacing.screen, Spacing.xxl),
        verticalArrangement = Arrangement.spacedBy(Spacing.gap),
    ) {
        item { Text(stringResource(R.string.study_title), style = MaterialTheme.typography.headlineMedium) }

        item { DailyReviewEntry(onOpenDaily) }

        item {
            ActionEntry(
                icon = Icons.Filled.AutoAwesome,
                title = stringResource(R.string.study_start_adaptive),
                tint = MaterialTheme.colorScheme.primary,
                onClick = { onStartSession(SessionRoute(sessionType = "adaptive_practice")) },
            )
        }

        item {
            ActionEntry(
                icon = Icons.Filled.EditNote,
                title = stringResource(R.string.exam_title),
                tint = MaterialTheme.rono.examAccent,
                onClick = onOpenExam,
            )
        }

        item { Eyebrow(stringResource(R.string.study_collections)) }

        if (categories.isEmpty()) {
            item { Text(stringResource(R.string.study_no_collections), style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant) }
        } else {
            items(categories, key = { it.topicId }) { card ->
                CategoryCard(card) {
                    onStartSession(
                        SessionRoute(
                            sessionType = card.recommendedMode ?: "adaptive_practice",
                            topicId = card.topicId,
                        ),
                    )
                }
            }
        }
    }
}

@Composable
private fun DailyReviewEntry(onClick: () -> Unit) {
    AppCard(modifier = Modifier.fillMaxWidth().clickableCard(onClick)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconChip(Icons.Filled.CalendarMonth, tint = MaterialTheme.rono.warning)
            Spacer(Modifier.width(Spacing.md))
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.study_daily_review), style = MaterialTheme.typography.titleMedium)
                Text(stringResource(R.string.study_daily_review_desc), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun ActionEntry(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, tint: androidx.compose.ui.graphics.Color, onClick: () -> Unit) {
    AppCard(modifier = Modifier.fillMaxWidth().clickableCard(onClick)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconChip(icon, tint = tint)
            Spacer(Modifier.width(Spacing.md))
            Text(title, style = MaterialTheme.typography.titleMedium)
        }
    }
}

@Composable
private fun CategoryCard(card: CategoryCardDto, onClick: () -> Unit) {
    val level = MasteryLevel.fromApi(card.masteryLevel)
    AppCard(modifier = Modifier.fillMaxWidth().clickableCard(onClick)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            ProgressRing(progress = card.coverage, size = 56.dp, stroke = 5.5.dp, color = masteryColor(level)) {
                Text("${(card.coverage * 100).toInt()}%", style = MaterialTheme.typography.labelMedium)
            }
            Spacer(Modifier.width(Spacing.md))
            Column(Modifier.weight(1f)) {
                Text(card.topicName, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Spacer(Modifier.height(4.dp))
                Pill(text = masteryLabel(level), color = masteryColor(level))
            }
        }
        Spacer(Modifier.height(Spacing.sm))
        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            if (card.newCount > 0) Pill(text = stringResource(R.string.study_new_count, card.newCount), color = MaterialTheme.colorScheme.primary)
            if (card.dueCount > 0) Pill(text = stringResource(R.string.study_due_count, card.dueCount), color = MaterialTheme.rono.warning)
            Pill(text = stringResource(R.string.study_total_count, card.totalQuestions), color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

private fun Modifier.clickableCard(onClick: () -> Unit): Modifier = clickable(onClick = onClick)
