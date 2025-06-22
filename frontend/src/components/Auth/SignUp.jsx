import React, { useState } from 'react'
import { signUp } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'

const SignUp = ({ onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'パスワードは8文字以上で入力してください'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'パスワードには大文字、小文字、数字、記号を含めてください'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません'
    }

    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください'
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
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: formData.email,
        password: formData.password,
        attributes: {
          email: formData.email,
          name: formData.name
        }
      })

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        // メール認証が必要
        navigate('/auth/confirm-signup', { 
          state: { 
            email: formData.email,
            message: 'アカウントが作成されました。メールアドレスに送信された確認コードを入力してください。'
          }
        })
      } else if (isSignUpComplete) {
        // サインアップ完了
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      
      let errorMessage = 'アカウント作成に失敗しました'
      
      switch (error.name) {
        case 'UsernameExistsException':
          errorMessage = 'このメールアドレスは既に登録されています'
          break
        case 'InvalidPasswordException':
          errorMessage = 'パスワードの要件を満たしていません'
          break
        case 'InvalidParameterException':
          errorMessage = '入力内容に不備があります'
          break
        default:
          errorMessage = error.message || 'アカウント作成に失敗しました'
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>アカウント作成</h2>
        <p>新しいアカウントを作成してください</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {errors.submit && (
          <div className="error">
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">お名前 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="田中 太郎"
            disabled={loading}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">メールアドレス *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            disabled={loading}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード *</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8文字以上（大文字・小文字・数字・記号を含む）"
              disabled={loading}
              className={errors.password ? 'error' : ''}
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

        <div className="form-group">
          <label htmlFor="confirmPassword">パスワード確認 *</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="上記と同じパスワードを入力"
            disabled={loading}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'アカウント作成中...' : 'アカウントを作成'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          既にアカウントをお持ちですか？
          <button
            type="button"
            className="link-button"
            onClick={onSwitchToSignIn}
            disabled={loading}
          >
            サインイン
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignUp