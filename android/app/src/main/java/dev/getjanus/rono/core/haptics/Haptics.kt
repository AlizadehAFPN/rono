package dev.getjanus.rono.core.haptics

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Lightweight, tasteful haptics for key study moments (mirrors iOS Haptics:
 * tap / select / success / error). Uses predefined effects on API 29+, with a
 * one-shot fallback for 26–28.
 */
@Singleton
class Haptics @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val vibrator: Vibrator? by lazy {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(VibratorManager::class.java)
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    // EFFECT_* constants resolve to plain ints; createPredefined (the actual
    // API-29 call) is guarded by SDK_INT below, so referencing them on 26–28 is
    // safe — they only reach the predefined path on Q+.
    @SuppressLint("InlinedApi")
    fun tap() = predefinedOrOneShot(VibrationEffect.EFFECT_TICK, 8)

    @SuppressLint("InlinedApi")
    fun select() = predefinedOrOneShot(VibrationEffect.EFFECT_CLICK, 12)

    fun success() = doubleTap()

    @SuppressLint("InlinedApi")
    fun error() = predefinedOrOneShot(VibrationEffect.EFFECT_HEAVY_CLICK, 40)

    private fun predefinedOrOneShot(effectId: Int, fallbackMs: Long) {
        val v = vibrator ?: return
        if (!v.hasVibrator()) return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            runCatching { v.vibrate(VibrationEffect.createPredefined(effectId)) }
                .onFailure { oneShot(v, fallbackMs) }
        } else {
            oneShot(v, fallbackMs)
        }
    }

    private fun doubleTap() {
        val v = vibrator ?: return
        if (!v.hasVibrator()) return
        val timings = longArrayOf(0, 18, 60, 28)
        val amplitudes = intArrayOf(0, 140, 0, 200)
        runCatching { v.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1)) }
            .onFailure { oneShot(v, 30) }
    }

    private fun oneShot(v: Vibrator, ms: Long) {
        runCatching {
            v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE))
        }
    }
}
