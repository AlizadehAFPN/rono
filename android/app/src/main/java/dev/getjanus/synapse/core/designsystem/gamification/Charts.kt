package dev.getjanus.synapse.core.designsystem.gamification

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import dev.getjanus.synapse.core.designsystem.motion.Motion
import dev.getjanus.synapse.core.util.rememberReducedMotion

/**
 * Lightweight ability (θ) trend line with a soft gradient fill — drawn on a
 * Canvas for full control and zero third-party chart deps.
 */
@Composable
fun ThetaTrendChart(
    values: List<Double>,
    modifier: Modifier = Modifier,
    height: Dp = 120.dp,
    color: Color = MaterialTheme.colorScheme.primary,
) {
    val reduced = rememberReducedMotion()
    val reveal by animateFloatAsState(
        targetValue = if (values.isEmpty()) 0f else 1f,
        animationSpec = if (reduced) Motion.effect() else Motion.emphasized(),
        label = "trendReveal",
    )
    Canvas(modifier = modifier.fillMaxWidth().height(height)) {
        if (values.size < 2) return@Canvas
        val minV = values.min()
        val maxV = values.max()
        val range = (maxV - minV).takeIf { it > 1e-6 } ?: 1.0
        val pad = 6f
        val w = size.width
        val h = size.height - pad * 2
        val stepX = w / (values.size - 1)

        fun pointAt(i: Int): Offset {
            val x = i * stepX
            val norm = ((values[i] - minV) / range).toFloat()
            val y = pad + (1f - norm) * h
            return Offset(x, y)
        }

        val count = (values.size * reveal).toInt().coerceAtLeast(2)
        val line = Path().apply {
            moveTo(pointAt(0).x, pointAt(0).y)
            for (i in 1 until count) lineTo(pointAt(i).x, pointAt(i).y)
        }
        val fill = Path().apply {
            addPath(line)
            lineTo((count - 1) * stepX, size.height)
            lineTo(0f, size.height)
            close()
        }
        drawPath(
            fill,
            brush = Brush.verticalGradient(listOf(color.copy(alpha = 0.22f), color.copy(alpha = 0f))),
        )
        drawPath(line, color = color, style = Stroke(width = 3f, cap = StrokeCap.Round))
        if (count >= 1) {
            val last = pointAt(count - 1)
            drawCircle(color, radius = 4.5f, center = last)
        }
    }
}

/** Daily activity columns (answers per day). */
@Composable
fun ActivityChart(
    counts: List<Int>,
    modifier: Modifier = Modifier,
    height: Dp = 90.dp,
    color: Color = MaterialTheme.colorScheme.primary,
) {
    val reduced = rememberReducedMotion()
    val reveal by animateFloatAsState(
        targetValue = if (counts.isEmpty()) 0f else 1f,
        animationSpec = if (reduced) Motion.effect() else Motion.emphasized(),
        label = "activityReveal",
    )
    Canvas(modifier = modifier.fillMaxWidth().height(height)) {
        if (counts.isEmpty()) return@Canvas
        val maxV = (counts.max().takeIf { it > 0 } ?: 1).toFloat()
        val n = counts.size
        val gap = 4f
        val barW = ((size.width - gap * (n - 1)) / n).coerceAtLeast(2f)
        counts.forEachIndexed { i, c ->
            val norm = (c / maxV) * reveal
            val barH = norm * size.height
            val x = i * (barW + gap)
            val y = size.height - barH
            drawRoundRect(
                color = if (c > 0) color else color.copy(alpha = 0.16f),
                topLeft = Offset(x, y),
                size = Size(barW, barH.coerceAtLeast(2f)),
                cornerRadius = androidx.compose.ui.geometry.CornerRadius(barW / 2.5f, barW / 2.5f),
            )
        }
    }
}

/** Stacked mastery distribution bar (beginner→advanced), color encodes level. */
@Composable
fun MasteryDistributionBar(
    segments: List<Pair<Color, Int>>,
    modifier: Modifier = Modifier,
    height: Dp = 12.dp,
) {
    val total = segments.sumOf { it.second }.takeIf { it > 0 } ?: 1
    Canvas(modifier = modifier.fillMaxWidth().height(height)) {
        var x = 0f
        val radius = size.height / 2f
        segments.forEach { (c, value) ->
            val segW = size.width * (value.toFloat() / total)
            if (segW > 0f) {
                drawRoundRect(
                    color = c,
                    topLeft = Offset(x, 0f),
                    size = Size(segW, size.height),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(radius, radius),
                )
            }
            x += segW
        }
    }
}
