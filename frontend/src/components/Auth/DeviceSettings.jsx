import React, { useState, useEffect } from 'react'
import { deviceService } from '../../services/deviceService'
import './auth.css'

const DeviceSettings = ({ onClose }) => {
  const [isRemembered, setIsRemembered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 現在のデバイス記憶状態を取得
    setIsRemembered(deviceService.isDeviceRemembered())
  }, [])

  const handleToggleRemember = async () => {
    setLoading(true)
    setMessage('')

    try {
      if (isRemembered) {
        // デバイスの記憶を解除
        const success = await deviceService.forgetCurrentDevice()
        if (success) {
          deviceService.setDeviceRemembered(false)
          setIsRemembered(false)
          setMessage('このデバイスの記憶を解除しました。次回サインイン時にMFA認証が必要になります。')
        } else {
          setMessage('デバイス設定の変更に失敗しました。')
        }
      } else {
        // デバイスを記憶
        const success = await deviceService.rememberCurrentDevice()
        if (success) {
          deviceService.setDeviceRemembered(true)
          setIsRemembered(true)
          setMessage('このデバイスを信頼済みとして記憶しました。次回からMFA認証をスキップできます。')
        } else {
          setMessage('デバイス設定の変更に失敗しました。')
        }
      }
    } catch (error) {
      console.error('Device settings error:', error)
      setMessage('デバイス設定の変更中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>デバイス設定</h1>
          <p>信頼できるデバイスの管理</p>
        </div>

        <div className="auth-form">
          <div className="auth-header">
            <h2>MFA設定</h2>
            <p>このデバイスでのMFA認証をスキップするかどうかを設定できます</p>
          </div>

          <div className="form">
            {message && (
              <div className={message.includes('失敗') || message.includes('エラー') ? 'error' : 'success'}>
                {message}
              </div>
            )}

            <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ color: '#232f3e', marginBottom: '15px', fontSize: '16px' }}>
                現在の設定
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: isRemembered ? '#28a745' : '#dc3545',
                  marginRight: '10px'
                }}></div>
                <span style={{ color: '#495057', fontWeight: '500' }}>
                  {isRemembered ? '信頼済みデバイス（MFA認証スキップ）' : '未設定（MFA認証必須）'}
                </span>
              </div>
              
              <div style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.5' }}>
                {isRemembered ? (
                  <p>
                    このデバイスは信頼済みとして登録されています。次回のサインイン時にMFA認証をスキップできます。
                  </p>
                ) : (
                  <p>
                    このデバイスは未設定です。サインインの度にMFA認証が必要になります。
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#232f3e', marginBottom: '15px', fontSize: '16px' }}>
                セキュリティについて
              </h3>
              <div style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '10px' }}>
                  <strong>信頼済みデバイス機能を有効にする場合：</strong>
                </p>
                <ul style={{ paddingLeft: '20px', margin: '0' }}>
                  <li>他の人がこのデバイスにアクセスできないことを確認してください</li>
                  <li>共有デバイスでは有効にしないでください</li>
                  <li>デバイスを紛失した場合は速やかに管理者に連絡してください</li>
                  <li>定期的にデバイス設定を見直してください</li>
                </ul>
              </div>
            </div>

            <button
              className="submit-button"
              onClick={handleToggleRemember}
              disabled={loading}
            >
              {loading ? '設定変更中...' : 
               isRemembered ? 'デバイス記憶を解除' : 'このデバイスを記憶'}
            </button>

            <div className="auth-footer">
              <button
                type="button"
                className="link-button"
                onClick={onClose}
                disabled={loading}
              >
                ← 戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeviceSettings