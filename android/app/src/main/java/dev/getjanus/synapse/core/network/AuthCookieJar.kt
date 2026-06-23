package dev.getjanus.synapse.core.network

import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import javax.inject.Inject
import javax.inject.Singleton

/** OkHttp cookie jar bridging to the persistent [CookieStore]. */
@Singleton
class AuthCookieJar @Inject constructor(
    private val store: CookieStore,
) : CookieJar {

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        store.save(url, cookies)
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> = store.load(url)
}
