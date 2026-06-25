package dev.getjanus.rono.core.config

/**
 * Backend environment. Default = production (the WEB origin — Next.js proxies
 * the api path prefix to the backend; the api subdomain is not publicly
 * resolvable). Dev points at the host machine reachable from the emulator
 * (10.0.2.2).
 */
enum class ApiEnvironment(val baseUrl: String) {
    PRODUCTION("https://rono.getjanus.dev"),
    // localhost works on both a physical device and the emulator when paired with
    // `adb reverse tcp:8000 tcp:8000` (maps device localhost → host machine).
    DEVELOPMENT("http://localhost:8000");

    /** Full API base including the version prefix. */
    val apiBaseUrl: String get() = "$baseUrl$API_PREFIX"

    companion object {
        const val API_PREFIX = "/api/v1"
        val DEFAULT = PRODUCTION
    }
}
