package dev.getjanus.rono.ui.profile

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.rono.R
import dev.getjanus.rono.core.designsystem.components.AppCard
import dev.getjanus.rono.core.designsystem.components.Eyebrow
import dev.getjanus.rono.core.designsystem.components.Pill
import dev.getjanus.rono.core.designsystem.components.PrimaryButton
import dev.getjanus.rono.core.designsystem.gamification.MetricBlock
import dev.getjanus.rono.core.designsystem.theme.Spacing
import dev.getjanus.rono.core.designsystem.theme.rono
import dev.getjanus.rono.core.util.formatPercent
import dev.getjanus.rono.core.util.readinessPercent
import dev.getjanus.rono.domain.model.Role
import dev.getjanus.rono.ui.common.Avatar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    contentPadding: PaddingValues,
    onOpenSettings: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val user by viewModel.user.collectAsStateWithLifecycle()
    val saving by viewModel.saving.collectAsStateWithLifecycle()
    val stats by viewModel.stats.collectAsStateWithLifecycle()
    val context = LocalContext.current

    var name by remember(user?.id) { mutableStateOf(user?.fullName ?: "") }
    LaunchedEffect(user?.fullName) { user?.fullName?.let { name = it } }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) {
            runCatching {
                val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return@runCatching
                val mime = context.contentResolver.getType(uri) ?: "image/jpeg"
                val ext = if (mime.contains("png")) "png" else "jpg"
                viewModel.uploadAvatar(bytes, mime, "avatar.$ext")
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.profile_title)) },
                actions = {
                    IconButton(onClick = onOpenSettings) { Icon(Icons.Filled.Settings, contentDescription = stringResource(R.string.settings_title)) }
                },
            )
        },
    ) { padding ->
        Column(
            Modifier
                .padding(padding)
                .padding(contentPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = Spacing.screen),
            verticalArrangement = Arrangement.spacedBy(Spacing.gap),
        ) {
            Spacer(Modifier.height(Spacing.sm))
            Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(contentAlignment = Alignment.Center) {
                    Avatar(imageUrl = viewModel.avatarUrl(user), initials = user?.initials ?: "?", size = 96.dp)
                    if (saving) CircularProgressIndicator(Modifier.width(28.dp), strokeWidth = 2.dp)
                }
                Spacer(Modifier.height(Spacing.sm))
                Row {
                    TextButton(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
                        Text(stringResource(R.string.profile_change_photo))
                    }
                    if (user?.avatarUrl != null) {
                        TextButton(onClick = viewModel::removeAvatar) { Text(stringResource(R.string.profile_remove_photo)) }
                    }
                }
            }

            AppCard {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text(stringResource(R.string.profile_name)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.medium,
                )
                Spacer(Modifier.height(Spacing.sm))
                PrimaryButton(text = stringResource(R.string.common_save), onClick = { viewModel.saveName(name) }, loading = saving, enabled = name.isNotBlank() && name != user?.fullName)
            }

            AppCard {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text(user?.email ?: "", style = MaterialTheme.typography.bodyMedium)
                        Spacer(Modifier.height(4.dp))
                        Pill(
                            text = if (user?.emailVerified == true) stringResource(R.string.profile_verified) else stringResource(R.string.profile_unverified),
                            color = if (user?.emailVerified == true) MaterialTheme.rono.success else MaterialTheme.rono.warning,
                        )
                    }
                    Pill(text = roleLabel(user?.role ?: Role.STUDENT), color = MaterialTheme.colorScheme.primary)
                }
            }

            AppCard {
                Eyebrow(stringResource(R.string.profile_learning))
                Spacer(Modifier.height(Spacing.sm))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    MetricBlock(stringResource(R.string.dash_ability), readinessPercent(stats?.globalTheta))
                    MetricBlock(stringResource(R.string.dash_accuracy), formatPercent(stats?.accuracy), color = MaterialTheme.rono.success)
                    MetricBlock(stringResource(R.string.dash_answered), (stats?.totalResponses ?: 0).toString())
                    MetricBlock(stringResource(R.string.profile_topics), (stats?.topics?.size ?: 0).toString())
                }
            }
            Spacer(Modifier.height(Spacing.lg))
        }
    }
}

@Composable
private fun roleLabel(role: Role): String = stringResource(
    when {
        role.gte(Role.INSTITUTION_ADMIN) -> R.string.role_admin
        role.gte(Role.INSTRUCTOR) -> R.string.role_instructor
        else -> R.string.role_student
    },
)
