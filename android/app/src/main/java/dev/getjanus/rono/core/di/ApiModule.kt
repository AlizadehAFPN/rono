package dev.getjanus.rono.core.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dev.getjanus.rono.data.auth.AuthApi
import dev.getjanus.rono.data.practice.PracticeApi
import dev.getjanus.rono.data.progress.ProgressApi
import retrofit2.Retrofit
import retrofit2.create
import javax.inject.Singleton

/** Retrofit service interfaces. Add new APIs here as features land. */
@Module
@InstallIn(SingletonComponent::class)
object ApiModule {

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create()

    @Provides
    @Singleton
    fun provideProgressApi(retrofit: Retrofit): ProgressApi = retrofit.create()

    @Provides
    @Singleton
    fun providePracticeApi(retrofit: Retrofit): PracticeApi = retrofit.create()
}
