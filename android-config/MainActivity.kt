package com.example.cognitosample

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.amplifyframework.auth.AuthChannelEventName
import com.amplifyframework.auth.AuthException
import com.amplifyframework.auth.cognito.result.AWSCognitoAuthSignInResult
import com.amplifyframework.auth.result.AuthSignInResult
import com.amplifyframework.core.Amplify
import com.amplifyframework.hub.HubChannel
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Deep link handling
        handleDeepLink(intent)
        
        setContent {
            CognitoSampleTheme {
                AuthScreen()
            }
        }
    }
    
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }
    
    private fun handleDeepLink(intent: Intent?) {
        intent?.data?.let { uri ->
            if (uri.scheme == "cognitosample" && uri.host == "auth") {
                when (uri.lastPathSegment) {
                    "callback" -> {
                        // OAuth callback handling
                        Amplify.Auth.handleWebUISignInResponse(intent)
                    }
                    "logout" -> {
                        // OAuth logout handling
                    }
                }
            }
        }
    }
}

@Composable
fun AuthScreen() {
    var authState by remember { mutableStateOf(AuthState.UNKNOWN) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    
    // Check auth state on start
    LaunchedEffect(Unit) {
        try {
            val session = Amplify.Auth.fetchAuthSession()
            authState = if (session.isSignedIn) AuthState.SIGNED_IN else AuthState.SIGNED_OUT
        } catch (e: Exception) {
            authState = AuthState.SIGNED_OUT
        }
    }
    
    // Listen for auth events
    LaunchedEffect(Unit) {
        Amplify.Hub.subscribe(HubChannel.AUTH) { hubEvent ->
            when (hubEvent.name) {
                AuthChannelEventName.SIGNED_IN.toString() -> {
                    authState = AuthState.SIGNED_IN
                }
                AuthChannelEventName.SIGNED_OUT.toString() -> {
                    authState = AuthState.SIGNED_OUT
                }
            }
        }
    }
    
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        when (authState) {
            AuthState.UNKNOWN -> {
                LoadingScreen()
            }
            AuthState.SIGNED_OUT -> {
                SignInScreen(
                    isLoading = isLoading,
                    errorMessage = errorMessage,
                    onSignInWithEmail = { email, password ->
                        coroutineScope.launch {
                            signInWithEmail(email, password) { result ->
                                when (result) {
                                    is AuthResult.Success -> {
                                        authState = AuthState.SIGNED_IN
                                        errorMessage = null
                                    }
                                    is AuthResult.Error -> {
                                        errorMessage = result.message
                                    }
                                    is AuthResult.MfaRequired -> {
                                        authState = AuthState.MFA_REQUIRED
                                    }
                                }
                                isLoading = false
                            }
                        }
                    },
                    onSignInWithProvider = { provider ->
                        coroutineScope.launch {
                            signInWithProvider(provider) { result ->
                                when (result) {
                                    is AuthResult.Success -> {
                                        authState = AuthState.SIGNED_IN
                                        errorMessage = null
                                    }
                                    is AuthResult.Error -> {
                                        errorMessage = result.message
                                    }
                                }
                                isLoading = false
                            }
                        }
                    }
                )
            }
            AuthState.MFA_REQUIRED -> {
                MfaScreen(
                    isLoading = isLoading,
                    errorMessage = errorMessage,
                    onConfirmMfa = { code, rememberDevice ->
                        coroutineScope.launch {
                            confirmMfa(code, rememberDevice) { result ->
                                when (result) {
                                    is AuthResult.Success -> {
                                        authState = AuthState.SIGNED_IN
                                        errorMessage = null
                                    }
                                    is AuthResult.Error -> {
                                        errorMessage = result.message
                                    }
                                }
                                isLoading = false
                            }
                        }
                    }
                )
            }
            AuthState.SIGNED_IN -> {
                DashboardScreen(
                    onSignOut = {
                        coroutineScope.launch {
                            signOut { result ->
                                when (result) {
                                    is AuthResult.Success -> {
                                        authState = AuthState.SIGNED_OUT
                                        errorMessage = null
                                    }
                                    is AuthResult.Error -> {
                                        errorMessage = result.message
                                    }
                                }
                            }
                        }
                    }
                )
            }
        }
    }
}

enum class AuthState {
    UNKNOWN,
    SIGNED_OUT,
    MFA_REQUIRED,
    SIGNED_IN
}

sealed class AuthResult {
    object Success : AuthResult()
    object MfaRequired : AuthResult()
    data class Error(val message: String) : AuthResult()
}

// Auth functions
suspend fun signInWithEmail(
    email: String,
    password: String,
    callback: (AuthResult) -> Unit
) {
    try {
        val result = Amplify.Auth.signIn(email, password)
        when (result.nextStep.signInStep) {
            AuthSignInStep.CONFIRM_SIGN_IN_WITH_TOTP_CODE -> {
                callback(AuthResult.MfaRequired)
            }
            AuthSignInStep.DONE -> {
                callback(AuthResult.Success)
            }
            else -> {
                callback(AuthResult.Error("Unexpected sign in step"))
            }
        }
    } catch (e: AuthException) {
        callback(AuthResult.Error(e.message ?: "Sign in failed"))
    }
}

suspend fun signInWithProvider(
    provider: String,
    callback: (AuthResult) -> Unit
) {
    try {
        Amplify.Auth.signInWithSocialWebUI(
            when (provider) {
                "Google" -> AuthProvider.google()
                "Microsoft" -> AuthProvider.microsoft()
                else -> throw IllegalArgumentException("Unknown provider")
            },
            context as Activity
        )
        callback(AuthResult.Success)
    } catch (e: AuthException) {
        callback(AuthResult.Error(e.message ?: "Social sign in failed"))
    }
}

suspend fun confirmMfa(
    code: String,
    rememberDevice: Boolean,
    callback: (AuthResult) -> Unit
) {
    try {
        val result = Amplify.Auth.confirmSignIn(code)
        if (result.isSignInComplete) {
            if (rememberDevice) {
                try {
                    Amplify.Auth.rememberDevice()
                } catch (e: Exception) {
                    // Device remember failed, but sign in succeeded
                }
            }
            callback(AuthResult.Success)
        } else {
            callback(AuthResult.Error("MFA confirmation failed"))
        }
    } catch (e: AuthException) {
        callback(AuthResult.Error(e.message ?: "MFA confirmation failed"))
    }
}

suspend fun signOut(callback: (AuthResult) -> Unit) {
    try {
        Amplify.Auth.signOut()
        callback(AuthResult.Success)
    } catch (e: AuthException) {
        callback(AuthResult.Error(e.message ?: "Sign out failed"))
    }
}