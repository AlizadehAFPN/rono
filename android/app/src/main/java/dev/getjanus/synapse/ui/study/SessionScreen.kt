package dev.getjanus.synapse.ui.study

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.synapse.R
import dev.getjanus.synapse.core.designsystem.components.AppCard
import dev.getjanus.synapse.core.designsystem.components.Eyebrow
import dev.getjanus.synapse.core.designsystem.components.Pill
import dev.getjanus.synapse.core.designsystem.components.PrimaryButton
import dev.getjanus.synapse.core.designsystem.components.SecondaryButton
import dev.getjanus.synapse.core.designsystem.gamification.MetricBlock
import dev.getjanus.synapse.core.designsystem.theme.Spacing
import dev.getjanus.synapse.core.designsystem.theme.synapse
import dev.getjanus.synapse.core.util.formatDueDate
import dev.getjanus.synapse.core.util.formatPercent
import dev.getjanus.synapse.core.util.formatTheta
import dev.getjanus.synapse.core.util.rememberHtmlText
import dev.getjanus.synapse.data.practice.NextItemDto
import dev.getjanus.synapse.ui.common.ErrorState
import dev.getjanus.synapse.ui.common.LoadingState
import java.time.Instant

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SessionScreen(
    onExit: () -> Unit,
    onRestart: () -> Unit,
    viewModel: SessionViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showExit by remember { mutableStateOf(false) }
    val isFinished = state.stage is SessionStage.Finished

    BackHandler(enabled = !isFinished) { showExit = true }

    if (showExit) {
        AlertDialog(
            onDismissRequest = { showExit = false },
            title = { Text(stringResource(R.string.session_exit_title)) },
            text = { Text(stringResource(R.string.session_exit_message)) },
            confirmButton = {
                TextButton(onClick = { showExit = false; viewModel.finish() }) {
                    Text(stringResource(R.string.session_exit_confirm))
                }
            },
            dismissButton = { TextButton(onClick = { showExit = false }) { Text(stringResource(R.string.common_cancel)) } },
        )
    }

    Scaffold(
        topBar = {
            if (!isFinished) {
                Column {
                    TopAppBar(
                        title = { SessionProgressLabel(state.delivered, state.target) },
                        navigationIcon = {
                            IconButton(onClick = { showExit = true }) {
                                Icon(Icons.Filled.Close, contentDescription = stringResource(R.string.session_exit_title))
                            }
                        },
                    )
                    val target = state.target ?: 0
                    if (target > 0) {
                        LinearProgressIndicator(
                            progress = { (state.delivered.toFloat() / target).coerceIn(0f, 1f) },
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }
            }
        },
    ) { padding ->
        AnimatedContent(
            targetState = state.stage,
            transitionSpec = { fadeIn() togetherWith fadeOut() },
            contentKey = { it::class },
            label = "sessionStage",
            modifier = Modifier.padding(padding).fillMaxSize(),
        ) { stage ->
            when (stage) {
                is SessionStage.Loading, is SessionStage.Finishing -> LoadingState()
                is SessionStage.Failed -> ErrorState(stage.message, onRetry = viewModel::retry)
                is SessionStage.Question -> QuestionView(
                    item = stage.item,
                    selectedOptionId = stage.selectedOptionId,
                    rail = state,
                    submitting = state.submitting,
                    onSelect = viewModel::selectOption,
                    onSubmit = viewModel::submit,
                    onSkip = viewModel::skip,
                )
                is SessionStage.Feedback -> FeedbackView(
                    item = stage.item,
                    result = stage.result,
                    selectedOptionId = stage.selectedOptionId,
                    rail = state,
                    onNext = viewModel::next,
                )
                is SessionStage.Finished -> SessionSummaryView(
                    summary = stage.summary,
                    onRestart = onRestart,
                    onDone = onExit,
                )
            }
        }
    }
}

@Composable
private fun SessionProgressLabel(delivered: Int, target: Int?) {
    val text = if (target != null && target > 0) {
        stringResource(R.string.session_progress, (delivered + 1).coerceAtMost(target), target)
    } else "#${delivered + 1}"
    Text(text, style = MaterialTheme.typography.titleMedium)
}

@Composable
private fun StatRail(rail: SessionUiState) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
        MetricBlock("θ", formatTheta(rail.theta))
        MetricBlock(stringResource(R.string.session_streak), rail.streak.toString(), color = MaterialTheme.synapse.warning)
        MetricBlock(stringResource(R.string.session_accuracy), formatPercent(rail.accuracy), color = MaterialTheme.synapse.success)
    }
}

@Composable
private fun QuestionView(
    item: NextItemDto,
    selectedOptionId: String?,
    rail: SessionUiState,
    submitting: Boolean,
    onSelect: (String) -> Unit,
    onSubmit: () -> Unit,
    onSkip: () -> Unit,
) {
    Column(Modifier.fillMaxSize()) {
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = Spacing.screen),
        ) {
            Spacer(Modifier.height(Spacing.sm))
            StatRail(rail)
            Spacer(Modifier.height(Spacing.md))
            Text(rememberHtmlText(item.content), style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(Spacing.lg))
            item.options.sortedBy { it.displayOrder }.forEach { opt ->
                OptionRow(
                    label = opt.key,
                    content = opt.content,
                    visual = if (opt.id == selectedOptionId) OptionVisual.SELECTED else OptionVisual.DEFAULT,
                    enabled = !submitting,
                    onClick = { onSelect(opt.id) },
                    modifier = Modifier.padding(bottom = Spacing.sm),
                )
            }
            Spacer(Modifier.height(Spacing.md))
        }
        ActionBar {
            SecondaryButton(text = stringResource(R.string.session_skip), onClick = onSkip, modifier = Modifier.weight(1f), enabled = !submitting)
            Spacer(Modifier.width(Spacing.gap))
            PrimaryButton(
                text = stringResource(R.string.session_submit),
                onClick = onSubmit,
                modifier = Modifier.weight(1.4f),
                enabled = selectedOptionId != null,
                loading = submitting,
            )
        }
    }
}

@Composable
private fun FeedbackView(
    item: NextItemDto,
    result: dev.getjanus.synapse.data.practice.AnswerResultDto,
    selectedOptionId: String?,
    rail: SessionUiState,
    onNext: () -> Unit,
) {
    Column(Modifier.fillMaxSize()) {
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = Spacing.screen),
        ) {
            Spacer(Modifier.height(Spacing.sm))
            StatRail(rail)
            Spacer(Modifier.height(Spacing.md))
            FeedbackBanner(result)
            Spacer(Modifier.height(Spacing.md))
            Text(rememberHtmlText(item.content), style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(Spacing.lg))
            item.options.sortedBy { it.displayOrder }.forEach { opt ->
                val visual = when {
                    opt.id == result.correctOptionId -> OptionVisual.CORRECT
                    opt.id == selectedOptionId -> OptionVisual.WRONG
                    else -> OptionVisual.DEFAULT
                }
                OptionRow(
                    label = opt.key,
                    content = opt.content,
                    visual = visual,
                    enabled = false,
                    onClick = {},
                    modifier = Modifier.padding(bottom = Spacing.sm),
                )
            }
            if (!result.explanation.isNullOrBlank()) {
                Spacer(Modifier.height(Spacing.sm))
                AppCard {
                    Eyebrow(stringResource(R.string.session_explanation))
                    Spacer(Modifier.height(Spacing.sm))
                    Text(rememberHtmlText(result.explanation), style = MaterialTheme.typography.bodyLarge)
                }
            }
            Spacer(Modifier.height(Spacing.md))
        }
        ActionBar {
            PrimaryButton(text = stringResource(R.string.session_next), onClick = onNext, modifier = Modifier.fillMaxWidth())
        }
    }
}

@Composable
private fun FeedbackBanner(result: dev.getjanus.synapse.data.practice.AnswerResultDto) {
    val (label, color) = when {
        result.wasSkipped -> stringResource(R.string.session_skipped) to MaterialTheme.colorScheme.onSurfaceVariant
        result.isCorrect -> stringResource(R.string.session_correct) to MaterialTheme.synapse.success
        else -> stringResource(R.string.session_incorrect) to MaterialTheme.synapse.danger
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, style = MaterialTheme.typography.titleLarge, color = color)
        Row(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            Pill(text = "θ ${formatTheta(result.thetaDelta, signed = true)}", color = if (result.thetaDelta >= 0) MaterialTheme.synapse.success else MaterialTheme.synapse.danger)
            result.card.dueAt?.let { due ->
                Pill(text = formatDueDate(runCatching { Instant.parse(due) }.getOrNull()), color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
private fun ActionBar(content: @Composable androidx.compose.foundation.layout.RowScope.() -> Unit) {
    Surface(tonalElevation = 3.dp, shadowElevation = 8.dp, color = MaterialTheme.colorScheme.surface) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.screen, vertical = Spacing.gap),
            verticalAlignment = Alignment.CenterVertically,
            content = content,
        )
    }
}
