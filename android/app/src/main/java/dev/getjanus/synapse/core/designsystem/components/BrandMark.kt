package dev.getjanus.synapse.core.designsystem.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * The Synapse "hourglass synapse-graph" mark — 4 corner nodes + a centre hub,
 * joined by a top bar, a bottom bar and two crossing diagonals. Geometry is the
 * single source shared with web (logo.tsx) and iOS (BrandMark): corners at
 * 22/78, hub 50,50 on a 0–100 grid.
 */
@Composable
fun BrandMark(
    modifier: Modifier = Modifier,
    size: Dp = 28.dp,
    tint: Color = MaterialTheme.colorScheme.primary,
) {
    Canvas(modifier = modifier.size(size)) {
        val s = this.size.minDimension
        fun p(x: Float, y: Float) = Offset(x / 100f * s, y / 100f * s)
        val stroke = s * 0.09f
        val nodeR = s * 0.07f
        val hubR = s * 0.065f

        val edges = listOf(
            p(22f, 24f) to p(78f, 24f),
            p(22f, 76f) to p(78f, 76f),
            p(22f, 24f) to p(78f, 76f),
            p(78f, 24f) to p(22f, 76f),
        )
        edges.forEach { (a, b) ->
            drawLine(tint, a, b, strokeWidth = stroke, cap = StrokeCap.Round)
        }
        listOf(p(22f, 24f), p(78f, 24f), p(22f, 76f), p(78f, 76f)).forEach {
            drawCircle(tint, radius = nodeR, center = it)
        }
        drawCircle(tint, radius = hubR, center = p(50f, 50f))
    }
}
