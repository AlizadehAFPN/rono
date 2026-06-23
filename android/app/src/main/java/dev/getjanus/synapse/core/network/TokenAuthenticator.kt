package dev.getjanus.synapse.core.network

import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Provider
import javax.inject.Singleton

/**
 * Coalesced 401 → POST /auth/refresh → retry-once. Mirrors the web/iOS clients:
 * the refresh request reuses the shared cookie jar so the refresh_token cookie
 * is sent and the rotated access/refresh cookies are stored. On refresh failure
 * the session is signalled expired and the original request is not retried.
 */
@Singleton
class TokenAuthenticator @Inject constructor(
    private val environment: ApiEnvironmentProvider,
    private val cookieStore: CookieStore,
    private val sessionEvents: SessionEvents,
    // Lazy to avoid a DI cycle: the refresh client shares the cookie jar but not
    // this authenticator.
    @Named("refresh") private val refreshClient: Provider<OkHttpClient>,
) : okhttp3.Authenticator {

    private val lock = Any()

    override fun authenticate(route: Route?, response: Response): Request? {
        val failedUrl = response.request.url.encodedPath
        // Never try to refresh the auth endpoints themselves.
        if (failedUrl.endsWith("/auth/refresh") ||
            failedUrl.endsWith("/auth/login") ||
            failedUrl.endsWith("/auth/logout")
        ) {
            if (failedUrl.endsWith("/auth/refresh")) sessionEvents.notifyExpired()
            return null
        }
        // Give up after one retry.
        if (priorResponseCount(response) >= 2) return null

        synchronized(lock) {
            val tokenBefore = currentAccessToken()
            // Another thread may have already refreshed while we waited on the lock.
            if (tokenBefore != failedRequestToken(response)) {
                return response.request.newBuilder().build()
            }
            val refreshed = runCatching { performRefresh() }.getOrDefault(false)
            return if (refreshed) {
                response.request.newBuilder().build()
            } else {
                sessionEvents.notifyExpired()
                null
            }
        }
    }

    private fun performRefresh(): Boolean {
        val url = (environment.current.apiBaseUrl + "/auth/refresh").toHttpUrlOrNull() ?: return false
        val request = Request.Builder()
            .url(url)
            .post(ByteArray(0).toRequestBody(null))
            .build()
        refreshClient.get().newCall(request).execute().use { resp ->
            return resp.isSuccessful
        }
    }

    private fun currentAccessToken(): String? {
        val url = environment.current.baseUrl.toHttpUrlOrNull() ?: return null
        return cookieStore.load(url).firstOrNull { it.name == "access_token" }?.value
    }

    // The token attached to the failed request, used to detect concurrent refresh.
    private fun failedRequestToken(response: Response): String? =
        response.request.header("Cookie")
            ?.split(";")
            ?.map { it.trim() }
            ?.firstOrNull { it.startsWith("access_token=") }
            ?.substringAfter("access_token=")

    private fun priorResponseCount(response: Response): Int {
        var count = 1
        var prior = response.priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }
}
