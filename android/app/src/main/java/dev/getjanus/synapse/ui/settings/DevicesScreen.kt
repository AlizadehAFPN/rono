package dev.getjanus.synapse.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.synapse.R
import dev.getjanus.synapse.core.designsystem.components.AppCard
import dev.getjanus.synapse.core.designsystem.components.Pill
import dev.getjanus.synapse.core.designsystem.theme.Spacing
import dev.getjanus.synapse.core.designsystem.theme.synapse
import dev.getjanus.synapse.core.util.UiState
import dev.getjanus.synapse.data.auth.SessionDto
import dev.getjanus.synapse.ui.common.ErrorState
import dev.getjanus.synapse.ui.common.LoadingState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DevicesScreen(
    onBack: () -> Unit,
    viewModel: DevicesViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.devices_title)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.common_back)) } },
            )
        },
    ) { padding ->
        when (val s = state) {
            is UiState.Loading -> LoadingState(Modifier.padding(padding))
            is UiState.Error -> ErrorState(s.message, onRetry = viewModel::load, modifier = Modifier.padding(padding))
            is UiState.Success -> LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(Spacing.screen, Spacing.md, Spacing.screen, Spacing.xxl),
                verticalArrangement = Arrangement.spacedBy(Spacing.gap),
            ) {
                items(s.data, key = { it.id }) { session -> DeviceRow(session, onRevoke = { viewModel.revoke(session.id) }) }
                if (s.data.any { !it.current }) {
                    item {
                        TextButton(onClick = viewModel::revokeOthers, modifier = Modifier.fillMaxWidth()) {
                            Text(stringResource(R.string.devices_revoke_others), color = MaterialTheme.synapse.danger)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DeviceRow(session: SessionDto, onRevoke: () -> Unit) {
    AppCard(modifier = Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(
                    session.userAgent ?: session.deviceType ?: stringResource(R.string.devices_title),
                    style = MaterialTheme.typography.titleSmall,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(4.dp))
                if (session.current) {
                    Pill(text = stringResource(R.string.devices_current), color = MaterialTheme.synapse.success)
                } else if (session.ipAddress != null) {
                    Text(session.ipAddress, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            if (!session.current) {
                TextButton(onClick = onRevoke) { Text(stringResource(R.string.devices_revoke)) }
            }
        }
    }
}
