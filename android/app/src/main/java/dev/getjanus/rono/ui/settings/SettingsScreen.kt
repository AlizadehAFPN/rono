package dev.getjanus.rono.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.rono.R
import dev.getjanus.rono.core.config.ApiEnvironment
import dev.getjanus.rono.core.datastore.AppLocale
import dev.getjanus.rono.core.datastore.ThemeMode
import dev.getjanus.rono.core.designsystem.components.AppCard
import dev.getjanus.rono.core.designsystem.components.Eyebrow
import dev.getjanus.rono.core.designsystem.theme.Spacing
import dev.getjanus.rono.core.designsystem.theme.rono

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onChangePassword: () -> Unit,
    onDevices: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel(),
) {
    val settings by viewModel.settings.collectAsStateWithLifecycle()
    val user by viewModel.user.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.settings_title)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.common_back)) } },
            )
        },
    ) { padding ->
        Column(
            Modifier.padding(padding).verticalScroll(rememberScrollState()).padding(horizontal = Spacing.screen),
            verticalArrangement = Arrangement.spacedBy(Spacing.gap),
        ) {
            Spacer(Modifier.height(Spacing.sm))

            Eyebrow(stringResource(R.string.settings_appearance))
            AppCard {
                Text(stringResource(R.string.settings_theme), style = MaterialTheme.typography.titleSmall)
                Spacer(Modifier.height(Spacing.sm))
                SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                    val modes = listOf(ThemeMode.LIGHT to R.string.settings_theme_light, ThemeMode.DARK to R.string.settings_theme_dark, ThemeMode.SYSTEM to R.string.settings_theme_system)
                    modes.forEachIndexed { i, (mode, res) ->
                        SegmentedButton(
                            selected = settings.themeMode == mode,
                            onClick = { viewModel.setTheme(mode) },
                            shape = SegmentedButtonDefaults.itemShape(i, modes.size),
                        ) { Text(stringResource(res)) }
                    }
                }
                Spacer(Modifier.height(Spacing.md))
                Text(stringResource(R.string.settings_language), style = MaterialTheme.typography.titleSmall)
                Spacer(Modifier.height(Spacing.sm))
                SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                    val locales = listOf(AppLocale.TURKISH to "Türkçe", AppLocale.ENGLISH to "English")
                    locales.forEachIndexed { i, (loc, label) ->
                        SegmentedButton(
                            selected = settings.locale == loc,
                            onClick = { viewModel.setLocale(loc) },
                            shape = SegmentedButtonDefaults.itemShape(i, locales.size),
                        ) { Text(label) }
                    }
                }
            }

            Eyebrow(stringResource(R.string.settings_security))
            AppCard {
                SettingsRow(stringResource(R.string.settings_change_password), onClick = onChangePassword)
                Spacer(Modifier.height(Spacing.sm))
                SettingsRow(stringResource(R.string.settings_devices), onClick = onDevices)
            }

            Eyebrow(stringResource(R.string.settings_account))
            AppCard {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(stringResource(R.string.settings_email), color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(user?.email ?: "", style = MaterialTheme.typography.bodyMedium)
                }
                Spacer(Modifier.height(Spacing.sm))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(stringResource(R.string.settings_timezone), color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(user?.timezone ?: "—", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.clickable { viewModel.syncTimezone() })
                }
            }

            Eyebrow(stringResource(R.string.settings_developer))
            AppCard {
                Text(stringResource(R.string.settings_backend), style = MaterialTheme.typography.titleSmall)
                Spacer(Modifier.height(Spacing.sm))
                SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth()) {
                    val envs = listOf(ApiEnvironment.PRODUCTION to R.string.settings_backend_prod, ApiEnvironment.DEVELOPMENT to R.string.settings_backend_dev)
                    envs.forEachIndexed { i, (env, res) ->
                        SegmentedButton(
                            selected = settings.environment == env,
                            onClick = { viewModel.setEnvironment(env) },
                            shape = SegmentedButtonDefaults.itemShape(i, envs.size),
                        ) { Text(stringResource(res)) }
                    }
                }
            }

            Spacer(Modifier.height(Spacing.sm))
            TextButton(onClick = viewModel::logout, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.settings_logout), color = MaterialTheme.rono.danger)
            }
            Spacer(Modifier.height(Spacing.lg))
        }
    }
}

@Composable
private fun SettingsRow(label: String, onClick: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().clickable { onClick() }.padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.bodyLarge)
        Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
