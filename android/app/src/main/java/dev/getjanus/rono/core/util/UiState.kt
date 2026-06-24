package dev.getjanus.rono.core.util

/** Generic screen state for a single async resource. */
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Error(val message: String) : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
}

inline val <T> UiState<T>.dataOrNull: T?
    get() = (this as? UiState.Success)?.data
