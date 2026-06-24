package dev.getjanus.rono.data.auth

import dev.getjanus.rono.domain.model.Role
import dev.getjanus.rono.domain.model.User
import kotlinx.serialization.Serializable

@Serializable
data class UserDto(
    val id: String,
    val email: String,
    val fullName: String? = null,
    val preferredName: String? = null,
    val avatarUrl: String? = null,
    val locale: String = "tr",
    val timezone: String = "UTC",
    val isActive: Boolean = true,
    val emailVerifiedAt: String? = null,
    val lastLoginAt: String? = null,
    val mfaEnabled: Boolean = false,
    val createdAt: String? = null,
)

@Serializable
data class MembershipDto(
    val institutionId: String? = null,
    val institutionName: String? = null,
    val role: String = "student",
    val status: String? = null,
)

@Serializable
data class MeResponse(
    val user: UserDto,
    val memberships: List<MembershipDto> = emptyList(),
) {
    fun toUser(): User {
        val membership = memberships.firstOrNull()
        return User(
            id = user.id,
            email = user.email,
            fullName = user.fullName,
            preferredName = user.preferredName,
            avatarUrl = user.avatarUrl,
            locale = user.locale,
            timezone = user.timezone,
            emailVerified = user.emailVerifiedAt != null,
            role = Role.fromApi(membership?.role),
            institutionId = membership?.institutionId,
            institutionName = membership?.institutionName,
        )
    }
}

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class SignupRequest(val email: String, val password: String, val fullName: String)

@Serializable
data class ProfileUpdateRequest(
    val fullName: String? = null,
    val preferredName: String? = null,
    val locale: String? = null,
    val timezone: String? = null,
)

@Serializable
data class ChangePasswordRequest(val currentPassword: String, val newPassword: String)

@Serializable
data class SessionDto(
    val id: String,
    val current: Boolean = false,
    val userAgent: String? = null,
    val ipAddress: String? = null,
    val deviceType: String? = null,
    val createdAt: String? = null,
    val lastSeenAt: String? = null,
)
