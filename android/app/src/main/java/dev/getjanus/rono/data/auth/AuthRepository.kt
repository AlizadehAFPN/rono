package dev.getjanus.rono.data.auth

import dev.getjanus.rono.core.network.CookieStore
import dev.getjanus.rono.core.network.apiCall
import dev.getjanus.rono.domain.model.User
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: AuthApi,
    private val cookieStore: CookieStore,
) {
    /** Cookie presence is a cheap hint that a session may exist (verified by [me]). */
    fun hasPersistedSession(): Boolean = cookieStore.hasSession()

    suspend fun login(email: String, password: String): User =
        apiCall { api.login(LoginRequest(email.trim(), password)) }.toUser()

    suspend fun signup(email: String, password: String, fullName: String): User =
        apiCall { api.signup(SignupRequest(email.trim(), password, fullName.trim())) }.toUser()

    suspend fun me(): User = apiCall { api.me() }.toUser()

    suspend fun logout() {
        runCatching { apiCall { api.logout() } }
        cookieStore.clear()
    }

    suspend fun updateProfile(
        fullName: String? = null,
        preferredName: String? = null,
        locale: String? = null,
        timezone: String? = null,
    ): User = apiCall {
        api.updateProfile(ProfileUpdateRequest(fullName, preferredName, locale, timezone))
    }.toUser()

    suspend fun uploadAvatar(bytes: ByteArray, mimeType: String, fileName: String): User {
        val body = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
        val part = MultipartBody.Part.createFormData("file", fileName, body)
        return apiCall { api.uploadAvatar(part) }.toUser()
    }

    suspend fun deleteAvatar(): User = apiCall { api.deleteAvatar() }.toUser()

    suspend fun changePassword(currentPassword: String, newPassword: String) =
        apiCall { api.changePassword(ChangePasswordRequest(currentPassword, newPassword)) }

    suspend fun sessions(): List<SessionDto> = apiCall { api.sessions() }

    suspend fun revokeOtherSessions() = apiCall { api.revokeOtherSessions() }

    suspend fun revokeSession(id: String) = apiCall { api.revokeSession(id) }
}
