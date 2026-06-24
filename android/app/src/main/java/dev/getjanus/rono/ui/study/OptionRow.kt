package dev.getjanus.rono.ui.study

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import dev.getjanus.rono.core.designsystem.theme.rono

enum class OptionVisual { DEFAULT, SELECTED, CORRECT, WRONG }

@Composable
fun OptionRow(
    label: String,
    content: String,
    visual: OptionVisual,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val accent = when (visual) {
        OptionVisual.DEFAULT -> MaterialTheme.colorScheme.outlineVariant
        OptionVisual.SELECTED -> MaterialTheme.colorScheme.primary
        OptionVisual.CORRECT -> MaterialTheme.rono.success
        OptionVisual.WRONG -> MaterialTheme.rono.danger
    }
    val border by animateColorAsState(accent, label = "optBorder")
    val container = when (visual) {
        OptionVisual.DEFAULT -> MaterialTheme.colorScheme.surface
        else -> accent.copy(alpha = 0.10f)
    }

    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = container,
        border = BorderStroke(if (visual == OptionVisual.DEFAULT) 1.dp else 1.5.dp, border),
        onClick = onClick,
        enabled = enabled,
    ) {
        Row(
            Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Surface(shape = CircleShape, color = badgeColor(visual, accent)) {
                Box(Modifier.size(28.dp), contentAlignment = Alignment.Center) {
                    when (visual) {
                        OptionVisual.CORRECT -> Icon(Icons.Filled.Check, null, tint = Color.White, modifier = Modifier.size(18.dp))
                        OptionVisual.WRONG -> Icon(Icons.Filled.Close, null, tint = Color.White, modifier = Modifier.size(18.dp))
                        else -> Text(
                            label,
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                            color = if (visual == OptionVisual.SELECTED) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
            Text(content, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurface)
        }
    }
}

@Composable
private fun badgeColor(visual: OptionVisual, accent: Color): Color = when (visual) {
    OptionVisual.DEFAULT -> MaterialTheme.colorScheme.surfaceContainerHighest
    OptionVisual.SELECTED -> accent
    OptionVisual.CORRECT -> accent
    OptionVisual.WRONG -> accent
}
