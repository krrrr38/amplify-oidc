import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthLogout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // ログアウト完了後の処理
    const handleLogout = () => {
      // 3秒後にホームページにリダイレクト
      setTimeout(() => {
        navigate('/')
      }, 3000)
    }

    handleLogout()
  }, [navigate])

  return (
    <div className="container">
      <div className="card">
        <h2>ログアウト完了</h2>
        <div className="success">
          <p>正常にログアウトしました。</p>
          <p>3秒後にホームページにリダイレクトします。</p>
        </div>
        
        <button 
          className="button" 
          onClick={() => navigate('/')}
        >
          今すぐホームページに戻る
        </button>
      </div>
    </div>
  )
}

export default AuthLogout