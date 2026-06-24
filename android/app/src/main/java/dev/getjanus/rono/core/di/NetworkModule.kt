package dev.getjanus.rono.core.di

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dev.getjanus.rono.BuildConfig
import dev.getjanus.rono.core.config.ApiEnvironment
import dev.getjanus.rono.core.network.AuthCookieJar
import dev.getjanus.rono.core.network.HostSelectionInterceptor
import dev.getjanus.rono.core.network.RonoJson
import dev.getjanus.rono.core.network.TokenAuthenticator
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit
import javax.inject.Named
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    private fun logging() = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC
        else HttpLoggingInterceptor.Level.NONE
    }

    /** Bare client used only to refresh tokens (shares cookies, no authenticator). */
    @Provides
    @Singleton
    @Named("refresh")
    fun provideRefreshClient(cookieJar: AuthCookieJar): OkHttpClient =
        OkHttpClient.Builder()
            .cookieJar(cookieJar)
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

    @Provides
    @Singleton
    fun provideOkHttpClient(
        cookieJar: AuthCookieJar,
        hostSelection: HostSelectionInterceptor,
        authenticator: TokenAuthenticator,
    ): OkHttpClient =
        OkHttpClient.Builder()
            .cookieJar(cookieJar)
            .addInterceptor(hostSelection)
            .addInterceptor(logging())
            .authenticator(authenticator)
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient): Retrofit {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(ApiEnvironment.PRODUCTION.apiBaseUrl + "/")
            .client(client)
            .addConverterFactory(RonoJson.asConverterFactory(contentType))
            .build()
    }
}
