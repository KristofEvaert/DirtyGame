import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Filter, Download, Upload } from 'lucide-react'
import cardsData from '../data/cards.json'

interface GameCard {
  id: string
  type: 'truth' | 'dare'
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const Admin = () => {
  const [dareCards, setDareCards] = useState<GameCard[]>([])
  const [editingCard, setEditingCard] = useState<GameCard | null>(null)
  const [newCard, setNewCard] = useState<Partial<GameCard>>({
    type: 'truth',
    content: '',
    difficulty: 'easy'
  })
  const [filterType, setFilterType] = useState<'all' | 'truth' | 'dare'>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')

  // Load cards from JSON file on component mount
  useEffect(() => {
    setDareCards(cardsData.dareCards)
  }, [])

  // Export cards to JSON file
  const exportCards = () => {
    const dataStr = JSON.stringify({ dareCards }, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dare-cards.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import cards from JSON file
  const importCards = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.dareCards) {
            setDareCards(data.dareCards)
            alert('Cards imported successfully!')
          } else {
            alert('Invalid file format. Please select a valid dare cards JSON file.')
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
      type: 'dare',
      content: newCard.content.trim(),
      difficulty: newCard.difficulty as 'easy' | 'medium' | 'hard'
    }

    setDareCards(prev => [...prev, card])

    setNewCard({
      type: 'dare',
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

    setDareCards(prev => prev.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    ))

    setEditingCard(null)
  }

  const deleteCard = (card: GameCard) => {
    if (confirm('Are you sure you want to delete this card?')) {
      setDareCards(prev => prev.filter(c => c.id !== card.id))
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

  const filteredCards = dareCards.filter(card => {
    if (filterType !== 'all' && card.type !== filterType) return false
    if (filterDifficulty !== 'all' && card.difficulty !== filterDifficulty) return false
    return true
  })

  return (
    <div className="max-w-6xl mx-auto">
             <div className="text-center mb-8">
         <h1 className="text-4xl font-bold text-purple-800 mb-2">Admin Panel</h1>
         <p className="text-gray-600">Manage your Dare cards</p>
       </div>

      {/* Add New Card */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Plus className="mr-2" />
          Add New Card
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
               placeholder="Enter dare content..."
               className="input-field"
             />
           </div>
        </div>
        
        <button
          onClick={addCard}
          className="mt-4 btn-primary flex items-center"
        >
          <Plus className="mr-2" />
          Add Card
        </button>
      </div>

      {/* Filters */}
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

      {/* Cards List */}
      <div className="card">
                 <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-semibold">All Dare Cards ({filteredCards.length})</h2>
           <div className="text-sm text-gray-600">
             Total: {dareCards.length}
           </div>
         </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredCards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No cards found. Add some cards above!
            </div>
          ) : (
            filteredCards.map((card) => (
              <div
                key={card.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  card.type === 'truth' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <span className={`text-2xl ${card.type === 'truth' ? 'text-blue-500' : 'text-red-500'}`}>
                    {card.type === 'truth' ? '💭' : '⚡'}
                  </span>
                  
                  {editingCard?.id === card.id ? (
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <select
                        value={editingCard.type}
                        onChange={(e) => setEditingCard(prev => prev ? { ...prev, type: e.target.value as 'truth' | 'dare' } : null)}
                        className="input-field text-sm"
                      >
                        <option value="truth">Truth</option>
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
                          {card.type === 'truth' ? 'Truth' : 'Dare'}
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

      {/* Export/Import Actions */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <button
          onClick={exportCards}
          className="btn-primary flex items-center justify-center"
        >
          <Download className="mr-2" />
          Export Cards
        </button>
        
        <label className="btn-secondary flex items-center justify-center cursor-pointer">
          <Upload className="mr-2" />
          Import Cards
          <input
            type="file"
            accept=".json"
            onChange={importCards}
            className="hidden"
          />
        </label>
        
                 <button
           onClick={() => {
             if (confirm('Reset to default cards? This will remove all custom cards.')) {
               setDareCards(cardsData.dareCards)
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
