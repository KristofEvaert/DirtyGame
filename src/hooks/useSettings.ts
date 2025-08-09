import { useState, useEffect } from 'react'

export interface GameSettings {
  players: {
    names: string[]
    count: number
  }
  preferences: {
    soundEnabled: boolean
    theme: 'default' | 'dark' | 'romantic'
    timerDefault: number
    autoAdvanceDifficulty: boolean
  }
  gameOptions: {
    showPlayerPhotos: boolean
    enableCustomCards: boolean
    showProgress: boolean
  }
}

const defaultSettings: GameSettings = {
  players: {
    names: ['You', 'Your Partner'],
    count: 2
  },
  preferences: {
    soundEnabled: true,
    theme: 'default',
    timerDefault: 90,
    autoAdvanceDifficulty: true
  },
  gameOptions: {
    showPlayerPhotos: false,
    enableCustomCards: true,
    showProgress: true
  }
}

export const useSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('gameSettings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.log('Error parsing settings, using defaults:', e)
        return defaultSettings
      }
    }
    return defaultSettings
  })

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('gameSettings')
      if (saved) {
        try {
          setSettings(JSON.parse(saved))
        } catch (e) {
          console.log('Error parsing settings from storage change:', e)
        }
      }
    }

    // Listen for changes to localStorage (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event when settings change in the same tab
    window.addEventListener('settingsChanged', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('settingsChanged', handleStorageChange)
    }
  }, [])

  return settings
}

export default useSettings
