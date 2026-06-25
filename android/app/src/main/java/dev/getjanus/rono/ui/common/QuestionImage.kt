package dev.getjanus.rono.ui.common

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage

/**
 * Optional per-question image (authored on web/PWA), shown under the stem.
 * [url] must already be absolute — resolve relative paths via MediaUrlResolver
 * in the ViewModel before passing it here. No-op when null/blank.
 */
@Composable
fun QuestionImage(url: String?, modifier: Modifier = Modifier) {
    if (url.isNullOrBlank()) return
    AsyncImage(
        model = url,
        contentDescription = null,
        contentScale = ContentScale.Fit,
        modifier = modifier
            .padding(top = 12.dp)
            .fillMaxWidth()
            .heightIn(max = 240.dp)
            .clip(RoundedCornerShape(12.dp)),
    )
}
