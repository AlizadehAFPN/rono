package dev.getjanus.synapse.ui.dashboard

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.synapse.R
import dev.getjanus.synapse.core.designsystem.components.AppCard
import dev.getjanus.synapse.core.designsystem.components.Eyebrow
import dev.getjanus.synapse.core.designsystem.gamification.ProgressRing
import dev.getjanus.synapse.core.designsystem.gamification.StreakBadge
import dev.getjanus.synapse.core.designsystem.gamification.masteryColor
import dev.getjanus.synapse.core.designsystem.theme.Spacing
import dev.getjanus.synapse.core.util.UiState
import dev.getjanus.synapse.core.util.formatPercent
import dev.getjanus.synapse.core.util.formatTheta
import dev.getjanus.synapse.data.progress.DashboardDto
import dev.getjanus.synapse.domain.model.MasteryLevel
import dev.getjanus.synapse.ui.common.ErrorState
import dev.getjanus.synapse.ui.common.LoadingState
import dev.getjanus.synapse.ui.common.masteryLabel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onStartStudy: () -> Unit,
    onReviewNow: () -> Unit,
    onOpenProgress: () -> Unit,
    contentPadding: androidx.compose.foundation.layout.PaddingValues,
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val refreshing by viewModel.refreshing.collectAsStateWithLifecycle()

    when (val s = state) {
        is UiState.Loading -> LoadingState(Modifier.padding(contentPadding))
        is UiState.Error -> ErrorState(s.message, onRetry = viewModel::load, modifier = Modifier.padding(contentPadding))
        is UiState.Success -> PullToRefreshBox(
            isRefreshing = refreshing,
            onRefresh = viewModel::refresh,
            modifier = Modifier.padding(contentPadding),
        ) {
            DashboardContent(
                data = s.data,
                userName = viewModel.user?.displayName ?: "",
                onReviewNow = onReviewNow,
                onOpenProgress = onOpenProgress,
            )
        }
    }
}

@Composable
private fun DashboardContent(
    data: DashboardDto,
    userName: String,
    onReviewNow: () -> Unit,
    onOpenProgress: () -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxWidth(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(Spacing.screen, Spacing.md, Spacing.screen, Spacing.xxl),
        verticalArrangement = Arrangement.spacedBy(Spacing.gap),
    ) {
        // Greeting + streak
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(
                        if (userName.isBlank()) stringResource(R.string.dash_subtitle)
                        else stringResource(R.string.dash_greeting, userName),
                        style = MaterialTheme.typography.headlineMedium,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(stringResource(R.string.dash_subtitle), style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                if (data.streakDays > 0) StreakBadge(days = data.streakDays)
            }
        }

        // Ability hero — compact ring + level, then a full-width stats row.
        item { AbilityHeroCard(data) }

        // The two clear, prominent destinations.
        item {
            DestinationCard(
                icon = Icons.Filled.CalendarMonth,
                title = stringResource(R.string.dash_daily_study),
                subtitle = if (data.dueNow > 0) "${data.dueNow} ${stringResource(R.string.dash_due_now)}"
                           else stringResource(R.string.dash_all_caught_up),
                badge = data.dueNow.takeIf { it > 0 },
                primary = true,
                onClick = onReviewNow,
            )
        }
        item {
            DestinationCard(
                icon = Icons.AutoMirrored.Filled.TrendingUp,
                title = stringResource(R.string.dash_progress_title),
                subtitle = stringResource(R.string.dash_progress_sub),
                badge = null,
                primary = false,
                onClick = onOpenProgress,
            )
        }
    }
}

@Composable
private fun AbilityHeroCard(data: DashboardDto) {
    val level = MasteryLevel.fromApi(data.ability.level)
    val ringColor = masteryColor(level)
    val theta = data.ability.theta ?: 0.0
    val progress = ((theta + 3.0) / 6.0).toFloat().coerceIn(0.06f, 1f)
    AppCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            ProgressRing(progress = progress, size = 92.dp, stroke = 9.dp, color = ringColor) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("θ", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        formatTheta(data.ability.theta),
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    )
                }
            }
            Spacer(Modifier.width(Spacing.md))
            Column(Modifier.weight(1f)) {
                Eyebrow(stringResource(R.string.dash_ability))
                Spacer(Modifier.height(2.dp))
                Text(
                    masteryLabel(level),
                    style = MaterialTheme.typography.titleLarge,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
        Spacer(Modifier.height(Spacing.md))
        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        Spacer(Modifier.height(Spacing.md))
        Row(Modifier.fillMaxWidth()) {
            HeroStat(formatPercent(data.accuracy), stringResource(R.string.dash_accuracy))
            HeroStat(data.answered.toString(), stringResource(R.string.dash_answered))
            HeroStat(data.streakDays.toString(), stringResource(R.string.dash_streak_unit))
        }
    }
}

@Composable
private fun RowScope.HeroStat(value: String, label: String) {
    Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            value,
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            maxLines = 1,
        )
        Text(
            label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

/**
 * A big, unmistakable home destination button. [primary] paints the brand
 * surface (Daily Study — the everyday action); the other stays a calm card
 * (Progress). Mirrors the web/iOS DestinationCard.
 */
@Composable
private fun DestinationCard(
    icon: ImageVector,
    title: String,
    subtitle: String,
    badge: Int?,
    primary: Boolean,
    onClick: () -> Unit,
) {
    val container = if (primary) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
    val onContainer = if (primary) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
    val subColor = if (primary) MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.85f) else MaterialTheme.colorScheme.onSurfaceVariant
    val chipBg = if (primary) MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.16f) else MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
    val chipFg = if (primary) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.primary

    Surface(
        onClick = onClick,
        shape = MaterialTheme.shapes.large,
        color = container,
        border = if (primary) null else BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(Spacing.md),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.gap),
        ) {
            Box(
                modifier = Modifier.size(40.dp).background(chipBg, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, contentDescription = null, tint = chipFg, modifier = Modifier.size(20.dp))
            }
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(title, style = MaterialTheme.typography.titleMedium, color = onContainer, maxLines = 1)
                    if (badge != null) {
                        Box(
                            modifier = Modifier
                                .background(
                                    if (primary) MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.22f)
                                    else MaterialTheme.colorScheme.primary.copy(alpha = 0.14f),
                                    CircleShape,
                                )
                                .padding(horizontal = 7.dp, vertical = 1.dp),
                        ) {
                            Text(
                                badge.toString(),
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                color = if (primary) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.primary,
                            )
                        }
                    }
                }
                Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = subColor, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = subColor, modifier = Modifier.size(20.dp))
        }
    }
}
