import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Cognito Sample App</h1>
        <p>AWS Cognito with MFA TOTP Demo</p>
      </div>
      
      <div className="card">
        <h2>Welcome</h2>
        <p>
          このアプリは AWS Cognito を使用した認証システムのデモです。
          以下の機能を提供します：
        </p>
        <ul style={{ textAlign: 'left', margin: '20px 0' }}>
          <li>ユーザー登録・サインイン</li>
          <li>MFA TOTP (時間ベース ワンタイムパスワード)</li>
          <li>カスタマイズされたログイン画面</li>
          <li>セキュアな認証フロー</li>
        </ul>
        
        <button className="button" onClick={handleLogin}>
          ログイン / サインアップ
        </button>
      </div>
      
      <div className="card">
        <h3>使用方法</h3>
        <ol style={{ textAlign: 'left', margin: '20px 0' }}>
          <li>「ログイン / サインアップ」ボタンをクリック</li>
          <li>初回の場合はアカウントを作成</li>
          <li>メール認証を完了</li>
          <li>MFA TOTPを設定（推奨）</li>
          <li>ダッシュボードにアクセス</li>
        </ol>
      </div>
    </div>
  )
}

export default Home