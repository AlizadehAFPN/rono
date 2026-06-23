package dev.getjanus.synapse.ui.study

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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import dev.getjanus.synapse.R
import dev.getjanus.synapse.core.designsystem.components.AppCard
import dev.getjanus.synapse.core.designsystem.components.PrimaryButton
import dev.getjanus.synapse.core.designsystem.components.SecondaryButton
import dev.getjanus.synapse.core.designsystem.gamification.Confetti
import dev.getjanus.synapse.core.designsystem.gamification.MetricBlock
import dev.getjanus.synapse.core.designsystem.gamification.ProgressRing
import dev.getjanus.synapse.core.designsystem.theme.MetricLargeTextStyle
import dev.getjanus.synapse.core.designsystem.theme.Spacing
import dev.getjanus.synapse.core.designsystem.theme.synapse
import dev.getjanus.synapse.core.util.formatClock
import dev.getjanus.synapse.core.util.formatPercent
import dev.getjanus.synapse.core.util.formatTheta
import dev.getjanus.synapse.data.practice.SessionSummaryDto

@Composable
fun SessionSummaryView(
    summary: SessionSummaryDto,
    onRestart: () -> Unit,
    onDone: () -> Unit,
) {
    if (summary.itemsDelivered == 0) {
        CaughtUpView(onDone = onDone)
        return
    }

    val accuracyFraction = when {
        summary.scorePercent != null -> (summary.scorePercent / 100.0)
        summary.itemsDelivered > 0 -> summary.itemsCorrect.toDouble() / summary.itemsDelivered
        else -> 0.0
    }
    val celebrate = accuracyFraction >= 0.6

    Box(Modifier.fillMaxSize()) {
        Column(
            Modifier.fillMaxSize().padding(horizontal = Spacing.screen),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(stringResource(R.string.summary_title), style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center)
            Spacer(Modifier.height(Spacing.xl))
            ProgressRing(
                progress = accuracyFraction.toFloat(),
                size = 168.dp,
                stroke = 12.dp,
                color = MaterialTheme.synapse.success,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(formatPercent(accuracyFraction), style = MetricLargeTextStyle)
                    Text(stringResource(R.string.session_accuracy), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Spacer(Modifier.height(Spacing.xl))
            AppCard(modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    MetricBlock(stringResource(R.string.summary_correct), summary.itemsCorrect.toString(), color = MaterialTheme.synapse.success)
                    MetricBlock(stringResource(R.string.summary_wrong), summary.itemsWrong.toString(), color = MaterialTheme.synapse.danger)
                    MetricBlock(stringResource(R.string.summary_skipped), summary.itemsSkipped.toString())
                }
                Spacer(Modifier.height(Spacing.md))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    MetricBlock(
                        stringResource(R.string.summary_ability_change),
                        formatTheta(summary.thetaDelta, signed = true),
                        color = if ((summary.thetaDelta ?: 0.0) >= 0) MaterialTheme.synapse.success else MaterialTheme.synapse.danger,
                    )
                    summary.timeSpentSeconds?.let {
                        MetricBlock(stringResource(R.string.summary_time), formatClock(it.toLong()))
                    }
                }
            }
            Spacer(Modifier.height(Spacing.xl))
            PrimaryButton(text = stringResource(R.string.summary_restart), onClick = onRestart)
            Spacer(Modifier.height(Spacing.sm))
            SecondaryButton(text = stringResource(R.string.summary_done), onClick = onDone)
        }
        Confetti(play = celebrate, modifier = Modifier.fillMaxSize())
    }
}

@Composable
private fun CaughtUpView(onDone: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(horizontal = Spacing.screen),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("✓", style = MaterialTheme.typography.displayLarge, color = MaterialTheme.synapse.success)
        Spacer(Modifier.height(Spacing.md))
        Text(stringResource(R.string.session_caught_up_title), style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
        Spacer(Modifier.height(Spacing.sm))
        Text(stringResource(R.string.session_caught_up_body), style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
        Spacer(Modifier.height(Spacing.xl))
        PrimaryButton(text = stringResource(R.string.summary_done), onClick = onDone)
    }
}
