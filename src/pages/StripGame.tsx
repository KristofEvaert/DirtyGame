import React, { useState } from 'react'
import { Users, Shirt, Minus, Plus, Play, RotateCcw, Shuffle, Check, X } from 'lucide-react'

interface Player {
  id: number
  name: string
  clothes: number
  maxClothes: number
  freeCards: number
  bustCards: number
  currentAction: string
  hasChosen: boolean
  choiceResult: string
}

const StripGame = () => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'choice'>('setup')
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [gameHistory, setGameHistory] = useState<string[]>([])
  const [roundNumber, setRoundNumber] = useState(1)

  const clothingItems = [
    'Socks', 'Shoes', 'Pants/Shorts', 'Underwear', 'Shirt/Top', 
    'Bra', 'Jacket', 'Hat', 'Jewelry', 'Glasses'
  ]

  const actions = [
    'Remove 1 item of clothing',
    'Remove 2 items of clothing',
    'Add 1 item of clothing',
    'Add 2 items of clothing'
  ]

  const initializePlayers = (playerCount: number, clothesCount: number) => {
    const newPlayers: Player[] = []
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: i,
        name: `Player ${i + 1}`,
        clothes: clothesCount,
        maxClothes: clothesCount,
        freeCards: 2,
        bustCards: 2,
        currentAction: '',
        hasChosen: false,
        choiceResult: ''
      })
    }
    setPlayers(newPlayers)
    setGameState('playing')
    setGameHistory([`Game started with ${playerCount} players, each starting with ${clothesCount} items of clothing!`])
  }

  const rollDice = () => {
    const newPlayers = [...players]
    
    // Give each player a random action
    newPlayers.forEach(player => {
      const action = actions[Math.floor(Math.random() * actions.length)]
      player.currentAction = action
      // If player is naked, they're automatically "chosen" and can't play
      player.hasChosen = player.clothes === 0
      player.choiceResult = player.clothes === 0 ? '🫣 Out of game - No clothes left!' : ''
    })
    
    setPlayers(newPlayers)
    setGameHistory([...gameHistory, `Round ${roundNumber}: All players rolled for actions!`])
    setGameState('choice')
  }

  const handleChoice = (playerId: number, buttonNumber: number) => {
    const playerIndex = players.findIndex(p => p.id === playerId)
    const player = players[playerIndex]
    let newPlayers = [...players]
    let historyEntry = `${player.name}: `

    // Randomly determine what each button does
    const button1Action = Math.random() < 0.5 ? 'action' : 'card'
    const button2Action = button1Action === 'action' ? 'card' : 'action'

    const chosenAction = buttonNumber === 1 ? button1Action : button2Action
    const isAddingClothes = player.currentAction.includes('Add')

    if (isAddingClothes) {
      // Adding clothes action
      if (chosenAction === 'card') {
        // Use bust card to prevent adding clothes
        if (newPlayers[playerIndex].bustCards > 0) {
          newPlayers[playerIndex].bustCards--
          historyEntry += `Unlucky! Used bust card - No clothes added! (${newPlayers[playerIndex].bustCards} bust cards left)`
          newPlayers[playerIndex].choiceResult = 'Unlucky! No clothes added!'
        } else {
          historyEntry += `Lucky you! No bust cards left - Must add clothes!`
          newPlayers[playerIndex].choiceResult = 'Lucky you! Adding clothes!'
          // Force the action
          executeAction(newPlayers, playerIndex, historyEntry)
          return
        }
      } else {
        // Perform the add clothes action
        historyEntry += `Lucky you! Adding clothes! `
        newPlayers[playerIndex].choiceResult = 'Lucky you! Adding clothes!'
        executeAction(newPlayers, playerIndex, historyEntry)
        return
      }
    } else {
      // Removing clothes action
      if (chosenAction === 'card') {
        // Use free card to avoid removing clothes
        if (newPlayers[playerIndex].freeCards > 0) {
          newPlayers[playerIndex].freeCards--
          historyEntry += `Lucky you! Used free card - No clothes removed! (${newPlayers[playerIndex].freeCards} free cards left)`
          newPlayers[playerIndex].choiceResult = 'Lucky you! Escaped!'
        } else {
          historyEntry += `Unlucky! No free cards left - Must remove clothes!`
          newPlayers[playerIndex].choiceResult = 'Unlucky! Must remove clothes!'
          // Force the action
          executeAction(newPlayers, playerIndex, historyEntry)
          return
        }
      } else {
        // Perform the remove clothes action
        historyEntry += `Unlucky! Must remove clothes! `
        newPlayers[playerIndex].choiceResult = 'Unlucky! Must remove clothes!'
        executeAction(newPlayers, playerIndex, historyEntry)
        return
      }
    }

    newPlayers[playerIndex].hasChosen = true
    setPlayers(newPlayers)
    setGameHistory([...gameHistory, historyEntry])
    
    // Check if all players have made their choices
    const allChosen = newPlayers.every(p => p.hasChosen)
    if (allChosen) {
      // Move to next round
      setRoundNumber(roundNumber + 1)
      setCurrentPlayer((currentPlayer + 1) % players.length)
      setGameState('playing')
    }
  }

  const executeAction = (newPlayers: Player[], playerIndex: number, historyEntry: string) => {
    const player = newPlayers[playerIndex]
    
    switch (player.currentAction) {
      case 'Remove 1 item of clothing':
        if (player.clothes > 0) {
          newPlayers[playerIndex].clothes = Math.max(0, player.clothes - 1)
          historyEntry += `Removed 1 item - Now has ${newPlayers[playerIndex].clothes} items`
        } else {
          historyEntry += `Already naked!`
        }
        break
      
      case 'Remove 2 items of clothing':
        if (player.clothes > 0) {
          newPlayers[playerIndex].clothes = Math.max(0, player.clothes - 2)
          historyEntry += `Removed 2 items - Now has ${newPlayers[playerIndex].clothes} items`
        } else {
          historyEntry += `Already naked!`
        }
        break
      
             case 'Add 1 item of clothing':
         if (player.clothes < player.maxClothes) {
           newPlayers[playerIndex].clothes = Math.min(player.maxClothes, player.clothes + 1)
           historyEntry += `Added 1 item - Now has ${newPlayers[playerIndex].clothes} items`
         } else {
           historyEntry += `Already fully clothed - No need to add clothes!`
         }
         break
       
       case 'Add 2 items of clothing':
         if (player.clothes < player.maxClothes) {
           newPlayers[playerIndex].clothes = Math.min(player.maxClothes, player.clothes + 2)
           historyEntry += `Added 2 items - Now has ${newPlayers[playerIndex].clothes} items`
         } else {
           historyEntry += `Already fully clothed - No need to add clothes!`
         }
         break
    }

    newPlayers[playerIndex].hasChosen = true
    setPlayers(newPlayers)
    setGameHistory([...gameHistory, historyEntry])
    
    // Check if all players have made their choices
    const allChosen = newPlayers.every(p => p.hasChosen)
    if (allChosen) {
      // Move to next round
      setRoundNumber(roundNumber + 1)
      setCurrentPlayer((currentPlayer + 1) % players.length)
      setGameState('playing')
    }
  }

  const resetGame = () => {
    setGameState('setup')
    setPlayers([])
    setCurrentPlayer(0)
    setGameHistory([])
    setRoundNumber(1)
  }

  const getClothingDisplay = (clothes: number, maxClothes: number) => {
    if (clothes === 0) return '🫣 Completely naked!'
    if (clothes === maxClothes) return '👔 Fully dressed'
    return `👕 ${clothes}/${maxClothes} items`
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl md:text-6xl mb-4">👕</div>
        <h1 className="text-2xl md:text-3xl font-bold text-purple-800 mb-4">Strip Game</h1>
                 <p className="text-base md:text-lg text-gray-600">
           A strategic party game for 2-8 players! Roll for actions, use cards to escape your fate, and see who can keep their clothes the longest!
         </p>
      </div>

      {gameState === 'setup' ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Game Setup</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <Users className="mr-2" />
                  Number of Players (2-8)
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                                         onClick={() => {
                       const playerCount = Math.max(2, players.length - 1)
                       setPlayers(Array.from({ length: playerCount }, (_, i) => ({
                         id: i,
                         name: `Player ${i + 1}`,
                         clothes: 5,
                         maxClothes: 5,
                         freeCards: 2,
                         bustCards: 2,
                         currentAction: '',
                         hasChosen: false,
                         choiceResult: ''
                       })))
                     }}
                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold text-purple-800 min-w-[3rem] text-center">
                    {players.length || 2}
                  </span>
                  <button
                                         onClick={() => {
                       const playerCount = Math.min(8, players.length + 1)
                       setPlayers(Array.from({ length: playerCount }, (_, i) => ({
                         id: i,
                         name: `Player ${i + 1}`,
                         clothes: 5,
                         maxClothes: 5,
                         freeCards: 2,
                         bustCards: 2,
                         currentAction: '',
                         hasChosen: false,
                         choiceResult: ''
                       })))
                     }}
                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <Shirt className="mr-2" />
                  Starting Clothes per Player (1-10)
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      if (players.length > 0) {
                        const newClothes = Math.max(1, players[0].maxClothes - 1)
                        setPlayers(players.map(p => ({ ...p, clothes: newClothes, maxClothes: newClothes })))
                      }
                    }}
                    className="p-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold text-pink-800 min-w-[3rem] text-center">
                    {players.length > 0 ? players[0].maxClothes : 5}
                  </span>
                  <button
                    onClick={() => {
                      if (players.length > 0) {
                        const newClothes = Math.min(10, players[0].maxClothes + 1)
                        setPlayers(players.map(p => ({ ...p, clothes: newClothes, maxClothes: newClothes })))
                      }
                    }}
                    className="p-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => initializePlayers(players.length || 2, players.length > 0 ? players[0].maxClothes : 5)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Start Game
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Game Rules</h3>
              <div className="space-y-3 text-sm">
                                 <div className="bg-purple-50 p-3 rounded-lg">
                   <h4 className="font-semibold text-purple-800 mb-1">🎴 Starting Cards</h4>
                   <p className="text-gray-700">Each player gets 2 free cards and 2 bust cards to start</p>
                 </div>
                 <div className="bg-green-50 p-3 rounded-lg">
                   <h4 className="font-semibold text-green-800 mb-1">✅ Free Cards</h4>
                   <p className="text-gray-700">Use these to escape when you roll "remove clothes" actions</p>
                 </div>
                 <div className="bg-red-50 p-3 rounded-lg">
                   <h4 className="font-semibold text-red-800 mb-1">❌ Bust Cards</h4>
                   <p className="text-gray-700">Use these to prevent adding clothes when you roll "add clothes" actions</p>
                 </div>
                 <div className="bg-blue-50 p-3 rounded-lg">
                   <h4 className="font-semibold text-blue-800 mb-1">🎲 Round Actions</h4>
                   <p className="text-gray-700">All players get random actions each round - remove or add clothes!</p>
                 </div>
                 <div className="bg-yellow-50 p-3 rounded-lg">
                   <h4 className="font-semibold text-yellow-800 mb-1">❓ Escape Your Fate</h4>
                   <p className="text-gray-700">Choose between 2 mystery buttons - one does the action, one uses a card!</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Game Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-purple-800">Round {roundNumber}</h2>
                <p className="text-sm text-gray-600">Current Turn: {players[currentPlayer]?.name}</p>
              </div>
              <button
                onClick={resetGame}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <RotateCcw className="mr-2 w-4 h-4" />
                Reset Game
              </button>
            </div>
            
            {gameState === 'playing' ? (
              <button
                onClick={rollDice}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center text-lg"
              >
                <Shuffle className="mr-3 w-6 h-6" />
                Roll for Actions
              </button>
            ) : (
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-4">
                  All players have rolled! Choose your action on your card.
                </p>
                <p className="text-sm text-gray-500">
                  Each player must choose one of the two buttons on their card - one performs the action, one uses a card!
                </p>
              </div>
            )}
          </div>

          {/* Player Status */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((player, index) => (
                             <div
                 key={player.id}
                 className={`bg-white rounded-lg shadow-lg p-6 border-2 min-h-[280px] transition-all duration-300 ${
                   player.clothes === 0 
                     ? 'border-red-500 bg-red-50 shadow-red-200 transform -translate-y-1' 
                     : index === currentPlayer 
                       ? 'border-purple-500 bg-purple-50' 
                       : 'border-gray-200'
                 }`}
               >
                <h3 className="font-bold text-lg text-gray-800 mb-2">{player.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {getClothingDisplay(player.clothes, player.maxClothes)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(player.clothes / player.maxClothes) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mb-4">
                  <span className="text-green-600">✅ {player.freeCards}</span>
                  <span className="text-red-600">❌ {player.bustCards}</span>
                </div>
                
                {/* Action Display */}
                {player.currentAction && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Action:</p>
                    <p className="text-sm font-semibold text-purple-700">{player.currentAction}</p>
                                         {player.hasChosen && (
                       <p className={`text-xs mt-1 ${player.choiceResult.includes('Lucky') ? 'text-green-600' : 'text-red-600'}`}>
                         ✓ {player.choiceResult}
                       </p>
                     )}
                  </div>
                )}
                
                                 {/* Choice Buttons - Only show if player hasn't chosen yet and has clothes */}
                 {gameState === 'choice' && player.currentAction && !player.hasChosen && player.clothes > 0 && (
                   <div className="grid grid-cols-2 gap-2 mt-auto">
                     <button
                       onClick={() => handleChoice(player.id, 1)}
                       className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors text-sm"
                     >
                       Escape Your Fate
                     </button>
                     <button
                       onClick={() => handleChoice(player.id, 2)}
                       className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-2 px-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-sm"
                     >
                       Escape Your Fate
                     </button>
                   </div>
                 )}
                 
                 {/* Out of game indicator */}
                 {player.clothes === 0 && (
                   <div className="mt-auto text-center">
                     <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                       <p className="text-red-700 font-semibold text-sm">🫣 OUT OF GAME!</p>
                       <p className="text-red-600 text-xs">No clothes left to remove</p>
                     </div>
                   </div>
                 )}
              </div>
            ))}
          </div>

          {/* Game History */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Game History</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {gameHistory.map((entry, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StripGame
