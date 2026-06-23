package dev.getjanus.synapse.core.network

import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * App-wide auth signals. The network layer (token refresh) and repositories
 * emit [Expired] when the session can no longer be recovered; the global
 * session manager listens and drops the user back to the login screen.
 */
@Singleton
class SessionEvents @Inject constructor() {
    private val _events = MutableSharedFlow<Event>(extraBufferCapacity = 1)
    val events: SharedFlow<Event> = _events.asSharedFlow()

    fun notifyExpired() {
        _events.tryEmit(Event.Expired)
    }

    enum class Event { Expired }
}
