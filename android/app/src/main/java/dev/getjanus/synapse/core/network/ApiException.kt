package dev.getjanus.synapse.core.network

import kotlinx.serialization.Serializable
import retrofit2.HttpException
import java.io.IOException

@Serializable
private data class ErrorBody(val detail: String? = null)

/** Normalized API failure with the server's human-readable detail when present. */
class ApiException(
    val status: Int,
    val detail: String?,
    cause: Throwable? = null,
) : Exception(detail ?: "HTTP $status", cause) {
    val isUnauthorized: Boolean get() = status == 401
    val isNetwork: Boolean get() = status == 0
}

/** Map any thrown error from a Retrofit suspend call into an [ApiException]. */
fun Throwable.toApiException(): ApiException = when (this) {
    is ApiException -> this
    is HttpException -> {
        val raw = runCatching { response()?.errorBody()?.string() }.getOrNull()
        val detail = raw?.let {
            runCatching { SynapseJson.decodeFromString<ErrorBody>(it).detail }.getOrNull()
        }
        ApiException(code(), detail, this)
    }
    is IOException -> ApiException(0, "Network error. Check your connection.", this)
    else -> ApiException(-1, message, this)
}

/** Run a suspend API call, normalizing failures to [ApiException]. */
suspend fun <T> apiCall(block: suspend () -> T): T =
    try {
        block()
    } catch (t: Throwable) {
        throw t.toApiException()
    }
