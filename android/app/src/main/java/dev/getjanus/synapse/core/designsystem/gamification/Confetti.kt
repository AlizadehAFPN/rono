package dev.getjanus.synapse.core.designsystem.gamification

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.rotate
import dev.getjanus.synapse.core.designsystem.theme.synapse
import dev.getjanus.synapse.core.util.rememberReducedMotion
import kotlin.random.Random

private data class Confetto(
    val xFraction: Float,
    val startYFraction: Float,
    val drift: Float,
    val rotation: Float,
    val rotationSpeed: Float,
    val sizePx: Float,
    val colorIndex: Int,
)

/**
 * One-shot celebratory confetti burst drawn on a Canvas overlay. Skipped when
 * system animations are off. Tasteful (premium, not arcade) — short fall, soft
 * brand palette, auto-clears once the fall completes.
 */
@Composable
fun Confetti(
    play: Boolean,
    modifier: Modifier = Modifier,
    pieceCount: Int = 70,
    durationMillis: Int = 1800,
) {
    if (rememberReducedMotion()) return

    val palette = MaterialTheme.synapse.chart
    val pieces = remember(pieceCount) {
        List(pieceCount) {
            Confetto(
                xFraction = Random.nextFloat(),
                startYFraction = -Random.nextFloat() * 0.3f,
                drift = (Random.nextFloat() - 0.5f) * 0.4f,
                rotation = Random.nextFloat() * 360f,
                rotationSpeed = (Random.nextFloat() - 0.5f) * 720f,
                sizePx = 8f + Random.nextFloat() * 8f,
                colorIndex = Random.nextInt(palette.size),
            )
        }
    }
    val progress = remember { Animatable(0f) }

    LaunchedEffect(play) {
        if (play) {
            progress.snapTo(0f)
            progress.animateTo(1f, tween(durationMillis, easing = LinearEasing))
        }
    }

    val t = progress.value
    if (t <= 0f || t >= 1f) return

    Canvas(modifier = modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height
        pieces.forEach { c ->
            val x = (c.xFraction + c.drift * t) * w
            val y = (c.startYFraction + t * 1.25f) * h
            if (y < -c.sizePx || y > h + c.sizePx) return@forEach
            val alpha = (1f - t).coerceIn(0f, 1f)
            rotate(degrees = c.rotation + c.rotationSpeed * t, pivot = Offset(x, y)) {
                drawRect(
                    color = palette[c.colorIndex].copy(alpha = alpha),
                    topLeft = Offset(x - c.sizePx / 2, y - c.sizePx / 2),
                    size = Size(c.sizePx, c.sizePx * 0.5f),
                )
            }
        }
    }
}
