package dev.getjanus.rono.ui.progress

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
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
import dev.getjanus.rono.core.designsystem.components.Pill
import dev.getjanus.rono.core.designsystem.gamification.MetricBlock
import dev.getjanus.rono.core.designsystem.gamification.masteryColor
import dev.getjanus.rono.core.designsystem.theme.MetricLargeTextStyle
import dev.getjanus.rono.core.designsystem.theme.Spacing
import dev.getjanus.rono.core.designsystem.theme.rono
import dev.getjanus.rono.core.util.UiState
import dev.getjanus.rono.core.util.formatPercent
import dev.getjanus.rono.core.util.formatTheta
import dev.getjanus.rono.data.progress.ProgressDto
import dev.getjanus.rono.data.progress.TopicMasteryDto
import dev.getjanus.rono.domain.model.MasteryLevel
import dev.getjanus.rono.ui.common.ErrorState
import dev.getjanus.rono.ui.common.LoadingState
import dev.getjanus.rono.ui.common.masteryLabel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProgressScreen(
    contentPadding: androidx.compose.foundation.layout.PaddingValues,
    viewModel: ProgressViewModel = hiltViewModel(),
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
            ProgressContent(s.data)
        }
    }
}

@Composable
private fun ProgressContent(data: ProgressDto) {
    LazyColumn(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(Spacing.screen, Spacing.md, Spacing.screen, Spacing.xxl),
        verticalArrangement = Arrangement.spacedBy(Spacing.gap),
    ) {
        item {
            Text(stringResource(R.string.progress_title), style = MaterialTheme.typography.headlineMedium)
        }
        item { OverallCard(data) }
        item { Eyebrow(stringResource(R.string.progress_by_subject)) }
        if (data.topics.isEmpty()) {
            item {
                Text(stringResource(R.string.progress_no_topics), style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            items(data.topics, key = { it.topicId }) { topic -> TopicRow(topic) }
        }
    }
}

@Composable
private fun OverallCard(data: ProgressDto) {
    val level = MasteryLevel.fromTheta(data.globalTheta)
    AppCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column {
                Eyebrow(stringResource(R.string.dash_ability))
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(formatTheta(data.globalTheta), style = MetricLargeTextStyle, color = masteryColor(level))
                    Spacer(Modifier.width(6.dp))
                    if (data.globalThetaSe != null) {
                        Text(
                            stringResource(R.string.progress_se, formatTheta(data.globalThetaSe)),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(bottom = 6.dp),
                        )
                    }
                }
                Spacer(Modifier.height(4.dp))
                Pill(text = masteryLabel(level), color = masteryColor(level))
            }
            Spacer(Modifier.weight(1f))
            Column(horizontalAlignment = Alignment.End) {
                MetricBlock(stringResource(R.string.dash_accuracy), formatPercent(data.accuracy), color = MaterialTheme.rono.success)
            }
        }
        Spacer(Modifier.height(Spacing.md))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            MetricBlock(stringResource(R.string.progress_total_answered), data.totalResponses.toString())
            MetricBlock(stringResource(R.string.progress_correct), data.totalCorrect.toString())
            MetricBlock(stringResource(R.string.dash_accuracy), formatPercent(data.accuracy))
        }
    }
}

@Composable
private fun TopicRow(topic: TopicMasteryDto) {
    val level = MasteryLevel.fromApi(topic.masteryLevel)
    AppCard {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(topic.topicName, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Spacer(Modifier.height(4.dp))
                Pill(text = masteryLabel(level), color = masteryColor(level))
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(formatPercent(topic.accuracyRate), style = MaterialTheme.typography.titleMedium, color = MaterialTheme.rono.success)
                Text("${topic.correctResponses}/${topic.totalResponses}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
