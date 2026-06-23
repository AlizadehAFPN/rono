package dev.getjanus.synapse.core.network

import dev.getjanus.synapse.core.config.ApiEnvironment
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Holds the active [ApiEnvironment] so the dev/prod toggle in Settings takes
 * effect without rebuilding the OkHttp/Retrofit stack. Updated by a collector
 * watching the settings DataStore (see SessionManager).
 */
@Singleton
class ApiEnvironmentProvider @Inject constructor() {
    @Volatile
    var current: ApiEnvironment = ApiEnvironment.DEFAULT
}

/**
 * Rewrites each request's scheme/host/port to the active environment, keeping
 * the path (which already includes /api/v1). Retrofit's static base URL is just
 * a placeholder; this interceptor is the source of truth at call time.
 */
@Singleton
class HostSelectionInterceptor @Inject constructor(
    private val provider: ApiEnvironmentProvider,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val target = provider.current.baseUrl.toHttpUrlOrNull()
            ?: return chain.proceed(request)

        val newUrl = request.url.newBuilder()
            .scheme(target.scheme)
            .host(target.host)
            .port(target.port)
            .build()
        return chain.proceed(request.newBuilder().url(newUrl).build())
    }
}
