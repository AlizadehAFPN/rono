package dev.getjanus.synapse.ui.exam

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.outlined.Flag
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.synapse.R
import dev.getjanus.synapse.core.designsystem.components.PrimaryButton
import dev.getjanus.synapse.core.designsystem.components.SecondaryButton
import dev.getjanus.synapse.core.designsystem.theme.Spacing
import dev.getjanus.synapse.core.designsystem.theme.synapse
import dev.getjanus.synapse.core.util.formatClock
import dev.getjanus.synapse.core.util.rememberHtmlText
import dev.getjanus.synapse.ui.study.OptionRow
import dev.getjanus.synapse.ui.study.OptionVisual
import dev.getjanus.synapse.ui.study.SessionSummaryView
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExamScreen(
    onExit: () -> Unit,
    viewModel: ExamViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var showExit by remember { mutableStateOf(false) }

    when (val phase = state.phase) {
        is ExamPhase.Loading, is ExamPhase.Submitting ->
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { dev.getjanus.synapse.ui.common.LoadingState() }
        is ExamPhase.Failed ->
            dev.getjanus.synapse.ui.common.ErrorState(phase.message, onRetry = viewModel::retry)
        is ExamPhase.Results ->
            SessionSummaryView(summary = phase.summary, onRestart = onExit, onDone = onExit)
        is ExamPhase.Running -> {
            BackHandler { showExit = true }
            if (showExit) {
                AlertDialog(
                    onDismissRequest = { showExit = false },
                    title = { Text(stringResource(R.string.session_exit_title)) },
                    text = { Text(stringResource(R.string.session_exit_message)) },
                    confirmButton = { TextButton(onClick = { showExit = false; viewModel.submitExam() }) { Text(stringResource(R.string.exam_submit)) } },
                    dismissButton = { TextButton(onClick = { showExit = false }) { Text(stringResource(R.string.common_cancel)) } },
                )
            }
            RunningExam(state, viewModel, onClose = { showExit = true })
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RunningExam(state: ExamUiState, viewModel: ExamViewModel, onClose: () -> Unit) {
    val item = state.current ?: return
    val elapsed by produceState(initialValue = 0L, state.startedAtMs) {
        while (true) {
            value = ((System.currentTimeMillis() - state.startedAtMs) / 1000).coerceAtLeast(0)
            delay(1000)
        }
    }
    val result = state.results[item.itemId]
    val selected = state.answers[item.itemId]
    val isFlagged = state.flagged.contains(item.itemId)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.exam_question_n, state.index + 1, state.paper.size), style = MaterialTheme.typography.titleMedium) },
                navigationIcon = { IconButton(onClick = onClose) { Icon(Icons.Filled.Close, contentDescription = null) } },
                actions = {
                    Text(formatClock(elapsed), style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(end = Spacing.sm))
                    IconButton(onClick = viewModel::toggleFlag) {
                        Icon(
                            if (isFlagged) Icons.Filled.Flag else Icons.Outlined.Flag,
                            contentDescription = stringResource(R.string.exam_flag),
                            tint = if (isFlagged) MaterialTheme.synapse.warning else MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                },
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = Spacing.screen)) {
                Spacer(Modifier.height(Spacing.sm))
                Text(rememberHtmlText(item.content), style = MaterialTheme.typography.titleLarge)
                Spacer(Modifier.height(Spacing.lg))
                item.options.sortedBy { it.displayOrder }.forEach { opt ->
                    val visual = when {
                        result != null && opt.id == result.correctOptionId -> OptionVisual.CORRECT
                        result != null && opt.id == selected -> OptionVisual.WRONG
                        opt.id == selected -> OptionVisual.SELECTED
                        else -> OptionVisual.DEFAULT
                    }
                    OptionRow(
                        label = opt.key,
                        content = opt.content,
                        visual = visual,
                        enabled = result == null,
                        onClick = { viewModel.select(opt.id) },
                        modifier = Modifier.padding(bottom = Spacing.sm),
                    )
                }
                Spacer(Modifier.height(Spacing.md))
            }

            AnswerGrid(state, onJump = viewModel::goTo)

            Surface(tonalElevation = 3.dp, shadowElevation = 8.dp, color = MaterialTheme.colorScheme.surface) {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = Spacing.screen, vertical = Spacing.gap),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    SecondaryButton(
                        text = stringResource(R.string.common_back),
                        onClick = viewModel::prev,
                        modifier = Modifier.weight(1f),
                        enabled = state.index > 0,
                    )
                    Spacer(Modifier.width(Spacing.gap))
                    if (state.index < state.paper.lastIndex) {
                        PrimaryButton(text = stringResource(R.string.session_next), onClick = viewModel::next, modifier = Modifier.weight(1.4f), leadingIcon = Icons.AutoMirrored.Filled.ArrowForward)
                    } else {
                        PrimaryButton(text = stringResource(R.string.exam_submit), onClick = viewModel::submitExam, modifier = Modifier.weight(1.4f))
                    }
                }
            }
        }
    }
}

@Composable
private fun AnswerGrid(state: ExamUiState, onJump: (Int) -> Unit) {
    LazyRow(
        modifier = Modifier.fillMaxWidth().padding(horizontal = Spacing.screen, vertical = Spacing.sm),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        items(state.paper.size) { i ->
            val itemId = state.paper[i].itemId
            val answered = state.answers.containsKey(itemId)
            val flagged = state.flagged.contains(itemId)
            val isCurrent = i == state.index
            val bg = when {
                isCurrent -> MaterialTheme.colorScheme.primary
                answered -> MaterialTheme.colorScheme.primary.copy(alpha = 0.22f)
                else -> MaterialTheme.colorScheme.surfaceContainerHighest
            }
            val fg = if (isCurrent) Color.White else MaterialTheme.colorScheme.onSurface
            Surface(
                shape = CircleShape,
                color = bg,
                border = if (flagged) androidx.compose.foundation.BorderStroke(1.5.dp, MaterialTheme.synapse.warning) else null,
                onClick = { onJump(i) },
            ) {
                Box(Modifier.size(34.dp), contentAlignment = Alignment.Center) {
                    Text("${i + 1}", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold, color = fg)
                }
            }
        }
    }
}
