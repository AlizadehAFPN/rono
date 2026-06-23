package dev.getjanus.synapse.core.designsystem.gamification

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import dev.getjanus.synapse.core.designsystem.theme.synapse
import dev.getjanus.synapse.core.util.rememberReducedMotion

/** Animated streak chip — a softly flickering flame + day count. */
@Composable
fun StreakBadge(days: Int, modifier: Modifier = Modifier) {
    val warning = MaterialTheme.synapse.warning
    val reduced = rememberReducedMotion()
    val scale = if (reduced) 1f else {
        val transition = rememberInfiniteTransition(label = "flame")
        val s by transition.animateFloat(
            initialValue = 1f,
            targetValue = 1.12f,
            animationSpec = infiniteRepeatable(tween(820, easing = LinearEasing), RepeatMode.Reverse),
            label = "flameScale",
        )
        s
    }

    Surface(modifier = modifier, shape = CircleShape, color = warning.copy(alpha = 0.14f)) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Icon(
                Icons.Filled.LocalFireDepartment,
                contentDescription = "streak",
                tint = warning,
                modifier = Modifier.size(18.dp).graphicsLayer { scaleX = scale; scaleY = scale },
            )
            Text(
                "$days",
                style = MaterialTheme.typography.titleMedium,
                color = warning,
            )
        }
    }
}
