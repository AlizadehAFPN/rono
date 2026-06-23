package dev.getjanus.synapse.ui.settings

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.synapse.R
import dev.getjanus.synapse.core.designsystem.components.PrimaryButton
import dev.getjanus.synapse.core.designsystem.components.SynapseTextField
import dev.getjanus.synapse.core.designsystem.theme.Spacing

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChangePasswordScreen(
    onBack: () -> Unit,
    viewModel: ChangePasswordViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    LaunchedEffect(state.done) { if (state.done) onBack() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.change_password_title)) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.common_back)) } },
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = Spacing.screen)) {
            Spacer(Modifier.height(Spacing.md))
            SynapseTextField(
                value = state.current,
                onValueChange = viewModel::onCurrent,
                label = stringResource(R.string.change_password_current),
                leadingIcon = Icons.Filled.Lock,
                isPassword = true,
            )
            Spacer(Modifier.height(Spacing.gap))
            SynapseTextField(
                value = state.new,
                onValueChange = viewModel::onNew,
                label = stringResource(R.string.change_password_new),
                leadingIcon = Icons.Filled.Lock,
                isPassword = true,
                imeAction = ImeAction.Done,
                error = state.error,
            )
            Spacer(Modifier.height(Spacing.lg))
            PrimaryButton(
                text = stringResource(R.string.change_password_save),
                onClick = viewModel::submit,
                loading = state.submitting,
                enabled = state.current.isNotBlank() && state.new.length >= 8,
            )
        }
    }
}
