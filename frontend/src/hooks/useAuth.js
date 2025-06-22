import { useState, useEffect } from 'react'
import { getCurrentUser, signOut } from 'aws-amplify/auth'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(true)
    } catch (error) {
      console.log('User not authenticated')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    checkAuthState,
    logout
  }
}