import React, { useState, useEffect } from 'react'
import { Save, User, Users, Volume2, VolumeX, Palette, RotateCcw, Settings as SettingsIcon, Plus, Minus, Trash2, Cookie } from 'lucide-react'

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

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

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

const deleteAllGameCookies = () => {
  deleteCookie('gameSettings')
  deleteCookie('gameProgress')
  deleteCookie('diceGameProgress')
  deleteCookie('customCards')
}

interface GameSettings {
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

const Settings = () => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = getCookie('gameSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Handle migration from old format
        if (parsed.playerNames) {
          return {
            players: {
              names: [parsed.playerNames.player1 || 'You', parsed.playerNames.player2 || 'Your Partner'],
              count: 2
            },
            preferences: {
              soundEnabled: parsed.preferences?.soundEnabled ?? true,
              timerDefault: parsed.preferences?.timerDefault ?? 90,
              autoAdvanceDifficulty: parsed.preferences?.autoAdvanceDifficulty ?? true
            },
            gameOptions: {
              showProgress: parsed.gameOptions?.showProgress ?? true
            }
          }
        }
        // Clean up old format fields
        return {
          players: parsed.players || {
            names: ['You', 'Your Partner'],
            count: 2
          },
          preferences: {
            soundEnabled: parsed.preferences?.soundEnabled ?? true,
            timerDefault: parsed.preferences?.timerDefault ?? 90,
            autoAdvanceDifficulty: parsed.preferences?.autoAdvanceDifficulty ?? true
          },
          gameOptions: {
            showProgress: parsed.gameOptions?.showProgress ?? true
          }
        }
      } catch (e) {
        console.log('Error parsing settings, using defaults:', e)
      }
    }
    return {
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
  })

  const [unsavedChanges, setUnsavedChanges] = useState(false)

  // Save settings to cookies whenever they change
  useEffect(() => {
    setCookie('gameSettings', JSON.stringify(settings))
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('settingsChanged'))
  }, [settings])

  const updatePlayerName = (index: number, name: string) => {
    setSettings(prev => ({
      ...prev,
      players: {
        ...prev.players,
        names: prev.players.names.map((n, i) => i === index ? name : n)
      }
    }))
    setUnsavedChanges(true)
  }

  const addPlayer = () => {
    if (settings.players.count >= 8) return // Max 8 players
    
    setSettings(prev => ({
      ...prev,
      players: {
        names: [...prev.players.names, `Player ${prev.players.count + 1}`],
        count: prev.players.count + 1
      }
    }))
    setUnsavedChanges(true)
  }

  const removePlayer = (index: number) => {
    if (settings.players.count <= 2) return // Min 2 players
    
    setSettings(prev => ({
      ...prev,
      players: {
        names: prev.players.names.filter((_, i) => i !== index),
        count: prev.players.count - 1
      }
    }))
    setUnsavedChanges(true)
  }

  const updatePreference = <K extends keyof GameSettings['preferences']>(
    key: K, 
    value: GameSettings['preferences'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
    setUnsavedChanges(true)
  }

  const updateGameOption = <K extends keyof GameSettings['gameOptions']>(
    key: K, 
    value: GameSettings['gameOptions'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      gameOptions: {
        ...prev.gameOptions,
        [key]: value
      }
    }))
    setUnsavedChanges(true)
  }

  const saveSettings = () => {
    // Settings are automatically saved to localStorage via useEffect
    // This could be extended to save to a server in the future
    setUnsavedChanges(false)
  }

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
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
      setSettings(defaultSettings)
      setUnsavedChanges(false)
    }
  }

  const clearAllCookies = () => {
    if (confirm('Are you sure you want to delete all game data? This will reset everything including progress, custom cards, and settings. This cannot be undone.')) {
      deleteAllGameCookies()
      // Reset to default settings
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
      setSettings(defaultSettings)
      setUnsavedChanges(false)
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Settings</h1>
        <p className="text-gray-600">Customize your gaming experience</p>
      </div>

      {/* Player Management Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="mr-2" />
          Player Management
        </h2>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Players:</strong> {settings.players.count} players configured. Games will cycle through all players.
          </p>
        </div>

        <div className="space-y-3 mb-4">
          {settings.players.names.map((name, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  placeholder={`Player ${index + 1} name...`}
                  className="input-field"
                  maxLength={20}
                />
              </div>
              {settings.players.count > 2 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Remove player"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={addPlayer}
            disabled={settings.players.count >= 8}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              settings.players.count >= 8
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 hover:bg-green-200 text-green-700'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </button>
          
          <div className="text-sm text-gray-500 flex items-center">
            {settings.players.count >= 8 ? 'Maximum 8 players' : 
             settings.players.count <= 2 ? 'Minimum 2 players' : 
             `${8 - settings.players.count} more players can be added`}
          </div>
        </div>
      </div>

      {/* Game Preferences */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <SettingsIcon className="mr-2" />
          Game Preferences
        </h2>
        
        <div className="space-y-4">
          {/* Sound Settings */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {settings.preferences.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-green-600 mr-3" />
              ) : (
                <VolumeX className="w-5 h-5 text-red-600 mr-3" />
              )}
              <div>
                <h3 className="font-medium text-gray-800">Sound Effects</h3>
                <p className="text-sm text-gray-600">Enable timer and game sound effects</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferences.soundEnabled}
                onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>



          {/* Timer Default */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 text-orange-600 mr-3 text-center">⏰</div>
              <div>
                <h3 className="font-medium text-gray-800">Default Timer Duration</h3>
                <p className="text-sm text-gray-600">How long each dare should last by default</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="30"
                max="300"
                step="30"
                value={settings.preferences.timerDefault}
                onChange={(e) => updatePreference('timerDefault', parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                {formatTime(settings.preferences.timerDefault)}
              </span>
            </div>
          </div>

          {/* Auto Advance Difficulty */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-600 mr-3 text-center">🔥</div>
              <div>
                <h3 className="font-medium text-gray-800">Auto-Advance Difficulty</h3>
                <p className="text-sm text-gray-600">Automatically increase difficulty as you progress</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preferences.autoAdvanceDifficulty}
                onChange={(e) => updatePreference('autoAdvanceDifficulty', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Game Options */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <div className="w-5 h-5 text-blue-600 mr-2">🎮</div>
          Game Options
        </h2>
        
        <div className="space-y-4">
          {/* Show Progress */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-5 h-5 text-green-600 mr-3 text-center">📊</div>
              <div>
                <h3 className="font-medium text-gray-800">Show Progress Bars</h3>
                <p className="text-sm text-gray-600">Display progress and level information</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.gameOptions.showProgress}
                onChange={(e) => updateGameOption('showProgress', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>




        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={saveSettings}
          className={`btn-primary flex items-center px-6 py-3 ${
            unsavedChanges ? 'animate-pulse' : ''
          }`}
        >
          <Save className="mr-2 w-4 h-4" />
          {unsavedChanges ? 'Save Changes' : 'Settings Saved'}
        </button>
        
        <button
          onClick={resetSettings}
          className="btn-secondary flex items-center px-6 py-3"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Reset to Defaults
        </button>

        <button
          onClick={clearAllCookies}
          className="flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          <Cookie className="mr-2 w-4 h-4" />
          Clear All Data
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-purple-50 rounded-lg">
        <h3 className="font-semibold text-purple-800 mb-2">Multiplayer Features:</h3>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Support for 2-8 players</li>
          <li>• Games automatically cycle through all players</li>
          <li>• Each player gets their turn with personalized names</li>
          <li>• Progress tracking works across all players</li>
        </ul>
        

      </div>
    </div>
  )
}

export default Settings