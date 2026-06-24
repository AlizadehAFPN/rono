package dev.getjanus.rono.core.network

import javax.inject.Inject
import javax.inject.Singleton

/** Resolves possibly-relative media URLs (e.g. avatar_url) to absolute ones. */
@Singleton
class MediaUrlResolver @Inject constructor(
    private val environment: ApiEnvironmentProvider,
) {
    fun resolve(path: String?): String? {
        if (path.isNullOrBlank()) return null
        if (path.startsWith("http://") || path.startsWith("https://")) return path
        val base = environment.current.baseUrl.trimEnd('/')
        val suffix = if (path.startsWith("/")) path else "/$path"
        return base + suffix
    }
}
