package dev.getjanus.synapse.core.util

import android.text.Spanned
import android.text.style.StyleSpan
import android.text.style.UnderlineSpan
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.core.text.HtmlCompat

/**
 * Convert lightweight HTML question content into a styled [AnnotatedString]
 * (bold / italic / underline). Falls back to plain text for anything else.
 */
@Composable
fun rememberHtmlText(html: String?): AnnotatedString = remember(html) {
    if (html.isNullOrBlank()) return@remember AnnotatedString("")
    val spanned: Spanned = HtmlCompat.fromHtml(html, HtmlCompat.FROM_HTML_MODE_COMPACT)
    buildAnnotatedString(spanned)
}

private fun buildAnnotatedString(spanned: Spanned): AnnotatedString {
    val text = spanned.toString().trimEnd()
    return androidx.compose.ui.text.buildAnnotatedString {
        append(text)
        spanned.getSpans(0, spanned.length, Any::class.java).forEach { span ->
            val start = spanned.getSpanStart(span).coerceIn(0, text.length)
            val end = spanned.getSpanEnd(span).coerceIn(0, text.length)
            if (start >= end) return@forEach
            when (span) {
                is StyleSpan -> when (span.style) {
                    android.graphics.Typeface.BOLD ->
                        addStyle(SpanStyle(fontWeight = FontWeight.SemiBold), start, end)
                    android.graphics.Typeface.ITALIC ->
                        addStyle(SpanStyle(fontStyle = FontStyle.Italic), start, end)
                    android.graphics.Typeface.BOLD_ITALIC ->
                        addStyle(SpanStyle(fontWeight = FontWeight.SemiBold, fontStyle = FontStyle.Italic), start, end)
                }
                is UnderlineSpan ->
                    addStyle(SpanStyle(textDecoration = TextDecoration.Underline), start, end)
            }
        }
    }
}
