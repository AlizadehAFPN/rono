package dev.getjanus.synapse.core.designsystem.gamification

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import dev.getjanus.synapse.core.designsystem.motion.Motion
import dev.getjanus.synapse.core.util.rememberReducedMotion

/**
 * Animated progress ring. [progress] in 0..1; [color] should encode meaning
 * (e.g. mastery band). Optional [center] content (a metric, an icon).
 */
@Composable
fun ProgressRing(
    progress: Float,
    modifier: Modifier = Modifier,
    size: Dp = 120.dp,
    stroke: Dp = 9.dp,
    color: Color = Color.Unspecified,
    trackColor: Color = Color.Unspecified,
    center: @Composable () -> Unit = {},
) {
    val reduced = rememberReducedMotion()
    val target = progress.coerceIn(0f, 1f)
    val animated by animateFloatAsState(
        targetValue = target,
        animationSpec = if (reduced) Motion.effect() else Motion.ringSpring,
        label = "ring",
    )
    val resolvedColor = if (color == Color.Unspecified) androidx.compose.material3.MaterialTheme.colorScheme.primary else color
    val resolvedTrack = if (trackColor == Color.Unspecified) resolvedColor.copy(alpha = 0.16f) else trackColor

    Box(modifier = modifier.size(size), contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.size(size)) {
            val strokePx = stroke.toPx()
            val inset = strokePx / 2f
            val arcSize = androidx.compose.ui.geometry.Size(this.size.width - strokePx, this.size.height - strokePx)
            val topLeft = androidx.compose.ui.geometry.Offset(inset, inset)
            drawArc(
                color = resolvedTrack,
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokePx, cap = StrokeCap.Round),
            )
            drawArc(
                color = resolvedColor,
                startAngle = -90f,
                sweepAngle = 360f * animated,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokePx, cap = StrokeCap.Round),
            )
        }
        center()
    }
}
