import React, { useState } from 'react'
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'

const ResetPassword = ({ onSwitchToSignIn }) => {
  const [step, setStep] = useState('request') // 'request' | 'confirm'
  const [formData, setFormData] = useState({
    email: '',
    confirmationCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
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

  const validateEmailForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateResetForm = () => {
    const newErrors = {}

    if (!formData.confirmationCode.trim()) {
      newErrors.confirmationCode = '確認コードを入力してください'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '新しいパスワードを入力してください'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'パスワードは8文字以上で入力してください'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)) {
      newErrors.newPassword = 'パスワードには大文字、小文字、数字、記号を含めてください'
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRequestReset = async (e) => {
    e.preventDefault()
    
    if (!validateEmailForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      await resetPassword({
        username: formData.email
      })

      setSuccessMessage('パスワードリセット用のコードをメールに送信しました。')
      setStep('confirm')
    } catch (error) {
      console.error('Reset password request error:', error)
      
      let errorMessage = 'パスワードリセットの申請に失敗しました'
      
      switch (error.name) {
        case 'UserNotFoundException':
          errorMessage = 'このメールアドレスで登録されたアカウントが見つかりません'
          break
        case 'LimitExceededException':
          errorMessage = 'リクエスト回数が上限に達しました。しばらく時間を置いてからお試しください'
          break
        case 'NotAuthorizedException':
          errorMessage = 'パスワードリセットが許可されていません'
          break
        default:
          errorMessage = error.message || 'パスワードリセットの申請に失敗しました'
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReset = async (e) => {
    e.preventDefault()
    
    if (!validateResetForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      await confirmResetPassword({
        username: formData.email,
        confirmationCode: formData.confirmationCode,
        newPassword: formData.newPassword
      })

      setSuccessMessage('パスワードが正常に変更されました。新しいパスワードでサインインしてください。')
      
      setTimeout(() => {
        navigate('/login', {
          state: {
            email: formData.email,
            message: 'パスワードが変更されました。新しいパスワードでサインインしてください。'
          }
        })
      }, 2000)
    } catch (error) {
      console.error('Confirm reset password error:', error)
      
      let errorMessage = 'パスワードの変更に失敗しました'
      
      switch (error.name) {
        case 'CodeMismatchException':
          errorMessage = '確認コードが正しくありません'
          break
        case 'ExpiredCodeException':
          errorMessage = '確認コードの有効期限が切れています。新しいコードを申請してください'
          break
        case 'InvalidPasswordException':
          errorMessage = 'パスワードの要件を満たしていません'
          break
        case 'LimitExceededException':
          errorMessage = '試行回数が上限に達しました。しばらく時間を置いてからお試しください'
          break
        default:
          errorMessage = error.message || 'パスワードの変更に失敗しました'
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (step === 'request') {
    return (
      <div className="auth-form">
        <div className="auth-header">
          <h2>パスワードリセット</h2>
          <p>パスワードをリセットするメールアドレスを入力してください</p>
        </div>

        <form onSubmit={handleRequestReset} className="form">
          {errors.submit && (
            <div className="error">
              {errors.submit}
            </div>
          )}

          {successMessage && (
            <div className="success">
              {successMessage}
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
            <small className="help-text">
              登録時に使用したメールアドレスを入力してください
            </small>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'リセットコード送信中...' : 'リセットコードを送信'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <button
              type="button"
              className="link-button"
              onClick={onSwitchToSignIn}
              disabled={loading}
            >
              ← サインインに戻る
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>新しいパスワードを設定</h2>
        <p>{formData.email} に送信された確認コードと新しいパスワードを入力してください</p>
      </div>

      <form onSubmit={handleConfirmReset} className="form">
        {errors.submit && (
          <div className="error">
            {errors.submit}
          </div>
        )}

        {successMessage && (
          <div className="success">
            {successMessage}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="confirmationCode">確認コード</label>
          <input
            type="text"
            id="confirmationCode"
            name="confirmationCode"
            value={formData.confirmationCode}
            onChange={handleChange}
            placeholder="6桁の確認コードを入力"
            maxLength="6"
            disabled={loading}
            className={errors.confirmationCode ? 'error' : ''}
            autoComplete="off"
          />
          {errors.confirmationCode && <span className="error-text">{errors.confirmationCode}</span>}
          <small className="help-text">
            メールに記載された6桁のコードを入力してください
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">新しいパスワード</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="8文字以上（大文字・小文字・数字・記号を含む）"
              disabled={loading}
              className={errors.newPassword ? 'error' : ''}
              autoComplete="new-password"
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
          {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">パスワード確認</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="上記と同じパスワードを入力"
            disabled={loading}
            className={errors.confirmPassword ? 'error' : ''}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'パスワード変更中...' : 'パスワードを変更'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          確認コードが届かない場合：
          <button
            type="button"
            className="link-button"
            onClick={() => setStep('request')}
            disabled={loading}
          >
            コードを再送信
          </button>
        </p>
        
        <p>
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToSignIn}
            disabled={loading}
          >
            ← サインインに戻る
          </button>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword