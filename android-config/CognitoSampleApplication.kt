package com.example.cognitosample

import android.app.Application
import android.util.Log
import com.amplifyframework.AmplifyException
import com.amplifyframework.auth.cognito.AWSCognitoAuthPlugin
import com.amplifyframework.core.Amplify

class CognitoSampleApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        
        try {
            // Configure Amplify
            Amplify.addPlugin(AWSCognitoAuthPlugin())
            Amplify.configure(applicationContext)
            
            Log.i("CognitoSample", "Amplify initialized successfully")
        } catch (error: AmplifyException) {
            Log.e("CognitoSample", "Could not initialize Amplify", error)
        }
    }
}