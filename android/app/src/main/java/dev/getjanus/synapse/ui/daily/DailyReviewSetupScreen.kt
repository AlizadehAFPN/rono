package dev.getjanus.synapse.ui.daily

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.synapse.R
import dev.getjanus.synapse.core.designsystem.components.AppCard
import dev.getjanus.synapse.core.designsystem.components.Eyebrow
import dev.getjanus.synapse.core.designsystem.components.PrimaryButton
import dev.getjanus.synapse.core.designsystem.gamification.masteryColor
import dev.getjanus.synapse.core.designsystem.theme.Spacing
import dev.getjanus.synapse.core.util.UiState
import dev.getjanus.synapse.data.study.CategoryCardDto
import dev.getjanus.synapse.domain.model.MasteryLevel
import dev.getjanus.synapse.ui.common.ErrorState
import dev.getjanus.synapse.ui.common.LoadingState
import dev.getjanus.synapse.ui.navigation.SessionRoute

private val countOptions = listOf(10, 20, 30, 50)
private val timeOptions = listOf(10, 20, 30, 45)

@Composable
fun DailyReviewSetupScreen(
    contentPadding: PaddingValues,
    onStart: (SessionRoute) -> Unit,
    viewModel: DailyReviewViewModel = hiltViewModel(),
) {
    val categoriesState by viewModel.categories.collectAsStateWithLifecycle()
    val config by viewModel.config.collectAsStateWithLifecycle()

    when (val s = categoriesState) {
        is UiState.Loading -> LoadingState(Modifier.padding(contentPadding))
        is UiState.Error -> ErrorState(s.message, onRetry = viewModel::load, modifier = Modifier.padding(contentPadding))
        is UiState.Success -> {
            val selectedCards = s.data.filter { config.selected.contains(it.topicId) }
            val dueSum = selectedCards.sumOf { it.dueCount }
            val newSum = selectedCards.sumOf { it.newCount }

            Box(Modifier.padding(contentPadding).fillMaxWidth()) {
                LazyColumn(
                    contentPadding = PaddingValues(Spacing.screen, Spacing.md, Spacing.screen, 120.dp),
                    verticalArrangement = Arrangement.spacedBy(Spacing.gap),
                ) {
                    item { Text(stringResource(R.string.daily_title), style = MaterialTheme.typography.headlineMedium) }

                    item { BudgetSelector(config, viewModel) }

                    item {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Eyebrow(stringResource(R.string.daily_collections))
                            Text(stringResource(R.string.daily_all), modifier = Modifier.clickable { viewModel.selectAll() }, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                        }
                    }

                    items(s.data, key = { it.topicId }) { card ->
                        CollectionRow(card, config.selected.contains(card.topicId)) { viewModel.toggle(card.topicId) }
                    }
                }

                Surface(
                    modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth(),
                    tonalElevation = 3.dp,
                    shadowElevation = 8.dp,
                    color = MaterialTheme.colorScheme.surface,
                ) {
                    Column(Modifier.padding(horizontal = Spacing.screen, vertical = Spacing.gap)) {
                        Text(stringResource(R.string.daily_summary, dueSum, newSum), style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(Spacing.sm))
                        PrimaryButton(text = stringResource(R.string.daily_start), onClick = { onStart(viewModel.buildRoute()) })
                    }
                }
            }
        }
    }
}

@Composable
private fun BudgetSelector(config: DailyConfig, viewModel: DailyReviewViewModel) {
    AppCard {
        Eyebrow(stringResource(R.string.daily_budget))
        Spacer(Modifier.height(Spacing.sm))
        SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
            SegmentedButton(
                selected = config.budgetMode == BudgetMode.COUNT,
                onClick = { viewModel.setBudgetMode(BudgetMode.COUNT) },
                shape = SegmentedButtonDefaults.itemShape(0, 2),
            ) { Text(stringResource(R.string.daily_by_count)) }
            SegmentedButton(
                selected = config.budgetMode == BudgetMode.TIME,
                onClick = { viewModel.setBudgetMode(BudgetMode.TIME) },
                shape = SegmentedButtonDefaults.itemShape(1, 2),
            ) { Text(stringResource(R.string.daily_by_time)) }
        }
        Spacer(Modifier.height(Spacing.sm))
        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            if (config.budgetMode == BudgetMode.COUNT) {
                countOptions.forEach { n ->
                    FilterChip(selected = config.countTarget == n, onClick = { viewModel.setCount(n) }, label = { Text("$n") })
                }
            } else {
                timeOptions.forEach { m ->
                    FilterChip(selected = config.timeMinutes == m, onClick = { viewModel.setTime(m) }, label = { Text(stringResource(R.string.daily_minutes, m)) })
                }
            }
        }
    }
}

@Composable
private fun CollectionRow(card: CategoryCardDto, checked: Boolean, onToggle: () -> Unit) {
    val level = MasteryLevel.fromApi(card.masteryLevel)
    AppCard(modifier = Modifier.fillMaxWidth().clickable { onToggle() }) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(10.dp).clip(CircleShape).background(masteryColor(level)))
            Spacer(Modifier.width(Spacing.sm))
            Column(Modifier.weight(1f)) {
                Text(card.topicName, style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    "${stringResource(R.string.study_due_count, card.dueCount)} · ${stringResource(R.string.study_new_count, card.newCount)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Checkbox(checked = checked, onCheckedChange = { onToggle() })
        }
    }
}
