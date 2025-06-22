import React, { useState, useEffect } from 'react'
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'
import { useNavigate, useLocation } from 'react-router-dom'

const ConfirmSignUp = () => {
  const [confirmationCode, setConfirmationCode] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  
  const email = location.state?.email || ''
  const message = location.state?.message || ''

  useEffect(() => {
    if (!email) {
      navigate('/login')
    }
  }, [email, navigate])

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!confirmationCode.trim()) {
      setErrors({ code: '確認コードを入力してください' })
      return
    }

    setLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode
      })

      if (isSignUpComplete) {
        setSuccessMessage('メールアドレスの確認が完了しました。サインインページに移動します。')
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              email: email,
              message: 'アカウントの作成が完了しました。サインインしてください。'
            }
          })
        }, 2000)
      }
    } catch (error) {
      console.error('Confirmation error:', error)
      
      let errorMessage = 'メールアドレスの確認に失敗しました'
      
      switch (error.name) {
        case 'CodeMismatchException':
          errorMessage = '確認コードが正しくありません'
          break
        case 'ExpiredCodeException':
          errorMessage = '確認コードの有効期限が切れています。新しいコードを送信してください。'
          break
        case 'LimitExceededException':
          errorMessage = '試行回数が上限に達しました。しばらく時間を置いてからお試しください。'
          break
        case 'NotAuthorizedException':
          errorMessage = 'ユーザーが見つからないか、既に確認済みです'
          break
        default:
          errorMessage = error.message || 'メールアドレスの確認に失敗しました'
      }
      
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      await resendSignUpCode({
        username: email
      })
      
      setSuccessMessage('確認コードを再送信しました。メールをご確認ください。')
      setResendCooldown(60) // 60秒のクールダウン
    } catch (error) {
      console.error('Resend code error:', error)
      
      let errorMessage = '確認コードの再送信に失敗しました'
      
      switch (error.name) {
        case 'LimitExceededException':
          errorMessage = '再送信の回数制限に達しました。しばらく時間を置いてからお試しください。'
          break
        case 'InvalidParameterException':
          errorMessage = 'ユーザーが見つからないか、既に確認済みです'
          break
        default:
          errorMessage = error.message || '確認コードの再送信に失敗しました'
      }
      
      setErrors({ resend: errorMessage })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="auth-form">
          <div className="auth-header">
            <h2>メールアドレスの確認</h2>
            <p>
              {message || `${email} に送信された確認コードを入力してください`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form">
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
                value={confirmationCode}
                onChange={(e) => {
                  setConfirmationCode(e.target.value)
                  if (errors.code) {
                    setErrors(prev => ({ ...prev, code: '' }))
                  }
                }}
                placeholder="6桁の確認コードを入力"
                maxLength="6"
                disabled={loading}
                className={errors.code ? 'error' : ''}
                autoComplete="off"
              />
              {errors.code && <span className="error-text">{errors.code}</span>}
              <small className="help-text">
                メールに記載された6桁のコードを入力してください
              </small>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading || confirmationCode.length !== 6}
            >
              {loading ? '確認中...' : 'メールアドレスを確認'}
            </button>
          </form>

          <div className="auth-footer">
            <div className="resend-section">
              <p>メールが届かない場合：</p>
              
              {errors.resend && (
                <div className="error" style={{ margin: '10px 0' }}>
                  {errors.resend}
                </div>
              )}
              
              <button
                type="button"
                className="link-button"
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
              >
                {resendLoading ? '送信中...' :
                 resendCooldown > 0 ? `確認コードを再送信 (${resendCooldown}秒後に再送信可能)` :
                 '確認コードを再送信'}
              </button>
            </div>

            <div className="help-section">
              <details>
                <summary>メールが届かない場合</summary>
                <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                  <li>迷惑メールフォルダをご確認ください</li>
                  <li>メールアドレスが正しく入力されているかご確認ください</li>
                  <li>しばらく時間を置いてからお試しください</li>
                  <li>問題が続く場合は管理者にお問い合わせください</li>
                </ul>
              </details>
            </div>

            <p>
              <button
                type="button"
                className="link-button"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                ← サインインページに戻る
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmSignUp