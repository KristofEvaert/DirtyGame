import React, { useState, useEffect } from 'react'
import { Play, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, X, Target, Flame, Trophy } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

interface DiceResult {
  playerDice: number
  actionDice: number
  bodyDice: number
  targetDice?: number // Optional 4th dice for target player (only when >2 players)
}

interface DiceGameProgress {
  totalPoints: number
  currentLevel: 1 | 2 | 3
}

// Get actions and body regions from JSON data based on current level
// These will be populated dynamically when dice data loads
let diceData: any = null

// Level requirements (points needed to advance)
const LEVEL_REQUIREMENTS = {
  1: { min: 0, max: 19, name: 'Warm Up', color: 'green' },
  2: { min: 20, max: 49, name: 'Getting Hot', color: 'yellow' },
  3: { min: 50, max: 999, name: 'On Fire', color: 'red' }
}

const Dice = () => {
  const settings = useSettings()
  const [currentPlayer, setCurrentPlayer] = useState<string>('')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0)
  const [diceResult, setDiceResult] = useState<DiceResult | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [isGameActive, setIsGameActive] = useState(false)
  const [players, setPlayers] = useState<string[]>(settings.players.names)
  const [currentAction, setCurrentAction] = useState<string>('')
  const [currentBodyRegion, setCurrentBodyRegion] = useState<string>('')
  const [diceDataLoaded, setDiceDataLoaded] = useState<boolean>(false)
  const [loadedDiceData, setLoadedDiceData] = useState<any>(null)
  
  // Track used dice combinations to prevent duplicates
  const [usedCombinations, setUsedCombinations] = useState<Set<string>>(new Set())

  // Helper functions that use the loaded dice data
  const getActionsForLevel = (level: 1 | 2 | 3): string[] => {
    if (!loadedDiceData) return []
    switch (level) {
      case 1: return loadedDiceData.actionDice.level1 || []
      case 2: return loadedDiceData.actionDice.level2 || []
      case 3: return loadedDiceData.actionDice.level3 || []
      default: return loadedDiceData.actionDice.level1 || []
    }
  }

  const getBodyRegionsForLevel = (level: 1 | 2 | 3): string[] => {
    if (!loadedDiceData) return []
    switch (level) {
      case 1: return loadedDiceData.bodyDice.level1 || []
      case 2: return loadedDiceData.bodyDice.level2 || []
      case 3: return loadedDiceData.bodyDice.level3 || []
      default: return loadedDiceData.bodyDice.level1 || []
    }
  }

  // Load dice data dynamically on component mount
  useEffect(() => {
    const loadDiceData = async () => {
      try {
        const response = await fetch('/src/data/dice.json')
        const data = await response.json()
        setLoadedDiceData(data)
        setDiceDataLoaded(true)
      } catch (error) {
        console.error('Failed to load dice data:', error)
        // Fallback to empty structure if loading fails
        setLoadedDiceData({
          actionDice: { level1: [], level2: [], level3: [] },
          bodyDice: { level1: [], level2: [], level3: [] }
        })
        setDiceDataLoaded(true)
      }
    }

    loadDiceData()
  }, [])

  // Update players when settings change
  useEffect(() => {
    setPlayers(settings.players.names)
    if (currentPlayerIndex >= settings.players.names.length) {
      setCurrentPlayerIndex(0)
    }
  }, [settings.players.names, currentPlayerIndex])

  const [gameProgress, setGameProgress] = useState<DiceGameProgress>(() => {
    const saved = localStorage.getItem('diceGameProgress')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          totalPoints: parsed.totalPoints || 0,
          currentLevel: parsed.currentLevel || 1
        }
      } catch (e) {
        console.log('Error parsing saved dice progress, resetting:', e)
        return { totalPoints: 0, currentLevel: 1 }
      }
    }
    return { totalPoints: 0, currentLevel: 1 }
  })

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('diceGameProgress', JSON.stringify(gameProgress))
  }, [gameProgress])

  // Update level based on points (only auto-advance, don't auto-demote) - only if enabled
  useEffect(() => {
    if (!settings.preferences.autoAdvanceDifficulty) return
    
    let newLevel: 1 | 2 | 3 = 1
    if (gameProgress.totalPoints >= LEVEL_REQUIREMENTS[3].min) {
      newLevel = 3
    } else if (gameProgress.totalPoints >= LEVEL_REQUIREMENTS[2].min) {
      newLevel = 2
    }
    
    // Only auto-advance to higher levels, don't force lower levels
    if (newLevel > gameProgress.currentLevel) {
      setGameProgress(prev => ({ ...prev, currentLevel: newLevel }))
    }
  }, [gameProgress.totalPoints, settings.preferences.autoAdvanceDifficulty])

  const getDiceIcon = (value: number, size: string = "w-16 h-16", accentColor: string = "bg-red-500") => {
    const sizeClasses = size.includes('12') ? 'w-12 h-12' : 'w-16 h-16'
    const dotSize = size.includes('12') ? 'w-1.5 h-1.5' : 'w-2 h-2'
    
    const getDiceFace = (num: number) => {
      const FlameIcon = () => (
        <div className="text-sm">🔥</div>
      )
      
      switch (num) {
        case 1:
          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2 place-items-center">
              <div></div><div></div><div></div>
              <div></div><FlameIcon /><div></div>
              <div></div><div></div><div></div>
            </div>
          )
        case 2:
          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2 place-items-center">
              <FlameIcon /><div></div><div></div>
              <div></div><div></div><div></div>
              <div></div><div></div><FlameIcon />
            </div>
          )
        case 3:
          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2 place-items-center">
              <FlameIcon /><div></div><div></div>
              <div></div><FlameIcon /><div></div>
              <div></div><div></div><FlameIcon />
            </div>
          )
        case 4:
          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2 place-items-center">
              <FlameIcon /><div></div><FlameIcon />
              <div></div><div></div><div></div>
              <FlameIcon /><div></div><FlameIcon />
            </div>
          )
        case 5:
          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2 place-items-center">
              <FlameIcon /><div></div><FlameIcon />
              <div></div><FlameIcon /><div></div>
              <FlameIcon /><div></div><FlameIcon />
            </div>
          )
        case 6:
          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2 place-items-center">
              <FlameIcon /><div></div><FlameIcon />
              <FlameIcon /><div></div><FlameIcon />
              <FlameIcon /><div></div><FlameIcon />
            </div>
          )
        default:
          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2 place-items-center">
              <div></div><div></div><div></div>
              <div></div><div className="w-2 h-2 bg-gray-400 rounded-full opacity-30"></div><div></div>
              <div></div><div></div><div></div>
            </div>
          )
      }
    }

    return (
      <div className={`${sizeClasses} bg-white rounded-xl border-2 border-gray-300 shadow-xl relative transform transition-transform hover:scale-105`}
           style={{
             background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
             boxShadow: '6px 6px 12px #d1d1d1, -6px -6px 12px #ffffff'
           }}>
        {/* 3D effect borders */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white via-gray-50 to-gray-200 opacity-50"></div>
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {getDiceFace(value)}
        </div>
      </div>
    )
  }

  // Generate a unique key for a dice combination
  const getCombinationKey = (playerDice: number, actionDice: number, bodyDice: number, targetDice?: number) => {
    if (players.length > 2 && targetDice) {
      return `${playerDice}-${actionDice}-${bodyDice}-${targetDice}`
    }
    return `${playerDice}-${actionDice}-${bodyDice}`
  }

  // Get all possible combinations for the current player count
  const getAllPossibleCombinations = () => {
    const combinations: string[] = []
    for (let player = 1; player <= 6; player++) {
      for (let action = 1; action <= 6; action++) {
        for (let body = 1; body <= 6; body++) {
          if (players.length > 2) {
            // For 4-dice game, add target dice
            for (let target = 1; target <= 6; target++) {
              combinations.push(getCombinationKey(player, action, body, target))
            }
          } else {
            // For 3-dice game
            combinations.push(getCombinationKey(player, action, body))
          }
        }
      }
    }
    return combinations
  }

  // Check if we need to reset used combinations
  const getAvailableCombinations = () => {
    const allPossible = getAllPossibleCombinations()
    const unusedCombinations = allPossible.filter(combo => !usedCombinations.has(combo))
    
    // If no unused combinations available, reset the used combinations
    if (unusedCombinations.length === 0 && allPossible.length > 0) {
      console.log('All dice combinations used! Resetting available combinations...')
      setUsedCombinations(new Set())
      return allPossible
    }
    
    return unusedCombinations
  }

  const getNextPlayer = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length
    setCurrentPlayerIndex(nextIndex)
    return players[nextIndex]
  }

  const getRandomAction = (diceValue: number): string => {
    const actions = getActionsForLevel(gameProgress.currentLevel)
    const actionIndex = (diceValue - 1) % actions.length
    return actions[actionIndex]
  }

  const getRandomBodyRegion = (diceValue: number): string => {
    const regions = getBodyRegionsForLevel(gameProgress.currentLevel)
    const regionIndex = (diceValue - 1) % regions.length
    return regions[regionIndex]
  }

  const rollDice = async () => {
    if (isRolling || !diceDataLoaded) return

    setIsRolling(true)
    const nextPlayer = getNextPlayer()
    setCurrentPlayer(nextPlayer)
    
    // Animate dice rolling (3 or 4 dice depending on player count)
    let rollCount = 0
    const needsTargetDice = players.length > 2
    
    const rollAnimation = setInterval(() => {
      const rollingResult: DiceResult = {
        playerDice: Math.floor(Math.random() * 6) + 1,
        actionDice: Math.floor(Math.random() * 6) + 1,
        bodyDice: Math.floor(Math.random() * 6) + 1
      }
      
      if (needsTargetDice) {
        rollingResult.targetDice = Math.floor(Math.random() * 6) + 1
      }
      
      setDiceResult(rollingResult)
      rollCount++
      
      if (rollCount >= 8) {
        clearInterval(rollAnimation)
        
        // Get available combinations and select one
        const availableCombinations = getAvailableCombinations()
        
        if (availableCombinations.length === 0) {
          // This shouldn't happen, but fallback to random
          console.warn('No available combinations found, using random dice')
          const finalPlayerDice = Math.floor(Math.random() * 6) + 1
          const finalActionDice = Math.floor(Math.random() * 6) + 1
          const finalBodyDice = Math.floor(Math.random() * 6) + 1
          const finalTargetDice = needsTargetDice ? Math.floor(Math.random() * 6) + 1 : undefined
          
          const finalResult: DiceResult = {
            playerDice: finalPlayerDice,
            actionDice: finalActionDice,
            bodyDice: finalBodyDice,
            targetDice: finalTargetDice
          }
          
          setDiceResult(finalResult)
          
          // Generate the action and body region
          const action = getRandomAction(finalActionDice)
          const bodyRegion = getRandomBodyRegion(finalBodyDice)
          
          setCurrentAction(action)
          setCurrentBodyRegion(bodyRegion)
        } else {
          // Select a random unused combination
          const selectedCombination = availableCombinations[Math.floor(Math.random() * availableCombinations.length)]
          const diceParts = selectedCombination.split('-').map(Number)
          
          const finalPlayerDice = diceParts[0]
          const finalActionDice = diceParts[1]
          const finalBodyDice = diceParts[2]
          const finalTargetDice = needsTargetDice ? diceParts[3] : undefined
          
          const finalResult: DiceResult = {
            playerDice: finalPlayerDice,
            actionDice: finalActionDice,
            bodyDice: finalBodyDice,
            targetDice: finalTargetDice
          }
          
          setDiceResult(finalResult)
          
          // Mark this combination as used
          setUsedCombinations(prev => new Set([...prev, selectedCombination]))
          
          // Generate the action and body region
          const action = getRandomAction(finalActionDice)
          const bodyRegion = getRandomBodyRegion(finalBodyDice)
          
          setCurrentAction(action)
          setCurrentBodyRegion(bodyRegion)
        }
        
        setIsRolling(false)
      }
    }, 80)
  }

  const startGame = () => {
    setIsGameActive(true)
    setCurrentPlayerIndex(0)
    setCurrentPlayer(players[0])
    // Reset used combinations when starting a new game
    setUsedCombinations(new Set())
    rollDice()
  }

  const stopGame = () => {
    setIsGameActive(false)
    setCurrentAction('')
    setCurrentBodyRegion('')
    setCurrentPlayer('')
    setCurrentPlayerIndex(0)
    setDiceResult(null)
  }

  const completeAction = () => {
    if (!currentAction || !currentPlayer || !diceResult) return

    // Same point system as dare game: +2 points for completing
    setGameProgress(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + 2
    }))

    // If game is active, roll again after a short delay
    if (isGameActive) {
      setTimeout(() => {
        rollDice()
      }, 500)
    } else {
      setCurrentAction('')
      setCurrentBodyRegion('')
      setCurrentPlayer('')
      setDiceResult(null)
    }
  }

  const skipAction = () => {
    if (!currentAction || !currentPlayer) return

    // Same point system as dare game: -1 point for skipping
    setGameProgress(prev => ({
      ...prev,
      totalPoints: Math.max(0, prev.totalPoints - 1) // Don't go below 0
    }))

    // If game is active, roll again
    if (isGameActive) {
      setTimeout(() => {
        rollDice()
      }, 500)
    } else {
      setCurrentAction('')
      setCurrentBodyRegion('')
      setCurrentPlayer('')
      setDiceResult(null)
    }
  }

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all dice game progress? This cannot be undone.')) {
      const resetProgress: DiceGameProgress = { totalPoints: 0, currentLevel: 1 }
      setGameProgress(resetProgress)
      // Reset used combinations when resetting progress
      setUsedCombinations(new Set())
      stopGame()
    }
  }

  const heatUp = () => {
    setGameProgress(prev => {
      let newLevel: 1 | 2 | 3 = prev.currentLevel
      if (prev.currentLevel < 3) {
        newLevel = (prev.currentLevel + 1) as 1 | 2 | 3
      }
      // Set points to the minimum required for the new level
      const newPoints = LEVEL_REQUIREMENTS[newLevel].min
      return { ...prev, currentLevel: newLevel, totalPoints: newPoints }
    })
    
    // If game is active, roll new dice with the new level
    if (isGameActive) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        rollDice()
      }, 100)
    }
  }

  const coolDown = () => {
    setGameProgress(prev => {
      let newLevel: 1 | 2 | 3 = prev.currentLevel
      if (prev.currentLevel > 1) {
        newLevel = (prev.currentLevel - 1) as 1 | 2 | 3
      }
      // Set points to the minimum required for the new level
      const newPoints = LEVEL_REQUIREMENTS[newLevel].min
      return { ...prev, currentLevel: newLevel, totalPoints: newPoints }
    })
    
    // If game is active, roll new dice with the new level
    if (isGameActive) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        rollDice()
      }, 100)
    }
  }

  const getLevelIcon = (level: 1 | 2 | 3): React.ReactElement => {
    switch (level) {
      case 1: return <Target className="w-4 h-4" />
      case 2: return <Flame className="w-4 h-4" />
      case 3: return <Trophy className="w-4 h-4" />
    }
  }

  const getLevelColor = (level: 1 | 2 | 3) => {
    switch (level) {
      case 1: return 'text-green-600'
      case 2: return 'text-yellow-600'
      case 3: return 'text-red-600'
    }
  }

  const getLevelName = (level: 1 | 2 | 3) => {
    return LEVEL_REQUIREMENTS[level].name
  }

  const getCurrentLevelProgress = () => {
    const currentReq = LEVEL_REQUIREMENTS[gameProgress.currentLevel]
    const nextLevel = gameProgress.currentLevel < 3 ? gameProgress.currentLevel + 1 : 3
    const nextReq = LEVEL_REQUIREMENTS[nextLevel as 1 | 2 | 3]
    
    if (gameProgress.currentLevel === 3) {
      return { 
        progress: Math.min(gameProgress.totalPoints - currentReq.min, 50), 
        max: 50,
        percentage: Math.min(((gameProgress.totalPoints - currentReq.min) / 50) * 100, 100)
      }
    }
    
    const progress = gameProgress.totalPoints - currentReq.min
    const max = nextReq.min - currentReq.min
    const percentage = (progress / max) * 100
    
    return { progress, max, percentage }
  }

  const getPerformerPlayer = (playerDiceValue: number): string => {
    // Use the player dice to determine who performs the action
    const performerIndex = (playerDiceValue - 1) % players.length
    return players[performerIndex]
  }

  const getTargetPlayer = (targetDiceValue: number, performerDiceValue: number): string => {
    // Use the target dice to determine who receives the action
    // Make sure target is different from performer
    const availablePlayers = players.filter((_, index) => index !== ((performerDiceValue - 1) % players.length))
    const targetIndex = (targetDiceValue - 1) % availablePlayers.length
    return availablePlayers[targetIndex]
  }

  const getTargetPlayerFor2Players = (performerPlayer: string): string => {
    // For 2 players, target is always the other player
    return players.find(p => p !== performerPlayer) || players[0]
  }

  const levelProgress = getCurrentLevelProgress()

  if (!diceDataLoaded) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="text-6xl mb-4">🎲</div>
          <h2 className="text-2xl font-bold text-purple-800 mb-2">Loading Dice Data...</h2>
          <p className="text-gray-600">Please wait while we load the latest dice content.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-purple-800 mb-1">Spicy Dice Game</h1>
        <p className="text-sm text-gray-600">
          Roll {players.length > 2 ? '4' : '3'} dice to determine who does what to {players.length > 2 ? 'whom' : 'where'}!
        </p>
      </div>



      {/* Level Progress - Only show if enabled */}
      {settings.gameOptions.showProgress && (
        <div className="card mb-3 py-3">
          <h2 className="text-base font-semibold mb-2 flex items-center justify-center">
            {getLevelIcon(gameProgress.currentLevel)}
            <span className={`ml-2 ${getLevelColor(gameProgress.currentLevel)}`}>
              Level {gameProgress.currentLevel}: {getLevelName(gameProgress.currentLevel)}
            </span>
          </h2>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  gameProgress.currentLevel === 1 ? 'bg-green-600' :
                  gameProgress.currentLevel === 2 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${levelProgress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="card mb-3 py-3">
        <div className="text-center">
          {!isGameActive ? (
            <>
              <button
                onClick={startGame}
                className="btn-primary text-base px-6 py-3 flex items-center mx-auto"
                disabled={isRolling}
              >
                <Play className="mr-2 w-4 h-4" />
                Start {players.length > 2 ? '4' : '3'}-Dice Game
              </button>
              
              <div className="mt-3 flex gap-2 justify-center">
                <button
                  onClick={coolDown}
                  disabled={gameProgress.currentLevel === 1}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors text-white ${
                    gameProgress.currentLevel === 1
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  }`}
                >
                  ❄️ Cool
                </button>
                
                <button
                  onClick={heatUp}
                  disabled={gameProgress.currentLevel === 3}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors text-white ${
                    gameProgress.currentLevel === 3
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                  }`}
                >
                  🔥 Heat
                </button>
                
                <button
                  onClick={resetProgress}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  <RotateCcw className="mr-1 w-4 h-4" />
                  Reset
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 justify-center items-center flex-wrap">
              <button
                onClick={stopGame}
                className="px-4 py-2 flex items-center text-sm font-medium rounded transition-colors bg-red-100 hover:bg-red-200 text-red-700"
              >
                <X className="mr-1 w-4 h-4" />
                Stop
              </button>
              
              <button
                onClick={coolDown}
                disabled={gameProgress.currentLevel === 1}
                className={`px-2 py-2 text-sm font-medium rounded transition-colors text-white ${
                  gameProgress.currentLevel === 1
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                ❄️
              </button>
              
              <button
                onClick={rollDice}
                disabled={isRolling}
                className={`text-base px-5 py-2 flex items-center font-semibold rounded-lg transition-colors ${
                  isRolling 
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isRolling ? 'Rolling...' : `Roll ${players.length > 2 ? '4' : '3'} Dice`}
              </button>
              
              <button
                onClick={heatUp}
                disabled={gameProgress.currentLevel === 3}
                className={`px-2 py-2 text-sm font-medium rounded transition-colors text-white ${
                  gameProgress.currentLevel === 3
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                }`}
              >
                🔥
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dice Display */}
      <div className="card mb-3 py-3">
        <div className="text-center">
          <h2 className="text-base font-semibold mb-3">
            {players.length > 2 ? 'The 4 Dice' : 'The 3 Dice'}
          </h2>
          
          <div className={`grid ${players.length > 2 ? 'grid-cols-4' : 'grid-cols-3'} gap-3 mb-3`}>
            {/* Player Dice */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">WHO</h3>
              <div className={`inline-flex items-center justify-center ${
                isRolling ? 'animate-bounce' : ''
              }`}>
                <div className={`transition-transform duration-200 ${isRolling ? 'animate-spin' : ''}`}>
                  {getDiceIcon(diceResult?.playerDice || 0, "w-16 h-16", "bg-blue-600")}
                </div>
              </div>
              {diceResult && !isRolling && (
                <p className="text-xs text-gray-600 mt-1">
                  {getPerformerPlayer(diceResult.playerDice)}
                </p>
              )}
            </div>

            {/* Action Dice */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">WHAT</h3>
              <div className={`inline-flex items-center justify-center ${
                isRolling ? 'animate-bounce' : ''
              }`}>
                <div className={`${isRolling ? 'animate-spin' : ''}`}>
                  {getDiceIcon(diceResult?.actionDice || 0, "w-16 h-16", "bg-purple-600")}
                </div>
              </div>
              {currentAction && !isRolling && (
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {currentAction}
                </p>
              )}
            </div>

            {/* Target Dice - Only show when >2 players */}
            {players.length > 2 && (
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">TO WHOM</h3>
                <div className={`inline-flex items-center justify-center ${
                  isRolling ? 'animate-bounce' : ''
                }`}>
                  <div className={`${isRolling ? 'animate-spin' : ''}`}>
                    {getDiceIcon(diceResult?.targetDice || 0, "w-16 h-16", "bg-green-600")}
                  </div>
                </div>
                {diceResult && diceResult.targetDice && !isRolling && (
                  <p className="text-xs text-gray-600 mt-1">
                    {getTargetPlayer(diceResult.targetDice, diceResult.playerDice)}
                  </p>
                )}
              </div>
            )}

            {/* Body Dice */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">WHERE</h3>
              <div className={`inline-flex items-center justify-center ${
                isRolling ? 'animate-bounce' : ''
              }`}>
                <div className={`${isRolling ? 'animate-spin' : ''}`}>
                  {getDiceIcon(diceResult?.bodyDice || 0, "w-16 h-16", "bg-pink-600")}
                </div>
              </div>
              {currentBodyRegion && !isRolling && (
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {currentBodyRegion}
                </p>
              )}
            </div>
          </div>
          
          {isRolling && (
            <div className="text-lg text-gray-600">
              Rolling all {players.length > 2 ? '4' : '3'} dice...
            </div>
          )}
        </div>
      </div>

      {/* Action Result Display */}
      {diceResult && currentAction && currentBodyRegion && !isRolling && (
        <div className="card mb-3 py-4">
          <div className="text-center">
            <div className="mb-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                gameProgress.currentLevel === 1 ? 'bg-green-100 text-green-800' :
                gameProgress.currentLevel === 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                LEVEL {gameProgress.currentLevel}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="text-3xl mb-1">
                {players.length > 2 ? '🎲🎲🎲🎲' : '🎲🎲🎲'}
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                DICE RESULT
              </h2>
            </div>

            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg p-4 mb-3">
              <p className="text-base text-gray-800 leading-relaxed">
                <span className="font-bold text-blue-600">{getPerformerPlayer(diceResult.playerDice)}</span>
                {' '}should{' '}
                <span className="font-bold text-purple-600">{currentAction.toLowerCase()}</span>
                {players.length > 2 && diceResult.targetDice ? (
                  <>
                    {' '}<span className="font-bold text-green-600">{getTargetPlayer(diceResult.targetDice, diceResult.playerDice)}'s</span>{' '}
                    <span className="font-bold text-pink-600">{currentBodyRegion}</span>
                  </>
                ) : (
                  <>
                    {' '}your{' '}
                    <span className="font-bold text-pink-600">{currentBodyRegion}</span>
                  </>
                )}
              </p>
              
              <div className="mt-3 text-xs text-gray-600">
                Points: +2 for completing | -1 for skipping
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={completeAction}
                className="btn-primary flex items-center px-4 py-2 text-sm"
              >
                ✅ Done (+2)
              </button>
              <button
                onClick={skipAction}
                className="btn-secondary flex items-center px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700"
              >
                <X className="mr-1 w-4 h-4" />
                Skip (-1)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dice
