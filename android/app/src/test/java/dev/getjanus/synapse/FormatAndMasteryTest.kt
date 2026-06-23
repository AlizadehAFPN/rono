package dev.getjanus.synapse

import dev.getjanus.synapse.core.util.formatClock
import dev.getjanus.synapse.core.util.formatPercent
import dev.getjanus.synapse.core.util.formatTheta
import dev.getjanus.synapse.domain.model.MasteryLevel
import org.junit.Assert.assertEquals
import org.junit.Test

class FormatAndMasteryTest {

    @Test
    fun theta() {
        assertEquals("0.45", formatTheta(0.45))
        assertEquals("-0.30", formatTheta(-0.3))
        assertEquals("+0.23", formatTheta(0.23, signed = true))
        assertEquals("—", formatTheta(null))
    }

    @Test
    fun percent() {
        assertEquals("82%", formatPercent(0.82))
        assertEquals("100%", formatPercent(1.0))
        assertEquals("—%", formatPercent(null))
    }

    @Test
    fun clock() {
        assertEquals("0:05", formatClock(5))
        assertEquals("12:05", formatClock(725))
        assertEquals("1:00:00", formatClock(3600))
    }

    @Test
    fun masteryBands() {
        assertEquals(MasteryLevel.NONE, MasteryLevel.fromTheta(null))
        assertEquals(MasteryLevel.BEGINNER, MasteryLevel.fromTheta(-1.0))
        assertEquals(MasteryLevel.DEVELOPING, MasteryLevel.fromTheta(0.0))
        assertEquals(MasteryLevel.PROFICIENT, MasteryLevel.fromTheta(1.0))
        assertEquals(MasteryLevel.ADVANCED, MasteryLevel.fromTheta(2.0))
        assertEquals(MasteryLevel.PROFICIENT, MasteryLevel.fromApi("proficient"))
        assertEquals(MasteryLevel.NONE, MasteryLevel.fromApi("unknown"))
    }
}
