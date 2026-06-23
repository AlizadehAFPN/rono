package dev.getjanus.synapse.core.designsystem.motion

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.ui.unit.IntOffset

/**
 * Shared motion vocabulary — Material 3 "expressive" spring feel: physical,
 * lively, never bouncy-to-the-point-of-toy. Respect reduced-motion at call
 * sites via [dev.getjanus.synapse.core.util.rememberReducedMotion].
 */
object Motion {
    /** Snappy press / selection feedback. */
    fun <T> snappy() = spring<T>(
        dampingRatio = Spring.DampingRatioNoBouncy,
        stiffness = Spring.StiffnessMediumLow,
    )

    /** Expressive spatial spring for entering content, rings, sheets. */
    fun <T> spatial() = spring<T>(
        dampingRatio = 0.78f,
        stiffness = Spring.StiffnessLow,
    )

    /** Effect spring for color/alpha — no overshoot. */
    fun <T> effect() = spring<T>(
        dampingRatio = Spring.DampingRatioNoBouncy,
        stiffness = Spring.StiffnessMedium,
    )

    val ringSpring = spring<Float>(dampingRatio = 0.82f, stiffness = Spring.StiffnessVeryLow)

    fun <T> emphasized() = tween<T>(durationMillis = 450)
    fun <T> standard() = tween<T>(durationMillis = 280)

    val slideSpring = spring<IntOffset>(
        dampingRatio = 0.85f,
        stiffness = Spring.StiffnessMediumLow,
    )
}
