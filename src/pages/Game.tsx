import React, { useState, useEffect } from 'react'
import { Heart, Zap, RotateCcw, Play, Users, Trophy, Target, Flame, Star, Minus, Plus } from 'lucide-react'
import cardsData from '../data/cards.json'

interface GameCard {
  id: string
  type: 'dare'
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface GameHistory {
  id: string
  timestamp: Date
  player: string
  card: GameCard
  score: number // 1-5
  scoredBy: string // who gave the score
}

interface PlayerProgress {
  name: string
  easyPoints: number
  mediumPoints: number
  hardPoints: number
  currentLevel: 'easy' | 'medium' | 'hard'
  pointsGiven: number // total points given to partner
  pointsReceived: number // total points received from partner
}

const Game = () => {
  const [currentPlayer, setCurrentPlayer] = useState<string>('')
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null)
  const [isCardRevealed, setIsCardRevealed] = useState(false)
  const [showScoring, setShowScoring] = useState(false)
  const [players] = useState<string[]>(['You', 'Your Wife'])
  const [dareCards] = useState<GameCard[]>(cardsData.dareCards as GameCard[])
  
  // Progressive game state - now using combined points
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress[]>(() => {
    const saved = localStorage.getItem('playerProgress')
    if (saved) {
      return JSON.parse(saved)
    }
    return [
      { name: 'You', easyPoints: 0, mediumPoints: 0, hardPoints: 0, currentLevel: 'easy' as const, pointsGiven: 0, pointsReceived: 0 },
      { name: 'Your Wife', easyPoints: 0, mediumPoints: 0, hardPoints: 0, currentLevel: 'easy' as const, pointsGiven: 0, pointsReceived: 0 }
    ]
  })

  const [gameHistory, setGameHistory] = useState<GameHistory[]>(() => {
    const saved = localStorage.getItem('gameHistory')
    if (saved) {
      const parsedHistory = JSON.parse(saved)
      return parsedHistory.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
    }
    return []
  })

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('playerProgress', JSON.stringify(playerProgress))
  }, [playerProgress])

  const getRandomPlayer = () => {
    return players[Math.floor(Math.random() * players.length)]
  }

  const getAvailableCards = (playerName: string) => {
    const player = playerProgress.find(p => p.name === playerName)
    if (!player) return dareCards.filter(card => card.difficulty === 'easy')
    
    return dareCards.filter(card => card.difficulty === player.currentLevel)
  }

  const drawCard = () => {
    const randomPlayer = getRandomPlayer()
    setCurrentPlayer(randomPlayer)
    
    const availableCards = getAvailableCards(randomPlayer)
    
    if (availableCards.length === 0) {
      alert('No cards available for this level!')
      return
    }

    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)]
    setCurrentCard(randomCard)
    setIsCardRevealed(false)
    setShowScoring(false)
  }

  const scoreCard = (score: number) => {
    if (!currentCard || !currentPlayer) return

    // Determine who is scoring (the other player)
    const scoringPlayer = currentPlayer === 'You' ? 'Your Wife' : 'You'

    const historyEntry: GameHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      player: currentPlayer,
      card: currentCard,
      score: score,
      scoredBy: scoringPlayer
    }

    // Update game history
    const newHistory = [historyEntry, ...gameHistory]
    setGameHistory(newHistory)
    localStorage.setItem('gameHistory', JSON.stringify(newHistory))

    // Update player progress — fixed TDZ by avoiding reading "newProgress" while creating it
    setPlayerProgress(prev => {
      // 1) First pass: apply the score changes to points + given/received
      const next = prev.map(player => {
        if (player.name === currentPlayer) {
          const updatedPlayer = { ...player }

          if (currentCard.difficulty === 'easy') {
            updatedPlayer.easyPoints += score
          } else if (currentCard.difficulty === 'medium') {
            updatedPlayer.mediumPoints += score
          } else if (currentCard.difficulty === 'hard') {
            updatedPlayer.hardPoints += score
          }

          updatedPlayer.pointsReceived += score
          return updatedPlayer
        } else if (player.name === scoringPlayer) {
          return { ...player, pointsGiven: player.pointsGiven + score }
        }
        return player
      })

      // 2) Compute totals from the fully-built "next" array
      const totalEasyPoints = next.reduce((sum, p) => sum + p.easyPoints, 0)
      const totalMediumPoints = next.reduce((sum, p) => sum + p.mediumPoints, 0)

      // 3) Optionally advance the *current player's* level based on combined totals
      const advanced = next.map(p => {
        if (p.name !== currentPlayer) return p
        const updated = { ...p }
        if (updated.currentLevel === 'easy' && totalEasyPoints >= 25) {
          updated.currentLevel = 'medium'
        } else if (updated.currentLevel === 'medium' && totalMediumPoints >= 25) {
          updated.currentLevel = 'hard'
        }
        return updated
      })

      return advanced
    })

    setCurrentCard(null)
    setCurrentPlayer('')
    setShowScoring(false)
  }

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      const resetProgress: PlayerProgress[] = [
        { name: 'You', easyPoints: 0, mediumPoints: 0, hardPoints: 0, currentLevel: 'easy', pointsGiven: 0, pointsReceived: 0 },
        { name: 'Your Wife', easyPoints: 0, mediumPoints: 0, hardPoints: 0, currentLevel: 'easy', pointsGiven: 0, pointsReceived: 0 }
      ]
      setPlayerProgress(resetProgress)
      setGameHistory([])
      localStorage.removeItem('gameHistory')
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

  const getLevelIcon = (level: string): React.ReactElement => {
    switch (level) {
      case 'easy': return <Target className="w-5 h-5" />
      case 'medium': return <Flame className="w-5 h-5" />
      case 'hard': return <Trophy className="w-5 h-5" />
      default: return <Target className="w-5 h-5" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-green-600'
    }
  }

  const getScoreColor = (score: number) => {
    switch (score) {
      case 5: return 'text-purple-600'
      case 4: return 'text-blue-600'
      case 3: return 'text-green-600'
      case 2: return 'text-yellow-600'
      case 1: return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getScoreText = (score: number) => {
    switch (score) {
      case 5: return 'Perfect'
      case 4: return 'Great'
      case 3: return 'Good'
      case 2: return 'Fair'
      case 1: return 'Poor'
      default: return 'Unknown'
    }
  }

  const getScoreBgColor = (score: number) => {
    switch (score) {
      case 5: return 'bg-purple-100 hover:bg-purple-200'
      case 4: return 'bg-blue-100 hover:bg-blue-200'
      case 3: return 'bg-green-100 hover:bg-green-200'
      case 2: return 'bg-yellow-100 hover:bg-yellow-200'
      case 1: return 'bg-red-100 hover:bg-red-200'
      default: return 'bg-gray-100 hover:bg-gray-200'
    }
  }

  // Calculate total points for each level
  const totalEasyPoints = playerProgress.reduce((sum, p) => sum + p.easyPoints, 0)
  const totalMediumPoints = playerProgress.reduce((sum, p) => sum + p.mediumPoints, 0)
  const totalHardPoints = playerProgress.reduce((sum, p) => sum + p.hardPoints, 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Progressive Dare Challenge</h1>
        <p className="text-gray-600">Earn 15 points together to advance to the next level!</p>
      </div>

      {/* Combined Progress */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center justify-center">
          <Trophy className="mr-2" />
          Combined Progress
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-600" />
              Easy Level
            </span>
            <span className="font-semibold">
              {totalEasyPoints}/25
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((totalEasyPoints / 25) * 100, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Flame className="w-4 h-4 mr-2 text-yellow-600" />
              Medium Level
            </span>
            <span className="font-semibold">
              {totalMediumPoints}/25
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-yellow-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((totalMediumPoints / 25) * 100, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-red-600" />
              Hard Level
            </span>
            <span className="font-semibold">
              {totalHardPoints}/25
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-red-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((totalHardPoints / 25) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

    

      {/* Game Controls */}
      <div className="card mb-8">
        <div className="text-center">
          <button
            onClick={drawCard}
            className="btn-primary text-lg px-8 py-4 flex items-center mx-auto"
          >
            <Play className="mr-2" />
            Draw Random Dare
          </button>
          
          <button
            onClick={resetProgress}
            className="mt-4 btn-secondary"
          >
            Reset All Progress
          </button>
        </div>
      </div>

      {/* Current Card Display */}
      {currentCard && (
        <div className="card mb-8">
          <div className="text-center">
            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                {currentCard.difficulty.toUpperCase()}
              </span>
            </div>
            
            <div className="mb-6">
              <div className="text-6xl mb-4 text-red-500">
                ⚡
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                DARE
              </h2>
              <p className="text-lg text-gray-600">
                Player: <span className="font-semibold text-purple-600">{currentPlayer}</span>
              </p>
            </div>

            {!isCardRevealed ? (
              <button
                onClick={() => setIsCardRevealed(true)}
                className="btn-primary text-lg px-8 py-3"
              >
                Reveal Dare
              </button>
            ) : !showScoring ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  <p className="text-xl text-gray-800">{currentCard.content}</p>
                </div>
                
                <button
                  onClick={() => setShowScoring(true)}
                  className="btn-primary flex items-center mx-auto"
                >
                  <Star className="mr-2" />
                  Rate Performance
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  <p className="text-xl text-gray-800">{currentCard.content}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-700 mb-3">
                    How well did {currentPlayer} complete this dare?
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    The other player should rate the performance (1-5):
                  </p>
                </div>
                
                <div className="grid grid-cols-5 gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => scoreCard(score)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors ${getScoreBgColor(score)}`}
                    >
                      <span className="text-2xl font-bold mb-1">{score}</span>
                      <span className="text-xs font-medium">{getScoreText(score)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent History */}
      {gameHistory.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent History</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {gameHistory.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  entry.score >= 4 ? 'bg-green-50 border-green-200' : 
                  entry.score >= 3 ? 'bg-yellow-50 border-yellow-200' : 
                  'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl text-red-500">⚡</span>
                  <div>
                    <p className="font-medium text-gray-800">{entry.player}</p>
                    <p className="text-sm text-gray-600">{entry.card.content}</p>
                    <p className="text-xs text-gray-500">Scored by: {entry.scoredBy}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(entry.card.difficulty)}`}>
                    {entry.card.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(entry.score)}`}>
                    {entry.score}/5 ({getScoreText(entry.score)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Game
