import React, { useState } from 'react'
import SignIn from './SignIn'
import SignUp from './SignUp'
import ResetPassword from './ResetPassword'

const AuthScreen = () => {
  const [currentView, setCurrentView] = useState('signin') // 'signin' | 'signup' | 'reset'

  const renderCurrentView = () => {
    switch (currentView) {
      case 'signin':
        return (
          <SignIn
            onSwitchToSignUp={() => setCurrentView('signup')}
            onSwitchToResetPassword={() => setCurrentView('reset')}
          />
        )
      case 'signup':
        return (
          <SignUp
            onSwitchToSignIn={() => setCurrentView('signin')}
          />
        )
      case 'reset':
        return (
          <ResetPassword
            onSwitchToSignIn={() => setCurrentView('signin')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Cognito Sample</h1>
          <p>セキュアな認証システム</p>
        </div>
        
        <div className="auth-tabs">
          <button
            className={`auth-tab ${currentView === 'signin' ? 'active' : ''}`}
            onClick={() => setCurrentView('signin')}
          >
            サインイン
          </button>
          <button
            className={`auth-tab ${currentView === 'signup' ? 'active' : ''}`}
            onClick={() => setCurrentView('signup')}
          >
            新規登録
          </button>
        </div>

        {renderCurrentView()}
      </div>
    </div>
  )
}

export default AuthScreen