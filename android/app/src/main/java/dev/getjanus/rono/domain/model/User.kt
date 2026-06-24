package dev.getjanus.rono.domain.model

/** The signed-in user, flattened from /auth/me (user + primary membership). */
data class User(
    val id: String,
    val email: String,
    val fullName: String?,
    val preferredName: String?,
    val avatarUrl: String?,
    val locale: String,
    val timezone: String,
    val emailVerified: Boolean,
    val role: Role,
    val institutionId: String?,
    val institutionName: String?,
) {
    val displayName: String
        get() = preferredName?.takeIf { it.isNotBlank() }
            ?: fullName?.takeIf { it.isNotBlank() }
            ?: email.substringBefore("@")

    val initials: String
        get() = (fullName ?: email).trim().split(" ", ".")
            .filter { it.isNotBlank() }
            .take(2)
            .joinToString("") { it.first().uppercase() }
            .ifBlank { email.first().uppercase() }
}
