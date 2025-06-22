import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Dashboard = () => {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleMFASetup = () => {
    navigate('/mfa-setup')
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>ダッシュボード</h1>
        <p>認証済みユーザーエリア</p>
      </div>

      <div className="card">
        <h2>ユーザー情報</h2>
        {user && (
          <div style={{ textAlign: 'left' }}>
            <p><strong>ユーザーID:</strong> {user.userId}</p>
            <p><strong>ユーザー名:</strong> {user.username}</p>
            <p><strong>サインイン方法:</strong> {user.signInDetails?.loginId}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>セキュリティ設定</h3>
        <p>
          セキュリティを強化するため、MFA (多要素認証) の設定を推奨します。
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="button secondary" onClick={handleMFASetup}>
            MFA TOTP 設定
          </button>
          <button 
            className="button secondary" 
            onClick={() => navigate('/device-settings')}
          >
            デバイス設定
          </button>
        </div>
      </div>

      <div className="card">
        <h3>アプリケーション機能</h3>
        <p>
          ここに認証が必要な機能を追加できます。
          現在のユーザーはログイン済みのため、全ての機能にアクセス可能です。
        </p>
      </div>

      <div className="card">
        <button className="button" onClick={handleSignOut}>
          サインアウト
        </button>
      </div>
    </div>
  )
}

export default Dashboard