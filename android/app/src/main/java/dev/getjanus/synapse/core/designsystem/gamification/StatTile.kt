package dev.getjanus.synapse.core.designsystem.gamification

import androidx.compose.animation.core.animateIntAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import dev.getjanus.synapse.core.designsystem.components.AppCard
import dev.getjanus.synapse.core.designsystem.components.IconChip
import dev.getjanus.synapse.core.designsystem.motion.Motion
import dev.getjanus.synapse.core.designsystem.theme.MetricLargeTextStyle

/** Stat tile with an icon chip and a value that counts up when it changes. */
@Composable
fun StatTile(
    label: String,
    modifier: Modifier = Modifier,
    value: String? = null,
    animatedValue: Int? = null,
    icon: ImageVector? = null,
    tint: Color = MaterialTheme.colorScheme.primary,
) {
    AppCard(modifier = modifier) {
        if (icon != null) {
            IconChip(icon = icon, tint = tint)
            Spacer(Modifier.height(10.dp))
        }
        val text = when {
            animatedValue != null -> {
                val v by animateIntAsState(animatedValue, Motion.standard(), label = "stat")
                v.toString()
            }
            else -> value ?: "—"
        }
        Text(text, style = MetricLargeTextStyle, color = MaterialTheme.colorScheme.onSurface)
        Spacer(Modifier.height(2.dp))
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

/** Inline label/value row (used in summaries). */
@Composable
fun StatRow(label: String, value: String, modifier: Modifier = Modifier, valueColor: Color = MaterialTheme.colorScheme.onSurface) {
    Row(modifier, horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.titleMedium, color = valueColor)
    }
}

/** Vertical metric block without a card (for rails / dense rows). */
@Composable
fun MetricBlock(label: String, value: String, modifier: Modifier = Modifier, color: Color = MaterialTheme.colorScheme.onSurface) {
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.titleLarge, color = color)
        Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
