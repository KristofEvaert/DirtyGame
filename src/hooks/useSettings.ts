import { useState, useEffect } from 'react'

// Cookie utility functions
const getCookie = (name: string): string | null => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export interface GameSettings {
  players: {
    names: string[]
    count: number
  }
  preferences: {
    soundEnabled: boolean
    timerDefault: number
    autoAdvanceDifficulty: boolean
  }
  gameOptions: {
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
    timerDefault: 90,
    autoAdvanceDifficulty: true
  },
  gameOptions: {
    showProgress: true
  }
}

export const useSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = getCookie('gameSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Clean up old format fields and ensure new structure
        return {
          players: parsed.players || defaultSettings.players,
          preferences: {
            soundEnabled: parsed.preferences?.soundEnabled ?? defaultSettings.preferences.soundEnabled,
            timerDefault: parsed.preferences?.timerDefault ?? defaultSettings.preferences.timerDefault,
            autoAdvanceDifficulty: parsed.preferences?.autoAdvanceDifficulty ?? defaultSettings.preferences.autoAdvanceDifficulty
          },
          gameOptions: {
            showProgress: parsed.gameOptions?.showProgress ?? defaultSettings.gameOptions.showProgress
          }
        }
      } catch (e) {
        console.log('Error parsing settings, using defaults:', e)
        return defaultSettings
      }
    }
    return defaultSettings
  })

  useEffect(() => {
    const handleSettingsChange = () => {
      const saved = getCookie('gameSettings')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Clean up old format fields and ensure new structure
          setSettings({
            players: parsed.players || defaultSettings.players,
            preferences: {
              soundEnabled: parsed.preferences?.soundEnabled ?? defaultSettings.preferences.soundEnabled,
              timerDefault: parsed.preferences?.timerDefault ?? defaultSettings.preferences.timerDefault,
              autoAdvanceDifficulty: parsed.preferences?.autoAdvanceDifficulty ?? defaultSettings.preferences.autoAdvanceDifficulty
            },
            gameOptions: {
              showProgress: parsed.gameOptions?.showProgress ?? defaultSettings.gameOptions.showProgress
            }
          })
        } catch (e) {
          console.log('Error parsing settings from change:', e)
        }
      }
    }

    // Listen for custom event when settings change
    window.addEventListener('settingsChanged', handleSettingsChange)

    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange)
    }
  }, [])

  return settings
}

export default useSettings
