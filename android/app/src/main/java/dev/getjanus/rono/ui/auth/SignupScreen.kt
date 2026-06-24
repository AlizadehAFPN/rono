package dev.getjanus.rono.ui.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MailOutline
import androidx.compose.material.icons.filled.PersonOutline
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import dev.getjanus.rono.R
import dev.getjanus.rono.core.datastore.AppLocale
import dev.getjanus.rono.core.designsystem.components.PrimaryButton
import dev.getjanus.rono.core.designsystem.components.RonoTextField
import dev.getjanus.rono.core.designsystem.theme.Spacing
import dev.getjanus.rono.core.util.Validation

@Composable
fun SignupScreen(
    onNavigateToLogin: () -> Unit,
    currentLocale: AppLocale,
    onSetLocale: (AppLocale) -> Unit,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var nameError by remember { mutableStateOf<String?>(null) }
    var emailError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }

    val invalidName = stringResource(R.string.auth_error_name)
    val invalidEmail = stringResource(R.string.auth_error_email)
    val shortPassword = stringResource(R.string.auth_error_password_short)
    val passwordRules = stringResource(R.string.auth_error_password_rules)

    AuthScaffold(
        tagline = stringResource(R.string.auth_tagline),
        title = stringResource(R.string.auth_signup_title),
        subtitle = stringResource(R.string.auth_signup_subtitle),
        currentLocale = currentLocale,
        onSetLocale = onSetLocale,
    ) {
        RonoTextField(
            value = state.fullName,
            onValueChange = viewModel::onFullName,
            label = stringResource(R.string.auth_full_name),
            leadingIcon = Icons.Filled.PersonOutline,
            error = nameError,
        )
        Spacer(Modifier.height(Spacing.gap))
        RonoTextField(
            value = state.email,
            onValueChange = viewModel::onEmail,
            label = stringResource(R.string.auth_email),
            leadingIcon = Icons.Filled.MailOutline,
            keyboardType = KeyboardType.Email,
            error = emailError,
        )
        Spacer(Modifier.height(Spacing.gap))
        RonoTextField(
            value = state.password,
            onValueChange = viewModel::onPassword,
            label = stringResource(R.string.auth_password),
            leadingIcon = Icons.Filled.Lock,
            isPassword = true,
            imeAction = ImeAction.Done,
            error = passwordError,
        )
        if (state.error != null) {
            Spacer(Modifier.height(Spacing.gap))
            Text(state.error!!, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.error)
        }
        Spacer(Modifier.height(Spacing.lg))
        PrimaryButton(
            text = stringResource(R.string.auth_sign_up),
            loading = state.submitting,
            onClick = {
                nameError = if (state.fullName.isNotBlank()) null else invalidName
                emailError = if (Validation.isEmailValid(state.email)) null else invalidEmail
                passwordError = when (Validation.passwordIssue(state.password)) {
                    Validation.PasswordIssue.TOO_SHORT -> shortPassword
                    Validation.PasswordIssue.RULES -> passwordRules
                    null -> null
                }
                if (nameError == null && emailError == null && passwordError == null) viewModel.signup()
            },
        )
        Spacer(Modifier.height(Spacing.sm))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
            Text(stringResource(R.string.auth_have_account), color = MaterialTheme.colorScheme.onSurfaceVariant)
            TextButton(onClick = onNavigateToLogin) { Text(stringResource(R.string.auth_sign_in)) }
        }
    }
}
