import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from 'aws-amplify/auth'

const AuthCallback = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // OAuth認証完了後の処理
        const user = await getCurrentUser()
        
        if (user) {
          // 認証成功：ダッシュボードにリダイレクト
          navigate('/dashboard')
        } else {
          // 認証失敗：ホームページにリダイレクト
          navigate('/')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setError('認証処理中にエラーが発生しました。')
        
        // エラー発生時は3秒後にホームページにリダイレクト
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>認証処理中...</h2>
          <p>しばらくお待ちください。</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>認証エラー</h2>
          <div className="error">
            <p>{error}</p>
            <p>3秒後にホームページにリダイレクトします。</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h2>リダイレクト中...</h2>
      </div>
    </div>
  )
}

export default AuthCallback