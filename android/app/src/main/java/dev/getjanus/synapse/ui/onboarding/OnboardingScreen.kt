package dev.getjanus.synapse.ui.onboarding

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import dev.getjanus.synapse.R
import dev.getjanus.synapse.core.datastore.AppLocale
import dev.getjanus.synapse.core.designsystem.components.BrandMark
import dev.getjanus.synapse.core.designsystem.components.PrimaryButton
import dev.getjanus.synapse.core.designsystem.theme.Spacing
import kotlinx.coroutines.launch

private data class Slide(val titleRes: Int, val bodyRes: Int)

private val slides = listOf(
    Slide(R.string.onboarding_1_title, R.string.onboarding_1_body),
    Slide(R.string.onboarding_2_title, R.string.onboarding_2_body),
    Slide(R.string.onboarding_3_title, R.string.onboarding_3_body),
)

@Composable
fun OnboardingScreen(
    currentLocale: AppLocale,
    onSetLocale: (AppLocale) -> Unit,
    onFinish: () -> Unit,
) {
    val pager = rememberPagerState(pageCount = { slides.size })
    val scope = rememberCoroutineScope()
    val isLast = pager.currentPage == slides.lastIndex

    Scaffold { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = Spacing.screen),
        ) {
            Row(
                Modifier.fillMaxWidth().padding(top = Spacing.sm),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                LanguagePill(currentLocale, onSetLocale)
                TextButton(onClick = onFinish) { Text(stringResource(R.string.common_skip)) }
            }

            HorizontalPager(state = pager, modifier = Modifier.weight(1f)) { page ->
                val slide = slides[page]
                Column(
                    Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    BrandMark(size = 72.dp)
                    Spacer(Modifier.height(Spacing.xl))
                    Text(
                        stringResource(slide.titleRes),
                        style = MaterialTheme.typography.headlineMedium,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(Spacing.gap))
                    Text(
                        stringResource(slide.bodyRes),
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                    )
                }
            }

            Row(
                Modifier.fillMaxWidth().padding(vertical = Spacing.md),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                repeat(slides.size) { i ->
                    val selected = pager.currentPage == i
                    val width by animateDpAsState(if (selected) 22.dp else 8.dp, label = "dotW")
                    val color by animateColorAsState(
                        if (selected) MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.outlineVariant,
                        label = "dotC",
                    )
                    Box(
                        Modifier
                            .padding(horizontal = 3.dp)
                            .height(8.dp)
                            .size(width = width, height = 8.dp)
                            .clip(CircleShape)
                            .background(color),
                    )
                }
            }

            PrimaryButton(
                text = stringResource(if (isLast) R.string.common_get_started else R.string.common_next),
                onClick = {
                    if (isLast) onFinish()
                    else scope.launch { pager.animateScrollToPage(pager.currentPage + 1) }
                },
            )
            Spacer(Modifier.height(Spacing.lg))
        }
    }
}

@Composable
private fun LanguagePill(current: AppLocale, onSet: (AppLocale) -> Unit) {
    val next = if (current == AppLocale.TURKISH) AppLocale.ENGLISH else AppLocale.TURKISH
    TextButton(onClick = { onSet(next) }) {
        Text(if (current == AppLocale.TURKISH) "TR" else "EN", style = MaterialTheme.typography.labelLarge)
    }
}
