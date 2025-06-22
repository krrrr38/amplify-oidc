import React, { useState } from 'react'
import SignIn from './SignIn'
import SignUp from './SignUp'
import ResetPassword from './ResetPassword'
import ProviderSelect from './ProviderSelect'
import './provider.css'

const AuthScreen = () => {
  const [currentView, setCurrentView] = useState('provider-select') // 'provider-select' | 'signin' | 'signup' | 'reset'

  const renderCurrentView = () => {
    switch (currentView) {
      case 'provider-select':
        return (
          <ProviderSelect
            onSelectCognito={() => setCurrentView('signin')}
          />
        )
      case 'signin':
        return (
          <SignIn
            onSwitchToSignUp={() => setCurrentView('signup')}
            onSwitchToResetPassword={() => setCurrentView('reset')}
            onBackToProviders={() => setCurrentView('provider-select')}
          />
        )
      case 'signup':
        return (
          <SignUp
            onSwitchToSignIn={() => setCurrentView('signin')}
            onBackToProviders={() => setCurrentView('provider-select')}
          />
        )
      case 'reset':
        return (
          <ResetPassword
            onSwitchToSignIn={() => setCurrentView('signin')}
            onBackToProviders={() => setCurrentView('provider-select')}
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
        
        {currentView !== 'provider-select' && (
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
        )}

        {renderCurrentView()}
      </div>
    </div>
  )
}

export default AuthScreen