package dev.getjanus.synapse.core.config

/**
 * Backend environment. Default = production (the WEB origin — Next.js proxies
 * the api path prefix to the backend; the api subdomain is not publicly
 * resolvable). Dev points at the host machine reachable from the emulator
 * (10.0.2.2).
 */
enum class ApiEnvironment(val baseUrl: String) {
    PRODUCTION("https://synapse.getjanus.dev"),
    DEVELOPMENT("http://10.0.2.2:8000");

    /** Full API base including the version prefix. */
    val apiBaseUrl: String get() = "$baseUrl$API_PREFIX"

    companion object {
        const val API_PREFIX = "/api/v1"
        val DEFAULT = PRODUCTION
    }
}
