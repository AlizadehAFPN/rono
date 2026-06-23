package dev.getjanus.synapse

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import dagger.hilt.android.AndroidEntryPoint
import dev.getjanus.synapse.core.locale.LocaleManager
import dev.getjanus.synapse.ui.SynapseApp

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun attachBaseContext(newBase: Context) {
        super.attachBaseContext(LocaleManager.wrap(newBase))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        // Show the system splash for the cold-start frame only, then let it go.
        // The app renders its own Launch state while auth is restored, and we
        // never hold the splash on app state — holding it across a locale-change
        // recreate() leaves it stuck.
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SynapseApp()
        }
    }
}
