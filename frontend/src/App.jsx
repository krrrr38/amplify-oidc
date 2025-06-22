import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './components/Home'
import Dashboard from './components/Dashboard'
import AuthScreen from './components/Auth/AuthScreen'
import AuthCallback from './components/Auth/AuthCallback'
import AuthLogout from './components/Auth/AuthLogout'
import ConfirmSignUp from './components/Auth/ConfirmSignUp'
import MFASetup from './components/Auth/MFASetup'
import DeviceSettings from './components/Auth/DeviceSettings'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/logout" element={<AuthLogout />} />
        <Route path="/auth/confirm-signup" element={<ConfirmSignUp />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/mfa-setup" 
          element={
            <ProtectedRoute>
              <MFASetup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/device-settings" 
          element={
            <ProtectedRoute>
              <DeviceSettings onClose={() => window.history.back()} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  )
}

export default App