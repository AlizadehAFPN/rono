package dev.getjanus.synapse.core.network

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import okhttp3.Cookie
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import javax.inject.Inject
import javax.inject.Singleton

@Serializable
private data class StoredCookie(val originUrl: String, val setCookie: String)

/**
 * Synchronous, app-private persistence for auth cookies (access_token path=/,
 * refresh_token path=/api/v1/auth). Backed by SharedPreferences for the
 * synchronous reads an OkHttp [okhttp3.CookieJar] needs; the app sandbox keeps
 * the tokens private. Mirrors the iOS Keychain CookieJar role.
 */
@Singleton
class CookieStore @Inject constructor(
    @ApplicationContext context: Context,
) {
    private val prefs = context.getSharedPreferences("synapse_cookies", Context.MODE_PRIVATE)
    private val lock = Any()
    private val cookies = mutableListOf<Cookie>()

    init {
        synchronized(lock) { cookies.addAll(loadPersisted()) }
    }

    fun save(url: HttpUrl, newCookies: List<Cookie>) {
        synchronized(lock) {
            newCookies.forEach { cookie ->
                cookies.removeAll { it.name == cookie.name && it.domain == cookie.domain && it.path == cookie.path }
                val expired = cookie.expiresAt < System.currentTimeMillis()
                if (!expired) cookies.add(cookie)
            }
            persist()
        }
    }

    fun load(url: HttpUrl): List<Cookie> = synchronized(lock) {
        val now = System.currentTimeMillis()
        cookies.removeAll { it.expiresAt < now }
        cookies.filter { it.matches(url) }
    }

    fun hasSession(): Boolean = synchronized(lock) {
        cookies.any { it.name == "access_token" || it.name == "refresh_token" }
    }

    fun clear() = synchronized(lock) {
        cookies.clear()
        prefs.edit().clear().apply()
    }

    private fun persist() {
        val stored = cookies
            .filter { it.persistent }
            .map { StoredCookie(originUrlFor(it), it.toString()) }
        prefs.edit().putString(KEY, SynapseJson.encodeToString(ListSerializer(StoredCookie.serializer()), stored)).apply()
    }

    private fun loadPersisted(): List<Cookie> {
        val raw = prefs.getString(KEY, null) ?: return emptyList()
        val stored = runCatching {
            SynapseJson.decodeFromString(ListSerializer(StoredCookie.serializer()), raw)
        }.getOrNull() ?: return emptyList()
        val now = System.currentTimeMillis()
        return stored.mapNotNull { sc ->
            val url = sc.originUrl.toHttpUrlOrNull() ?: return@mapNotNull null
            Cookie.parse(url, sc.setCookie)
        }.filter { it.expiresAt >= now }
    }

    private fun originUrlFor(cookie: Cookie): String {
        val scheme = if (cookie.secure) "https" else "http"
        return "$scheme://${cookie.domain}${cookie.path}"
    }

    private companion object {
        const val KEY = "cookies_v1"
    }
}
