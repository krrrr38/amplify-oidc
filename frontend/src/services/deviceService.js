import { rememberDevice, forgetDevice } from 'aws-amplify/auth'

export const deviceService = {
  // デバイスを信頼済みとして記憶
  async rememberCurrentDevice() {
    try {
      await rememberDevice()
      console.log('Device remembered successfully')
      return true
    } catch (error) {
      console.error('Failed to remember device:', error)
      return false
    }
  },

  // デバイスの記憶を解除
  async forgetCurrentDevice() {
    try {
      await forgetDevice()
      console.log('Device forgotten successfully')
      return true
    } catch (error) {
      console.error('Failed to forget device:', error)
      return false
    }
  },

  // ローカルストレージでデバイス記憶状態を管理
  setDeviceRemembered(remembered) {
    localStorage.setItem('deviceRemembered', JSON.stringify(remembered))
  },

  isDeviceRemembered() {
    const remembered = localStorage.getItem('deviceRemembered')
    return remembered ? JSON.parse(remembered) : false
  },

  // デバイス設定をクリア
  clearDeviceSettings() {
    localStorage.removeItem('deviceRemembered')
  }
}