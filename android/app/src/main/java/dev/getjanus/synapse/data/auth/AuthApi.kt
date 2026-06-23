package dev.getjanus.synapse.data.auth

import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Path

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): MeResponse

    @POST("auth/signup")
    suspend fun signup(@Body body: SignupRequest): MeResponse

    @POST("auth/refresh")
    suspend fun refresh(): MeResponse

    @POST("auth/logout")
    suspend fun logout()

    @GET("auth/me")
    suspend fun me(): MeResponse

    @PATCH("auth/me")
    suspend fun updateProfile(@Body body: ProfileUpdateRequest): MeResponse

    @Multipart
    @PUT("auth/me/avatar")
    suspend fun uploadAvatar(@Part file: MultipartBody.Part): MeResponse

    @DELETE("auth/me/avatar")
    suspend fun deleteAvatar(): MeResponse

    @POST("auth/change-password")
    suspend fun changePassword(@Body body: ChangePasswordRequest)

    @GET("auth/sessions")
    suspend fun sessions(): List<SessionDto>

    @DELETE("auth/sessions/others")
    suspend fun revokeOtherSessions()

    @DELETE("auth/sessions/{id}")
    suspend fun revokeSession(@Path("id") id: String)
}
