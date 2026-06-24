package dev.getjanus.rono.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.getjanus.rono.core.network.ApiException
import dev.getjanus.rono.core.session.SessionManager
import dev.getjanus.rono.data.auth.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthFormState(
    val email: String = "",
    val password: String = "",
    val fullName: String = "",
    val submitting: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val sessionManager: SessionManager,
) : ViewModel() {

    private val _state = MutableStateFlow(AuthFormState())
    val state: StateFlow<AuthFormState> = _state.asStateFlow()

    fun onEmail(value: String) = _state.update { it.copy(email = value, error = null) }
    fun onPassword(value: String) = _state.update { it.copy(password = value, error = null) }
    fun onFullName(value: String) = _state.update { it.copy(fullName = value, error = null) }

    fun login() {
        val s = _state.value
        if (s.submitting) return
        _state.update { it.copy(submitting = true, error = null) }
        viewModelScope.launch {
            runCatching { authRepository.login(s.email, s.password) }
                .onSuccess { sessionManager.onAuthenticated(it) }
                .onFailure { handleError(it) }
        }
    }

    fun signup() {
        val s = _state.value
        if (s.submitting) return
        _state.update { it.copy(submitting = true, error = null) }
        viewModelScope.launch {
            runCatching { authRepository.signup(s.email, s.password, s.fullName) }
                .onSuccess { sessionManager.onAuthenticated(it) }
                .onFailure { handleError(it) }
        }
    }

    private fun handleError(t: Throwable) {
        val message = (t as? ApiException)?.detail ?: t.message
        _state.update { it.copy(submitting = false, error = message ?: "Authentication failed") }
    }
}
