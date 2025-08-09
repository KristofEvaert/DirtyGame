import React, { useState, useEffect } from 'react'
import { Play, Trophy, Target, Flame, RotateCcw, X, Pause, Plus, Minus, PlusCircle } from 'lucide-react'
import cardsData from '../data/cards.json'
import { useSettings } from '../hooks/useSettings'

interface GameCard {
  id: string
  type: 'dare'
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface GameProgress {
  totalPoints: number
  currentDifficulty: 'easy' | 'medium' | 'hard'
}

const Game = () => {
  const settings = useSettings()
  const [currentPlayer, setCurrentPlayer] = useState<string>('')
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0)
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null)

  const [isGameActive, setIsGameActive] = useState(false)
  const [players, setPlayers] = useState<string[]>(settings.players.names)

  // Update players when settings change
  useEffect(() => {
    setPlayers(settings.players.names)
    // Reset current player index if it's out of bounds
    if (currentPlayerIndex >= settings.players.names.length) {
      setCurrentPlayerIndex(0)
    }
  }, [settings.players.names, currentPlayerIndex])
  const [dareCards, setDareCards] = useState<GameCard[]>(() => {
    const defaultCards = cardsData.dareCards as GameCard[]
    const saved = localStorage.getItem('customCards')
    const customCards = saved ? JSON.parse(saved) : []
    return [...defaultCards, ...customCards]
  })
  const [timeLeft, setTimeLeft] = useState<number>(settings.preferences.timerDefault)
  const [timerActive, setTimerActive] = useState<boolean>(false)
  const [defaultTimerDuration, setDefaultTimerDuration] = useState<number>(settings.preferences.timerDefault)
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false)
  const [customCards, setCustomCards] = useState<GameCard[]>(() => {
    const saved = localStorage.getItem('customCards')
    return saved ? JSON.parse(saved) : []
  })
  const [newCardContent, setNewCardContent] = useState<string>('')
  const [newCardDifficulty, setNewCardDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  
  // Track used cards to prevent duplicates
  const [usedCardIds, setUsedCardIds] = useState<Set<string>>(new Set())
  const [availableCardsCount, setAvailableCardsCount] = useState<{[key: string]: number}>({
    easy: 0,
    medium: 0,
    hard: 0
  })
  
  // Unified progress system
  const [gameProgress, setGameProgress] = useState<GameProgress>(() => {
    const saved = localStorage.getItem('gameProgress')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Handle migration from old format
        if (parsed.currentLevel !== undefined) {
          // Old format - convert level to difficulty
          let difficulty: 'easy' | 'medium' | 'hard' = 'easy'
          if (parsed.currentLevel <= 3) {
            difficulty = 'easy'
          } else if (parsed.currentLevel <= 6) {
            difficulty = 'medium'
          } else {
            difficulty = 'hard'
          }
          return { totalPoints: parsed.totalPoints || 0, currentDifficulty: difficulty }
        }
        // New format - ensure it has the right structure
        return {
          totalPoints: parsed.totalPoints || 0,
          currentDifficulty: parsed.currentDifficulty || 'easy'
        }
      } catch (e) {
        console.log('Error parsing saved progress, resetting:', e)
        return { totalPoints: 0, currentDifficulty: 'easy' }
      }
    }
    return { totalPoints: 0, currentDifficulty: 'easy' }
  })

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('gameProgress', JSON.stringify(gameProgress))
  }, [gameProgress])

  // Save custom cards to localStorage and update available counts
  useEffect(() => {
    localStorage.setItem('customCards', JSON.stringify(customCards))
    // Update dareCards when customCards changes
    const defaultCards = cardsData.dareCards as GameCard[]
    const allCards = [...defaultCards, ...customCards]
    setDareCards(allCards)
    
    // Update available cards count
    const counts = { easy: 0, medium: 0, hard: 0 }
    allCards.forEach(card => {
      counts[card.difficulty]++
    })
    setAvailableCardsCount(counts)
  }, [customCards])

  // Update available counts when dareCards change
  useEffect(() => {
    const counts = { easy: 0, medium: 0, hard: 0 }
    dareCards.forEach(card => {
      counts[card.difficulty]++
    })
    setAvailableCardsCount(counts)
  }, [dareCards])

  // Timer effect
  useEffect(() => {
    let interval: number | null = null
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            // Timer ran out - play naughty sound
            playNaughtySound()
            setTimerActive(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else if (!timerActive) {
      if (interval) clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeLeft])

  const playNaughtySound = () => {
    // Only play sound if enabled in settings
    if (!settings.preferences.soundEnabled) {
      // Fallback: show alert if sound is disabled
      alert('⏰ Time\'s up! Better get moving... 😈')
      return
    }
    
    // Create audio context for naughty sound effect
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Create a series of tones for a playful "naughty" sound
      const playTone = (frequency: number, duration: number, delay: number) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
          oscillator.type = 'sine'
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + duration)
        }, delay)
      }
      
      // Play a playful descending tone sequence
      playTone(800, 0.2, 0)    // High
      playTone(600, 0.2, 200)  // Medium
      playTone(400, 0.3, 400)  // Low
      playTone(500, 0.4, 700)  // Back up with longer tone
      
    } catch (error) {
      console.log('Audio not supported:', error)
      // Fallback: show alert
      alert('⏰ Time\'s up! Better get moving... 😈')
    }
  }

  const startTimer = () => {
    setTimerActive(true)
  }

  const pauseTimer = () => {
    setTimerActive(false)
  }

  const stopTimer = () => {
    setTimerActive(false)
    setTimeLeft(defaultTimerDuration) // Reset to user's preferred duration
  }

  const adjustTime = (seconds: number) => {
    setTimeLeft(prev => {
      const newTime = prev + seconds
      // Min 30 seconds (0.5 min), Max 150 seconds (2.5 min)
      const adjustedTime = Math.max(30, Math.min(150, newTime))
      // Update the default duration when user adjusts time
      setDefaultTimerDuration(adjustedTime)
      return adjustedTime
    })
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const addCustomCard = () => {
    if (!newCardContent.trim()) return

    const newCard: GameCard = {
      id: `custom-${Date.now()}`,
      type: 'dare',
      content: newCardContent.trim(),
      difficulty: newCardDifficulty
    }

    setCustomCards(prev => [...prev, newCard])
    setNewCardContent('')
    setNewCardDifficulty('easy')
    setShowAddCardModal(false)
  }

  const removeCustomCard = (cardId: string) => {
    setCustomCards(prev => prev.filter(card => card.id !== cardId))
  }

  const getNextPlayer = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length
    setCurrentPlayerIndex(nextIndex)
    return players[nextIndex]
  }



  const getAvailableCards = () => {
    const cardsForDifficulty = dareCards.filter(card => card.difficulty === gameProgress.currentDifficulty)
    const unusedCards = cardsForDifficulty.filter(card => !usedCardIds.has(card.id))
    
    // If no unused cards available, reset the used cards for this difficulty and use all cards again
    if (unusedCards.length === 0 && cardsForDifficulty.length > 0) {
      console.log(`All ${gameProgress.currentDifficulty} cards used! Resetting available cards...`)
      // Reset only the used cards for the current difficulty
      const usedCardsForOtherDifficulties = new Set<string>()
      dareCards.forEach(card => {
        if (card.difficulty !== gameProgress.currentDifficulty && usedCardIds.has(card.id)) {
          usedCardsForOtherDifficulties.add(card.id)
        }
      })
      setUsedCardIds(usedCardsForOtherDifficulties)
      return cardsForDifficulty
    }
    
    return unusedCards
  }

  const drawCard = () => {
    const nextPlayer = getNextPlayer()
    setCurrentPlayer(nextPlayer)
    
    const availableCards = getAvailableCards()
    
    if (availableCards.length === 0) {
      alert('No cards available for this level!')
      return
    }

    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)]
    setCurrentCard(randomCard)
    
    // Mark this card as used
    setUsedCardIds(prev => new Set([...prev, randomCard.id]))
    
    // Reset timer to user's preferred duration for new card
    setTimeLeft(defaultTimerDuration)
    setTimerActive(false) // Don't auto-start timer - let user control it
  }

  const startGame = () => {
    setIsGameActive(true)
    setCurrentPlayerIndex(0) // Start with first player
    setCurrentPlayer(players[0])
    drawCard()
  }

  const stopGame = () => {
    setIsGameActive(false)
    setCurrentCard(null)
    setCurrentPlayer('')
    setCurrentPlayerIndex(0) // Reset to first player
    stopTimer() // Stop timer when game stops
  }

  const resetUsedCards = () => {
    if (confirm('Reset used cards? This will allow all cards to appear again in the current session.')) {
      setUsedCardIds(new Set())
      alert('All cards are now available again!')
    }
  }

  const completeCard = () => {
    if (!currentCard || !currentPlayer) return

    // Add 2 points for completing a dare
    setGameProgress(prev => {
      const newPoints = Math.max(0, prev.totalPoints + 2)
      let newDifficulty = prev.currentDifficulty
      
      // Auto-advance difficulty when progress bar fills up (every 50 points)
      if (newPoints >= 50 && newPoints % 50 === 0) {
        if (prev.currentDifficulty === 'easy') {
          newDifficulty = 'medium'
          console.log('Auto-advancing from Easy to Medium!')
          // Reset points when advancing level
          return {
            totalPoints: 0,
            currentDifficulty: newDifficulty
          }
        } else if (prev.currentDifficulty === 'medium') {
          newDifficulty = 'hard'
          console.log('Auto-advancing from Medium to Hard!')
          // Reset points when advancing level
          return {
            totalPoints: 0,
            currentDifficulty: newDifficulty
          }
        }
        // Don't auto-advance from Hard - let them stay there or manually go back
      }
      
      return {
        totalPoints: newPoints,
        currentDifficulty: newDifficulty
      }
    })

    // If game is active, automatically draw the next card
    if (isGameActive) {
      drawCard()
    } else {
      setCurrentCard(null)
      setCurrentPlayer('')
    }
  }

  const skipCard = () => {
    if (!currentCard || !currentPlayer) return

    // Lose 1 point for skipping a dare
    setGameProgress(prev => {
      const newPoints = prev.totalPoints - 1
      let newDifficulty = prev.currentDifficulty
      
      // Auto-downgrade difficulty when points go below 0
      if (newPoints < 0) {
        if (prev.currentDifficulty === 'hard') {
          newDifficulty = 'medium'
          console.log('Auto-downgrading from Hard to Medium due to negative points!')
          // Reset to max points of previous level (50 points)
          return {
            totalPoints: 49, // Almost full progress bar at medium level
            currentDifficulty: newDifficulty
          }
        } else if (prev.currentDifficulty === 'medium') {
          newDifficulty = 'easy'
          console.log('Auto-downgrading from Medium to Easy due to negative points!')
          // Reset to max points of previous level (50 points)
          return {
            totalPoints: 49, // Almost full progress bar at easy level
            currentDifficulty: newDifficulty
          }
        } else {
          // Already at Easy level - can't go lower, just stay at 0 points
          return {
            totalPoints: 0,
            currentDifficulty: 'easy'
          }
        }
      }
      
      return {
        totalPoints: Math.max(0, newPoints),
        currentDifficulty: newDifficulty
      }
    })

    // Stop timer when card is skipped
    stopTimer()

    // If game is active, automatically draw the next card
    if (isGameActive) {
      drawCard()
    } else {
      setCurrentCard(null)
      setCurrentPlayer('')
    }
  }

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      const resetProgress: GameProgress = { totalPoints: 0, currentDifficulty: 'easy' }
      setGameProgress(resetProgress)
      stopGame()
    }
  }

  const heatUp = () => {
    console.log('Heating up from:', gameProgress.currentDifficulty)
    setGameProgress(prev => {
      let newDifficulty: 'easy' | 'medium' | 'hard' = prev.currentDifficulty
      if (prev.currentDifficulty === 'easy') {
        newDifficulty = 'medium'
      } else if (prev.currentDifficulty === 'medium') {
        newDifficulty = 'hard'
      }
      // If already at hard, stay at hard
      console.log('New difficulty:', newDifficulty)
      // Reset points when manually changing difficulty
      return { totalPoints: 0, currentDifficulty: newDifficulty }
    })
    
    // If game is active, draw a new card with the new difficulty
    if (isGameActive) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        drawCard()
      }, 100)
    }
  }

  const coolDown = () => {
    console.log('Cooling down from:', gameProgress.currentDifficulty)
    setGameProgress(prev => {
      let newDifficulty: 'easy' | 'medium' | 'hard' = prev.currentDifficulty
      if (prev.currentDifficulty === 'hard') {
        newDifficulty = 'medium'
      } else if (prev.currentDifficulty === 'medium') {
        newDifficulty = 'easy'
      }
      // If already at easy, stay at easy
      console.log('New difficulty:', newDifficulty)
      // Reset points when manually changing difficulty
      return { totalPoints: 0, currentDifficulty: newDifficulty }
    })
    
    // If game is active, draw a new card with the new difficulty
    if (isGameActive) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        drawCard()
      }, 100)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelIcon = (difficulty: 'easy' | 'medium' | 'hard'): React.ReactElement => {
    switch (difficulty) {
      case 'easy': return <Target className="w-4 h-4" />
      case 'medium': return <Flame className="w-4 h-4" />
      case 'hard': return <Trophy className="w-4 h-4" />
    }
  }

  const getLevelColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
    }
  }

  const getLevelName = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 'Easy'
      case 'medium': return 'Medium'
      case 'hard': return 'Hard'
    }
  }

  const getHeatUpText = () => {
    switch (gameProgress.currentDifficulty) {
      case 'easy': return "Ready for something steamier? 🔥"
      case 'medium': return "Time to get really naughty... 😈"
      case 'hard': return "You're already at maximum heat! 🌶️"
    }
  }

  const getCoolDownText = () => {
    switch (gameProgress.currentDifficulty) {
      case 'easy': return "You're already at the coolest level! ❄️"
      case 'medium': return "Need to cool things down? 🧊"
      case 'hard': return "Too hot to handle? Cool it down... ❄️"
    }
  }

  const getHeatUpButtonText = () => {
    switch (gameProgress.currentDifficulty) {
      case 'easy': return "🔥 Heat Up"
      case 'medium': return "😈 Get Wild"
      case 'hard': return "🌶️ Max Heat"
    }
  }

  const getCoolDownButtonText = () => {
    switch (gameProgress.currentDifficulty) {
      case 'easy': return "❄️ Min Cool"
      case 'medium': return "🧊 Cool Down"
      case 'hard': return "❄️ Cool Down"
    }
  }

  // Calculate progress within current level (0-100%) - now just shows total points as progress
  const progressPercentage = Math.min((gameProgress.totalPoints / 50) * 100, 100) // Cap at 100%



  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-3">
        <h1 className="text-2xl font-bold text-purple-800 mb-1">Dare Game</h1>
        <p className="text-sm text-gray-600">Complete dares to advance through the levels!</p>
      </div>

      {/* Players Display */}
      <div className="card mb-3 py-3">
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {players.map((player, index) => (
            <div
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                index === currentPlayerIndex
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : isGameActive
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-purple-100 text-purple-700'
              }`}
            >
              {player}
              {index === currentPlayerIndex && isGameActive && (
                <span className="ml-1">👑</span>
              )}
            </div>
          ))}
        </div>
        {isGameActive && (
          <p className="text-center text-xs text-gray-600">
            <strong>{currentPlayer}'s</strong> turn
          </p>
        )}
      </div>

      {/* Unified Progress Bar */}
      <div className="card mb-3 py-3">
        <div className="flex items-center justify-center mb-2">
          {getLevelIcon(gameProgress.currentDifficulty)}
          <span className={`ml-1 text-sm font-semibold ${getLevelColor(gameProgress.currentDifficulty)}`}>
            {getLevelName(gameProgress.currentDifficulty)} Level
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              gameProgress.currentDifficulty === 'easy' ? 'bg-green-600' :
              gameProgress.currentDifficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        
      </div>

      {/* Game Controls */}
      <div className="card mb-3 py-3">
        <div className="text-center">
          {!isGameActive ? (
            <>
              <button
                onClick={startGame}
                className="btn-primary text-base px-6 py-3 flex items-center mx-auto mb-3"
              >
                <Play className="mr-2 w-4 h-4" />
                Start Dare Challenge
              </button>
              
              <div className="flex gap-2 justify-center mb-2">
                <button
                  onClick={coolDown}
                  disabled={gameProgress.currentDifficulty === 'easy'}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors text-white ${
                    gameProgress.currentDifficulty === 'easy'
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  }`}
                >
                  ❄️ Cool
                </button>
                
                <button
                  onClick={heatUp}
                  disabled={gameProgress.currentDifficulty === 'hard'}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors text-white ${
                    gameProgress.currentDifficulty === 'hard'
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                  }`}
                >
                  🔥 Heat
                </button>
                
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="px-3 py-2 text-sm font-medium rounded bg-green-500 hover:bg-green-600 text-white"
                >
                  <PlusCircle className="w-4 h-4 inline mr-1" />
                  Add
                </button>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={resetProgress}
                  className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
                >
                  Reset Progress
                </button>
                
                <button
                  onClick={resetUsedCards}
                  className="px-3 py-1 text-xs bg-blue-200 hover:bg-blue-300 text-blue-700 rounded"
                >
                  Reset Used
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 justify-center items-center">
              <button
                onClick={stopGame}
                className="px-6 py-2 text-sm font-medium rounded bg-red-100 hover:bg-red-200 text-red-700 flex items-center"
              >
                <X className="mr-1 w-4 h-4" />
                Stop Game
              </button>
              
              <button
                onClick={coolDown}
                disabled={gameProgress.currentDifficulty === 'easy'}
                className={`px-3 py-2 text-sm font-medium rounded text-white ${
                  gameProgress.currentDifficulty === 'easy'
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                ❄️ Cool
              </button>
              
              <button
                onClick={heatUp}
                disabled={gameProgress.currentDifficulty === 'hard'}
                className={`px-3 py-2 text-sm font-medium rounded text-white ${
                  gameProgress.currentDifficulty === 'hard'
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                }`}
              >
                🔥 Heat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current Card Display */}
      {currentCard && (
        <div className="card py-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-3xl text-red-500">⚡</span>
              <div>
                <h2 className="text-lg font-bold text-gray-800">DARE</h2>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-purple-600">{currentPlayer}</span>
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(gameProgress.currentDifficulty)}`}>
                {gameProgress.currentDifficulty.toUpperCase()}
              </span>
            </div>

            {/* Timer */}
            <div className="mb-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-base mb-2 ${
                timeLeft <= 30 
                  ? 'bg-red-100 text-red-700 animate-pulse' 
                  : timeLeft <= 60 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-green-100 text-green-700'
              }`}>
                ⏰ {formatTime(timeLeft)}
              </div>
              
              <div className="flex items-center justify-center gap-1 mb-1">
                <button
                  onClick={() => adjustTime(-30)}
                  disabled={timeLeft <= 30}
                  className={`p-1 rounded ${
                    timeLeft <= 30 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                
                <button
                  onClick={timerActive ? pauseTimer : startTimer}
                  className={`px-3 py-1 rounded text-sm font-medium text-white ${
                    timerActive 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {timerActive ? 'Pause' : 'Start'}
                </button>
                
                <button
                  onClick={() => adjustTime(30)}
                  disabled={timeLeft >= 150}
                  className={`p-1 rounded ${
                    timeLeft >= 150 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              {timeLeft <= 30 && timerActive && (
                <p className="text-xs text-red-600 animate-bounce">
                  Hurry up! Time's running out... 😈
                </p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-base text-gray-800">{currentCard.content}</p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={completeCard}
                className="px-4 py-2 text-sm font-medium rounded bg-green-500 hover:bg-green-600 text-white"
              >
                ✅ Done (+2)
              </button>
              <button
                onClick={skipCard}
                className="px-4 py-2 text-sm font-medium rounded bg-red-100 hover:bg-red-200 text-red-700"
              >
                Skip (-1)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Custom Dare</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dare Content
                </label>
                <textarea
                  value={newCardContent}
                  onChange={(e) => setNewCardContent(e.target.value)}
                  placeholder="Enter your custom dare here..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={newCardDifficulty}
                  onChange={(e) => setNewCardDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={addCustomCard}
                disabled={!newCardContent.trim()}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
                  newCardContent.trim()
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-2 inline" />
                Add Dare
              </button>
              
              <button
                onClick={() => {
                  setShowAddCardModal(false)
                  setNewCardContent('')
                  setNewCardDifficulty('easy')
                }}
                className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
            
            {/* Show existing custom cards */}
            {customCards.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Your Custom Dares ({customCards.length})
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {customCards.map((card) => (
                    <div key={card.id} className="flex items-start justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex-1">
                        <p className="text-gray-800">{card.content}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getDifficultyColor(card.difficulty)}`}>
                          {card.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => removeCustomCard(card.id)}
                        className="ml-2 text-red-500 hover:text-red-700"
                        title="Remove card"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Game