import React, { useState } from 'react'
import { signIn, confirmSignIn } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'
import { deviceService } from '../../services/deviceService'

const SignIn = ({ onSwitchToSignUp, onSwitchToResetPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [mfaCode, setMfaCode] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mfaStep, setMfaStep] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    if (!formData.password) {
      newErrors.password = 'パスワードを入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: formData.email,
        password: formData.password
      })

      if (isSignedIn) {
        // サインイン完了
        navigate('/dashboard')
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
        // MFA TOTP認証が必要
        setMfaStep(true)
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        // メール認証が必要
        navigate('/auth/confirm-signup', { 
          state: { 
            email: formData.email,
            message: 'メールアドレスの確認が必要です。メールに送信された確認コードを入力してください。'
          }
        })
      }
    } catch (error) {
      console.error('Sign in error:', error)
      
      let errorMessage = 'サインインに失敗しました'
      
      switch (error.name) {
        case 'NotAuthorizedException':
          errorMessage = 'メールアドレスまたはパスワードが正しくありません'
          break
        case 'UserNotFoundException':
          errorMessage = 'アカウントが見つかりません'
          break
        case 'UserNotConfirmedException':
          errorMessage = 'メールアドレスの確認が完了していません'
          navigate('/auth/confirm-signup', { 
            state: { 
              email: formData.email,
              message: 'メールアドレスの確認が必要です。'
            }
          })
          return
        case 'TooManyRequestsException':
          errorMessage = 'リクエストが多すぎます。しばらく時間を置いてからお試しください'
          break
        case 'PasswordResetRequiredException':
          errorMessage = 'パスワードのリセットが必要です'
          break
        default:
          errorMessage = error.message || 'サインインに失敗しました'
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleMfaSubmit = async (e) => {
    e.preventDefault()
    
    if (!mfaCode.trim()) {
      setErrors({ mfa: '認証コードを入力してください' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const { isSignedIn } = await confirmSignIn({
        challengeResponse: mfaCode
      })

      if (isSignedIn) {
        // デバイス記憶が有効な場合はデバイスを記憶
        if (rememberDevice) {
          await deviceService.rememberCurrentDevice()
          deviceService.setDeviceRemembered(true)
        }
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('MFA verification error:', error)
      
      let errorMessage = 'MFA認証に失敗しました'
      
      switch (error.name) {
        case 'CodeMismatchException':
          errorMessage = '認証コードが正しくありません'
          break
        case 'ExpiredCodeException':
          errorMessage = '認証コードの有効期限が切れています'
          break
        default:
          errorMessage = error.message || 'MFA認証に失敗しました'
      }
      
      setErrors({ mfa: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (mfaStep) {
    return (
      <div className="auth-form">
        <div className="auth-header">
          <h2>二段階認証</h2>
          <p>認証アプリで生成された6桁のコードを入力してください</p>
        </div>

        <form onSubmit={handleMfaSubmit} className="form">
          {errors.mfa && (
            <div className="error">
              {errors.mfa}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="mfaCode">認証コード</label>
            <input
              type="text"
              id="mfaCode"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="6桁のコードを入力"
              maxLength="6"
              disabled={loading}
              className={errors.mfa ? 'error' : ''}
              autoComplete="off"
            />
            <small className="help-text">
              Google Authenticator、Authy などの認証アプリで生成されたコードを入力してください
            </small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              このデバイスを信頼済みとして記憶する（次回からMFA認証をスキップ）
            </label>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading || mfaCode.length !== 6}
          >
            {loading ? '確認中...' : '認証する'}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="link-button"
            onClick={() => setMfaStep(false)}
            disabled={loading}
          >
            ← 戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>サインイン</h2>
        <p>アカウントにサインインしてください</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {errors.submit && (
          <div className="error">
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            disabled={loading}
            className={errors.email ? 'error' : ''}
            autoComplete="username"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="パスワードを入力"
              disabled={loading}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '隠す' : '表示'}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <span className="checkmark"></span>
            ログイン状態を保持する
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'サインイン中...' : 'サインイン'}
        </button>
      </form>

      <div className="auth-footer">
        <button
          type="button"
          className="link-button"
          onClick={onSwitchToResetPassword}
          disabled={loading}
        >
          パスワードを忘れた方はこちら
        </button>
        
        <p>
          アカウントをお持ちでない方は
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToSignUp}
            disabled={loading}
          >
            新規登録
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignIn