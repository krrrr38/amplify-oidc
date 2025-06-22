import React, { useState, useEffect } from 'react'
import { setUpTOTP, confirmTOTP, getCurrentUser } from 'aws-amplify/auth'
import QRCode from 'qrcode'
import './auth.css'

const MFASetup = () => {
  const [step, setStep] = useState('setup') // 'setup', 'verify', 'complete'
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  const handleSetupTOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const totpSetupDetails = await setUpTOTP()
      const { sharedSecret } = totpSetupDetails
      
      setSecretKey(sharedSecret)
      
      // QRコード用のURI生成
      const issuer = 'CognitoSample'
      const accountName = user?.username || 'user'
      const uri = `otpauth://totp/${issuer}:${accountName}?secret=${sharedSecret}&issuer=${issuer}`
      
      // QRコード生成
      const qrUrl = await QRCode.toDataURL(uri)
      setQrCodeUrl(qrUrl)
      
      setStep('verify')
    } catch (error) {
      console.error('TOTP setup error:', error)
      setError('TOTP設定中にエラーが発生しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyTOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await confirmTOTP({ confirmationCode: totpCode })
      setStep('complete')
    } catch (error) {
      console.error('TOTP verification error:', error)
      setError('認証コードが正しくありません: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderSetupStep = () => (
    <div className="auth-form">
      <div className="auth-header">
        <h2>MFA TOTP 設定</h2>
        <p>
          セキュリティを強化するため、TOTP (時間ベース ワンタイム パスワード) を設定します。
        </p>
      </div>
      
      <div className="form">
        <div style={{ marginBottom: '25px', textAlign: 'left' }}>
          <h3 style={{ color: '#232f3e', marginBottom: '15px' }}>必要なもの:</h3>
          <ul style={{ color: '#6c757d', lineHeight: '1.6' }}>
            <li>スマートフォンまたはタブレット</li>
            <li>認証アプリ (Google Authenticator, Authy, 1Password など)</li>
          </ul>
        </div>
        
        <div style={{ marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ margin: '0', color: '#495057', fontSize: '14px', lineHeight: '1.5' }}>
            二段階認証を設定することで、パスワードだけでなく認証アプリで生成される6桁のコードも必要になり、
            アカウントのセキュリティが大幅に向上します。
          </p>
        </div>
        
        <button 
          className="submit-button" 
          onClick={handleSetupTOTP}
          disabled={loading}
        >
          {loading ? 'セットアップ中...' : 'TOTP セットアップ開始'}
        </button>
      </div>
    </div>
  )

  const renderVerifyStep = () => (
    <div className="auth-form">
      <div className="auth-header">
        <h2>TOTP 設定の確認</h2>
        <p>認証アプリの設定と確認コードの入力を行ってください</p>
      </div>
      
      <div className="form">
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <h3 style={{ color: '#232f3e', marginBottom: '15px' }}>手順 1: QRコードをスキャン</h3>
          <p style={{ color: '#6c757d', marginBottom: '15px' }}>認証アプリでこのQRコードをスキャンしてください：</p>
          {qrCodeUrl && (
            <div style={{ padding: '15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', display: 'inline-block' }}>
              <img src={qrCodeUrl} alt="TOTP QR Code" style={{ display: 'block' }} />
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#232f3e', marginBottom: '15px' }}>手順 2: シークレットキー (手動入力の場合)</h3>
          <p style={{ color: '#6c757d', marginBottom: '10px' }}>QRコードが読み取れない場合は、以下のキーを手動で入力してください：</p>
          <code style={{ 
            background: '#f8f9fa', 
            padding: '12px', 
            display: 'block', 
            margin: '10px 0',
            wordBreak: 'break-all',
            borderRadius: '6px',
            border: '1px solid #e9ecef',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {secretKey}
          </code>
        </div>
        
        <form onSubmit={handleVerifyTOTP}>
          <div className="form-group">
            <label htmlFor="totpCode">手順 3: 認証コードを入力</label>
            <input
              type="text"
              id="totpCode"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="6桁の認証コードを入力"
              maxLength="6"
              disabled={loading}
              autoComplete="off"
              className={error ? 'error' : ''}
            />
            <small className="help-text">
              認証アプリで生成された6桁のコードを入力してください
            </small>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || totpCode.length !== 6}
          >
            {loading ? '確認中...' : 'TOTP 設定を完了'}
          </button>
        </form>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="auth-form">
      <div className="auth-header">
        <h2>設定完了</h2>
        <p>二段階認証の設定が正常に完了しました</p>
      </div>
      
      <div className="form">
        <div className="success">
          <p><strong>✅ TOTP の設定が完了しました！</strong></p>
          <p>
            今後のサインイン時には、認証アプリで生成される6桁のコードが必要になります。
          </p>
        </div>
        
        <div style={{ marginBottom: '25px', padding: '15px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}>
          <h3 style={{ color: '#856404', marginBottom: '15px', fontSize: '16px' }}>重要な注意事項:</h3>
          <ul style={{ textAlign: 'left', color: '#856404', lineHeight: '1.6', margin: '0', paddingLeft: '20px' }}>
            <li>認証アプリを削除しないでください</li>
            <li>デバイスを紛失した場合は、管理者に連絡してください</li>
            <li>バックアップコードがある場合は安全な場所に保管してください</li>
            <li>認証コードは30秒ごとに更新されます</li>
          </ul>
        </div>
        
        <button 
          className="submit-button" 
          onClick={() => window.location.href = '/dashboard'}
        >
          ダッシュボードに戻る
        </button>
      </div>
    </div>
  )

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>MFA設定</h1>
          <p>二段階認証の設定</p>
        </div>
        
        {error && (
          <div style={{ padding: '0 30px' }}>
            <div className="error">
              {error}
            </div>
          </div>
        )}
        
        {step === 'setup' && renderSetupStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'complete' && renderCompleteStep()}
      </div>
    </div>
  )
}

export default MFASetup