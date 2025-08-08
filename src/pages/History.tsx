import { useState, useEffect } from 'react'
import { Calendar, Filter, TrendingUp, TrendingDown, Clock } from 'lucide-react'

interface GameCard {
  id: string
  type: 'truth' | 'dare'
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface GameHistory {
  id: string
  timestamp: Date
  player: string
  card: GameCard
  completed: boolean
}

const History = () => {
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [filterPlayer, setFilterPlayer] = useState<string>('all')
  const [filterType, setFilterType] = useState<'all' | 'truth' | 'dare'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'skipped'>('all')

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('gameHistory')
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory)
      // Convert timestamp strings back to Date objects
      const historyWithDates = parsedHistory.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
      setGameHistory(historyWithDates)
    }
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getPlayers = () => {
    const players = new Set(gameHistory.map(entry => entry.player))
    return Array.from(players)
  }

  const filteredHistory = gameHistory.filter(entry => {
    if (filterPlayer !== 'all' && entry.player !== filterPlayer) return false
    if (filterType !== 'all' && entry.card.type !== filterType) return false
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed' && !entry.completed) return false
      if (filterStatus === 'skipped' && entry.completed) return false
    }
    return true
  })

  const stats = {
    total: gameHistory.length,
    completed: gameHistory.filter(h => h.completed).length,
    skipped: gameHistory.filter(h => !h.completed).length,
    completionRate: gameHistory.length > 0 ? Math.round((gameHistory.filter(h => h.completed).length / gameHistory.length) * 100) : 0,
    truthCards: gameHistory.filter(h => h.card.type === 'truth').length,
    dareCards: gameHistory.filter(h => h.card.type === 'dare').length,
    easyCards: gameHistory.filter(h => h.card.difficulty === 'easy').length,
    mediumCards: gameHistory.filter(h => h.card.difficulty === 'medium').length,
    hardCards: gameHistory.filter(h => h.card.difficulty === 'hard').length,
  }

  const playerStats = getPlayers().map(player => {
    const playerHistory = gameHistory.filter(h => h.player === player)
    return {
      player,
      total: playerHistory.length,
      completed: playerHistory.filter(h => h.completed).length,
      skipped: playerHistory.filter(h => !h.completed).length,
      completionRate: playerHistory.length > 0 ? Math.round((playerHistory.filter(h => h.completed).length / playerHistory.length) * 100) : 0
    }
  })

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all game history? This action cannot be undone.')) {
      setGameHistory([])
      localStorage.removeItem('gameHistory')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Game History</h1>
        <p className="text-gray-600">Track your Truth or Dare adventures</p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Games</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{stats.skipped}</div>
          <div className="text-sm text-gray-600">Skipped</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.completionRate}%</div>
          <div className="text-sm text-gray-600">Completion Rate</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Card Type Stats */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Card Type Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-2xl mr-2">💭</span>
                <span>Truth Cards</span>
              </div>
              <span className="font-semibold text-blue-600">{stats.truthCards}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                <span>Dare Cards</span>
              </div>
              <span className="font-semibold text-red-600">{stats.dareCards}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Stats */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Difficulty Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Easy</span>
              <span className="font-semibold text-green-600">{stats.easyCards}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Medium</span>
              <span className="font-semibold text-yellow-600">{stats.mediumCards}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hard</span>
              <span className="font-semibold text-red-600">{stats.hardCards}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Player Stats */}
      {playerStats.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Player Performance</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerStats.map((playerStat) => (
              <div key={playerStat.player} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{playerStat.player}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{playerStat.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span className="font-medium text-green-600">{playerStat.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skipped:</span>
                    <span className="font-medium text-red-600">{playerStat.skipped}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="font-medium text-blue-600">{playerStat.completionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Filter className="mr-2" />
          Filters
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player
            </label>
            <select
              value={filterPlayer}
              onChange={(e) => setFilterPlayer(e.target.value)}
              className="input-field"
            >
              <option value="all">All Players</option>
              {getPlayers().map((player) => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'truth' | 'dare')}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="truth">Truth</option>
              <option value="dare">Dare</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'skipped')}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Game History ({filteredHistory.length})
          </h2>
          {gameHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear History
            </button>
          )}
        </div>
        
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {gameHistory.length === 0 ? 'No game history yet. Start playing to see your history here!' : 'No games match your current filters.'}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  entry.completed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <span className={`text-2xl ${entry.card.type === 'truth' ? 'text-blue-500' : 'text-red-500'}`}>
                    {entry.card.type === 'truth' ? '💭' : '⚡'}
                  </span>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-800">{entry.player}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(entry.card.difficulty)}`}>
                        {entry.card.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.completed ? 'Completed' : 'Skipped'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{entry.card.content}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History
