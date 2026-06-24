package dev.getjanus.rono.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import dev.getjanus.rono.core.datastore.AppLocale
import dev.getjanus.rono.core.designsystem.components.AppCard
import dev.getjanus.rono.core.designsystem.components.BrandMark
import dev.getjanus.rono.core.designsystem.components.Eyebrow
import dev.getjanus.rono.core.designsystem.theme.Spacing
import androidx.compose.foundation.layout.PaddingValues

/**
 * Shared header + scroll container for the auth screens. Mirrors the iOS
 * `AuthScaffold` so login / signup look identical across platforms: a soft brand
 * glow behind a centered brand mark, an uppercase tagline eyebrow, the
 * title/subtitle, and the form inside an elevated card. A language pill sits in
 * the top-right corner.
 */
@Composable
fun AuthScaffold(
    tagline: String,
    title: String,
    subtitle: String,
    currentLocale: AppLocale,
    onSetLocale: (AppLocale) -> Unit,
    content: @Composable () -> Unit,
) {
    Box(
        Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        // Soft brand glow behind the header.
        Box(
            Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp)
                .size(360.dp)
                .blur(120.dp)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.16f),
                            Color.Transparent,
                        ),
                    ),
                    shape = CircleShape,
                ),
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding()
                .verticalScroll(rememberScrollState())
                .imePadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Column(
                modifier = Modifier
                    .widthIn(max = 480.dp)
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.screen),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Spacer(Modifier.height(Spacing.md))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                    LanguagePill(currentLocale, onSetLocale)
                }

                Spacer(Modifier.height(Spacing.lg))
                BrandMark(size = 64.dp)
                Spacer(Modifier.height(Spacing.md))
                Eyebrow(tagline, color = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.height(Spacing.sm))
                Text(
                    title,
                    style = MaterialTheme.typography.headlineMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(Spacing.xs))
                Text(
                    subtitle,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                )

                Spacer(Modifier.height(Spacing.xl))
                AppCard(
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(Spacing.lg),
                ) { content() }
                Spacer(Modifier.height(Spacing.xl))
            }
        }
    }
}

/** Compact globe + locale-code pill that toggles the app language. */
@Composable
private fun LanguagePill(current: AppLocale, onSet: (AppLocale) -> Unit) {
    val next = if (current == AppLocale.TURKISH) AppLocale.ENGLISH else AppLocale.TURKISH
    val code = if (current == AppLocale.TURKISH) "TR" else "EN"
    Surface(
        onClick = { onSet(next) },
        shape = CircleShape,
        color = MaterialTheme.colorScheme.surfaceVariant,
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Icon(
                Icons.Outlined.Language,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.size(16.dp),
            )
            Text(
                code,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurface,
            )
        }
    }
}
