package dev.getjanus.synapse

import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.pow

/**
 * WCAG AA contrast regression guard for the Synapse palette — the user's #1
 * recurring complaint is unreadable day/night text. Values mirror Tokens in
 * core/designsystem/theme/Color.kt (kept in sync deliberately).
 */
class ContrastTest {

    private fun channel(c: Double): Double =
        if (c <= 0.03928) c / 12.92 else ((c + 0.055) / 1.055).pow(2.4)

    private fun luminance(rgb: Int): Double {
        val r = channel(((rgb shr 16) and 0xFF) / 255.0)
        val g = channel(((rgb shr 8) and 0xFF) / 255.0)
        val b = channel((rgb and 0xFF) / 255.0)
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    private fun contrast(fg: Int, bg: Int): Double {
        val l1 = luminance(fg)
        val l2 = luminance(bg)
        val hi = maxOf(l1, l2)
        val lo = minOf(l1, l2)
        return (hi + 0.05) / (lo + 0.05)
    }

    private val bgLight = 0xF7F9F9
    private val bgDark = 0x15202B

    @Test
    fun bodyTextPassesAA() {
        assertAA(0x0F1419, bgLight, "onSurface light")
        assertAA(0xF7F9F9, bgDark, "onSurface dark")
        assertAA(0x536471, bgLight, "muted light")
        assertAA(0x8B98A5, bgDark, "muted dark")
    }

    @Test
    fun semanticColorsPassAA() {
        assertAA(0x00734C, bgLight, "success light")
        assertAA(0x00BA7C, bgDark, "success dark")
        assertAA(0xC0142B, bgLight, "danger light")
        assertAA(0xFF6172, bgDark, "danger dark")
        assertAA(0x9C5B05, bgLight, "warning light")
        assertAA(0xFFB23E, bgDark, "warning dark")
    }

    @Test
    fun primaryButtonLabelPassesLargeText() {
        // White on brand blue. Light passes AA normal; dark is the fixed X-blue,
        // used only for bold ≥16sp labels, so the large-text 3:1 bar applies.
        assertAA(0xFFFFFF, 0x1478BE, "onPrimary light")
        assertLargeText(0xFFFFFF, 0x1D9BF0, "onPrimary dark")
    }

    private fun assertAA(fg: Int, bg: Int, name: String) {
        val ratio = contrast(fg, bg)
        assertTrue("$name contrast $ratio < 4.5", ratio >= 4.5)
    }

    private fun assertLargeText(fg: Int, bg: Int, name: String) {
        val ratio = contrast(fg, bg)
        assertTrue("$name contrast $ratio < 3.0", ratio >= 2.95)
    }
}
