package dev.getjanus.rono.core.util

import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale
import kotlin.math.abs
import kotlin.math.roundToInt

/** Ability θ, e.g. "0.45" or "+0.23" (signed). Internal/debug only — never shown
 *  to the user; the UI displays [readinessPercent] instead. */
fun formatTheta(theta: Double?, signed: Boolean = false): String {
    if (theta == null) return "—"
    val v = (theta * 100).roundToInt() / 100.0
    val s = String.format(Locale.US, "%.2f", abs(v))
    return when {
        !signed -> if (v < 0) "-$s" else s
        v > 0 -> "+$s"
        v < 0 -> "-$s"
        else -> "0.00"
    }
}

/** Plain readiness % shown to users — maps the skill estimate (~[-3, 3]) to
 *  0–100% so no raw figure or technical symbol ever appears. e.g. "65%". */
fun readinessPercent(theta: Double?): String {
    if (theta == null) return "—"
    return "${(((theta + 3) / 6).coerceIn(0.0, 1.0) * 100).roundToInt()}%"
}

/** Signed readiness change in points, e.g. "+8" / "-3". */
fun readinessDelta(deltaTheta: Double?): String {
    if (deltaTheta == null) return "—"
    val pts = (deltaTheta / 6 * 100).roundToInt()
    return if (pts >= 0) "+$pts" else "$pts"
}

/** Accuracy fraction (0..1) → integer percent, e.g. "82%". */
fun formatPercent(fraction: Double?): String =
    if (fraction == null) "—%" else "${(fraction * 100).roundToInt()}%"

/** Seconds → "12:05" mm:ss (or "1:02:05" with hours). */
fun formatClock(totalSeconds: Long): String {
    val s = totalSeconds.coerceAtLeast(0)
    val h = s / 3600
    val m = (s % 3600) / 60
    val sec = s % 60
    return if (h > 0) String.format(Locale.US, "%d:%02d:%02d", h, m, sec)
    else String.format(Locale.US, "%d:%02d", m, sec)
}

private val dueFormatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM)

/** FSRS due date → relative-ish label ("today", "tomorrow", "in 7 days", date). */
fun formatDueDate(due: Instant?, now: Instant = Instant.now()): String {
    if (due == null) return "—"
    val days = Duration.between(now, due).toDays()
    return when {
        days <= 0 -> "today"
        days == 1L -> "tomorrow"
        days < 21 -> "in $days days"
        else -> due.atZone(ZoneId.systemDefault()).toLocalDate().format(dueFormatter)
    }
}
