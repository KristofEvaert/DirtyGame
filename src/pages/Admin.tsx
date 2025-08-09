import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Filter, Download, Upload } from 'lucide-react'
import cardsData from '../data/cards.json'
import diceData from '../data/dice.json'

interface GameCard {
  id: string
  type: 'dare' | 'dice'
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Suggestion {
  id: string
  type: 'dare' | 'dice'
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'dare' | 'dice' | 'suggestions'>('dare')
  const [dareCards, setDareCards] = useState<GameCard[]>([])
  const [diceActions, setDiceActions] = useState<GameCard[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [editingCard, setEditingCard] = useState<GameCard | null>(null)
  const [newCard, setNewCard] = useState<Partial<GameCard>>({
    type: 'dare',
    content: '',
    difficulty: 'easy'
  })
  const [filterType] = useState<'all' | 'dare' | 'dice'>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  // Load cards and suggestions from JSON file on component mount
  useEffect(() => {
    setDareCards(cardsData.dareCards as GameCard[])
    setDiceActions(diceData.diceActions as GameCard[])
    setSuggestions([...(cardsData.suggestions || []), ...(diceData.suggestions || [])] as Suggestion[])
  }, [])

  // Export cards to JSON files
  const exportCards = () => {
    // Export dare cards
    const dareDataStr = JSON.stringify({ dareCards, suggestions: suggestions.filter(s => s.type === 'dare') }, null, 2)
    const dareDataBlob = new Blob([dareDataStr], { type: 'application/json' })
    const dareUrl = URL.createObjectURL(dareDataBlob)
    const dareLink = document.createElement('a')
    dareLink.href = dareUrl
    dareLink.download = 'cards.json'
    document.body.appendChild(dareLink)
    dareLink.click()
    document.body.removeChild(dareLink)
    URL.revokeObjectURL(dareUrl)

    // Export dice actions
    const diceDataStr = JSON.stringify({ diceActions, suggestions: suggestions.filter(s => s.type === 'dice') }, null, 2)
    const diceDataBlob = new Blob([diceDataStr], { type: 'application/json' })
    const diceUrl = URL.createObjectURL(diceDataBlob)
    const diceLink = document.createElement('a')
    diceLink.href = diceUrl
    diceLink.download = 'dice.json'
    document.body.appendChild(diceLink)
    diceLink.click()
    document.body.removeChild(diceLink)
    URL.revokeObjectURL(diceUrl)

    alert('Exported cards.json and dice.json successfully!')
  }

  // Import cards from JSON file
  const importCards = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.dareCards || data.diceActions || data.suggestions) {
            if (data.dareCards) setDareCards(data.dareCards as GameCard[])
            if (data.diceActions) setDiceActions(data.diceActions as GameCard[])
            if (data.suggestions) setSuggestions(data.suggestions as Suggestion[])
            alert('Data imported successfully!')
          } else {
            alert('Invalid file format. Please select a valid game data JSON file.')
          }
        } catch (error) {
          alert('Error reading file. Please make sure it\'s a valid JSON file.')
        }
      }
      reader.readAsText(file)
    }
  }

  const addCard = () => {
    if (!newCard.content?.trim()) {
      alert('Please enter card content')
      return
    }

    const card: GameCard = {
      id: Date.now().toString(),
      type: activeTab === 'dice' ? 'dice' : 'dare',
      content: newCard.content.trim(),
      difficulty: newCard.difficulty as 'easy' | 'medium' | 'hard'
    }

    if (activeTab === 'dice') {
      setDiceActions(prev => [...prev, card])
    } else {
      setDareCards(prev => [...prev, card])
    }

    setNewCard({
      type: activeTab === 'dice' ? 'dice' : 'dare',
      content: '',
      difficulty: 'easy'
    })
  }

  const updateCard = () => {
    if (!editingCard || !editingCard.content?.trim()) {
      alert('Please enter card content')
      return
    }

    const updatedCard = {
      ...editingCard,
      content: editingCard.content.trim()
    }

    if (editingCard.type === 'dice') {
      setDiceActions(prev => prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      ))
    } else {
      setDareCards(prev => prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      ))
    }

    setEditingCard(null)
  }

  const deleteCard = (card: GameCard) => {
    if (confirm('Are you sure you want to delete this card?')) {
      if (card.type === 'dice') {
        setDiceActions(prev => prev.filter(c => c.id !== card.id))
      } else {
        setDareCards(prev => prev.filter(c => c.id !== card.id))
      }
    }
  }

  const startEdit = (card: GameCard) => {
    setEditingCard({ ...card })
  }

  const cancelEdit = () => {
    setEditingCard(null)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCurrentCards = () => {
    return activeTab === 'dice' ? diceActions : dareCards
  }

  const filteredCards = getCurrentCards().filter(card => {
    if (filterType !== 'all' && card.type !== filterType) return false
    if (filterDifficulty !== 'all' && card.difficulty !== filterDifficulty) return false
    return true
  })

  const approveSuggestion = (suggestion: Suggestion) => {
    const newCard: GameCard = {
      id: Date.now().toString(),
      type: suggestion.type,
      content: suggestion.content,
      difficulty: suggestion.difficulty
    }
    
    if (suggestion.type === 'dice') {
      setDiceActions(prev => [...prev, newCard])
    } else {
      setDareCards(prev => [...prev, newCard])
    }
    
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, status: 'approved' as const } : s
    ))
  }

  const rejectSuggestion = (suggestion: Suggestion) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, status: 'rejected' as const } : s
    ))
  }

  const deleteSuggestion = (suggestion: Suggestion) => {
    if (confirm('Are you sure you want to delete this suggestion?')) {
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-800 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage your game content and user suggestions</p>
      </div>

      {/* Tab Navigation */}
      <div className="card mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('dare')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'dare'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚡ Dare Cards ({dareCards.length})
          </button>
          <button
            onClick={() => setActiveTab('dice')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'dice'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎲 Dice Actions ({diceActions.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'suggestions'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💬 Suggestions ({suggestions.filter(s => s.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Add New Card */}
      {activeTab !== 'suggestions' && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Plus className="mr-2" />
            Add New {activeTab === 'dice' ? 'Dice Action' : 'Dare Card'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={newCard.difficulty}
                onChange={(e) => setNewCard(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                className="input-field"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <input
                type="text"
                value={newCard.content}
                onChange={(e) => setNewCard(prev => ({ ...prev, content: e.target.value }))}
                placeholder={`Enter ${activeTab === 'dice' ? 'dice action' : 'dare'} content...`}
                className="input-field"
              />
            </div>
          </div>
          
          <button
            onClick={addCard}
            className="mt-4 btn-primary flex items-center"
          >
            <Plus className="mr-2" />
            Add {activeTab === 'dice' ? 'Action' : 'Card'}
          </button>
        </div>
      )}

      {/* Filters */}
      {activeTab !== 'suggestions' && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Filter className="mr-2" />
            Filters
          </h2>
          
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                className="input-field"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'suggestions' ? (
        // Suggestions Tab
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Suggestions</h2>
            <div className="text-sm text-gray-600">
              Pending: {suggestions.filter(s => s.status === 'pending').length}
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No suggestions yet!
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    suggestion.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                    suggestion.status === 'approved' ? 'bg-green-50 border-green-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-2xl">
                      {suggestion.type === 'dice' ? '🎲' : '⚡'}
                    </span>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{suggestion.content}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(suggestion.difficulty)}`}>
                          {suggestion.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {suggestion.type === 'dice' ? 'Dice Action' : 'Dare Card'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {suggestion.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {suggestion.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveSuggestion(suggestion)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Approve"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => rejectSuggestion(suggestion)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Reject"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteSuggestion(suggestion)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // Cards List
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {activeTab === 'dice' ? 'Dice Actions' : 'Dare Cards'} ({filteredCards.length})
            </h2>
            <div className="text-sm text-gray-600">
              Total: {getCurrentCards().length}
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredCards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {activeTab === 'dice' ? 'actions' : 'cards'} found. Add some above!
              </div>
            ) : (
              filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    card.type === 'dice' ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <span className={`text-2xl ${card.type === 'dice' ? 'text-purple-500' : 'text-red-500'}`}>
                      {card.type === 'dice' ? '🎲' : '⚡'}
                    </span>
                    
                    {editingCard?.id === card.id ? (
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <select
                          value={editingCard.type}
                          onChange={(e) => setEditingCard(prev => prev ? { ...prev, type: e.target.value as 'dice' | 'dare' } : null)}
                          className="input-field text-sm"
                          disabled
                        >
                          <option value="dice">Dice Action</option>
                          <option value="dare">Dare</option>
                        </select>
                        
                        <select
                          value={editingCard.difficulty}
                          onChange={(e) => setEditingCard(prev => prev ? { ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' } : null)}
                          className="input-field text-sm"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                        
                        <input
                          type="text"
                          value={editingCard.content}
                          onChange={(e) => setEditingCard(prev => prev ? { ...prev, content: e.target.value } : null)}
                          className="input-field text-sm"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{card.content}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(card.difficulty)}`}>
                            {card.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {card.type === 'dice' ? 'Dice Action' : 'Dare'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {editingCard?.id === card.id ? (
                      <>
                        <button
                          onClick={updateCard}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(card)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCard(card)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Export/Import Actions */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <button
          onClick={exportCards}
          className="btn-primary flex items-center justify-center"
        >
          <Download className="mr-2" />
          Export All Data
        </button>
        
        <label className="btn-secondary flex items-center justify-center cursor-pointer">
          <Upload className="mr-2" />
          Import Data
          <input
            type="file"
            accept=".json"
            onChange={importCards}
            className="hidden"
          />
        </label>
        
        <button
          onClick={() => {
            if (confirm('Reset to default data? This will remove all custom content.')) {
              setDareCards(cardsData.dareCards as GameCard[])
              setDiceActions(diceData.diceActions as GameCard[])
              setSuggestions([])
            }
          }}
          className="btn-secondary"
        >
          Reset to Default
        </button>
      </div>
    </div>
  )
}

export default Admin