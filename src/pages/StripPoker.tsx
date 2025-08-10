import React, { useState, useEffect } from 'react'
import { Play, Settings } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

interface ClothingItem {
  id: string
  name: string
  category: 'upper' | 'lower' | 'underwear' | 'accessories' | 'footwear'
  isWearing: boolean
}

interface PlayerClothing {
  playerId: string
  playerName: string
  clothing: ClothingItem[]
}

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
  value: number // For easy comparison (A=14, K=13, Q=12, J=11)
}

interface PlayerHand {
  playerId: string
  playerName: string
  holeCards: Card[]
  bestHand: Card[]
  handRank: number
  handName: string
}

interface GameRound {
  communityCards: Card[]
  playerHands: PlayerHand[]
  winner: string | null
  losers: string[]
  isComplete: boolean
}

const StripPoker = () => {
  const settings = useSettings()
  const [gamePhase, setGamePhase] = useState<'setup' | 'game'>('setup')
  const [players, setPlayers] = useState<string[]>(settings.players.names)
  const [playerClothing, setPlayerClothing] = useState<PlayerClothing[]>([])
  const [clothingCounts, setClothingCounts] = useState<{[key: string]: number}>({})
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null)
  const [gameHistory, setGameHistory] = useState<GameRound[]>([])
  const [isDealing, setIsDealing] = useState(false)
  const [showRemoveClothingMessage, setShowRemoveClothingMessage] = useState<string | null>(null)
  
  // Initialize clothing counts for all players
  useEffect(() => {
    if (Object.keys(clothingCounts).length === 0 && players.length > 0) {
      const initialCounts: {[key: string]: number} = {}
      players.forEach(playerName => {
        initialCounts[playerName] = 5 // Default 5 clothing items
      })
      setClothingCounts(initialCounts)
    }
  }, [players, clothingCounts])
  
  // Create clothing items based on counts when starting game
  const initializeGame = () => {
    const initialClothing = players.map((playerName, index) => {
      const count = clothingCounts[playerName] || 5
      const clothing: ClothingItem[] = []
      
      // Create clothing items based on the count
      for (let i = 0; i < count; i++) {
        clothing.push({
          id: `${index}-${i}`,
          name: `Item ${i + 1}`,
          category: 'upper' as const,
          isWearing: true
        })
      }
      
      return {
        playerId: `player-${index}`,
        playerName,
        clothing
      }
    })
    setPlayerClothing(initialClothing)
    setGamePhase('game')
  }



  // Update players when settings change
  useEffect(() => {
    setPlayers(settings.players.names)
  }, [settings.players.names])

  const getWearingCount = (clothing: ClothingItem[]) => {
    return clothing.filter(item => item.isWearing).length
  }

  const updateClothingCount = (playerName: string, count: number) => {
    setClothingCounts(prev => ({
      ...prev,
      [playerName]: Math.max(1, Math.min(20, count)) // Min 1, Max 20 items
    }))
  }

  // Card utilities
  const createDeck = (): Card[] => {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
    const ranks: Card['rank'][] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    const deck: Card[] = []

    for (const suit of suits) {
      for (let i = 0; i < ranks.length; i++) {
        const rank = ranks[i]
        let value = i + 2 // 2=2, 3=3, ..., K=13
        if (rank === 'A') value = 14 // Ace high
        deck.push({ suit, rank, value })
      }
    }

    return shuffleDeck(deck)
  }

  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Hand evaluation (proper Texas Hold'em)
  const evaluateHand = (holeCards: Card[], communityCards: Card[]): { bestHand: Card[], handRank: number, handName: string } => {
    const allCards = [...holeCards, ...communityCards]
    
    // Get all possible 5-card combinations
    const combinations = getCombinations(allCards, 5)
    let bestEvaluation = { bestHand: [], handRank: 0, handName: 'High Card' }
    
    for (const combo of combinations) {
      const evaluation = evaluatePokerHand(combo)
      if (evaluation.handRank > bestEvaluation.handRank) {
        bestEvaluation = {
          bestHand: combo,
          handRank: evaluation.handRank,
          handName: evaluation.handName
        }
      }
    }
    
    return bestEvaluation
  }

  // Get all combinations of k elements from array
  const getCombinations = (arr: Card[], k: number): Card[][] => {
    if (k === 1) return arr.map(card => [card])
    if (k === arr.length) return [arr]
    if (k > arr.length) return []
    
    const combinations: Card[][] = []
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i]
      const tailCombinations = getCombinations(arr.slice(i + 1), k - 1)
      for (const tailCombo of tailCombinations) {
        combinations.push([head, ...tailCombo])
      }
    }
    return combinations
  }

  // Evaluate a 5-card poker hand
  const evaluatePokerHand = (cards: Card[]): { handRank: number, handName: string } => {
    const sortedCards = [...cards].sort((a, b) => b.value - a.value)
    const values = sortedCards.map(card => card.value)
    const suits = sortedCards.map(card => card.suit)
    
    // Count occurrences of each value
    const valueCounts: { [key: number]: number } = {}
    values.forEach(value => {
      valueCounts[value] = (valueCounts[value] || 0) + 1
    })
    
    const counts = Object.values(valueCounts).sort((a, b) => b - a)
    const isFlush = suits.every(suit => suit === suits[0])
    const isStraight = checkStraight(values)
    
    // Hand rankings (higher number = better hand)
    if (isStraight && isFlush) {
      if (values[0] === 14 && values[4] === 10) {
        return { handRank: 10000000, handName: 'Royal Flush' }
      }
      return { handRank: 9000000 + values[0], handName: 'Straight Flush' }
    }
    
    if (counts[0] === 4) {
      const fourKindValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 4)
      const rankName = getRankName(Number(fourKindValue))
      return { handRank: 8000000 + Number(fourKindValue), handName: `Four ${rankName}s` }
    }
    
    if (counts[0] === 3 && counts[1] === 2) {
      const threeKindValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 3)
      const pairValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 2)
      const threeRankName = getRankName(Number(threeKindValue))
      const pairRankName = getRankName(Number(pairValue))
      return { handRank: 7000000 + Number(threeKindValue) * 100 + Number(pairValue), handName: `${threeRankName}s full of ${pairRankName}s` }
    }
    
    if (isFlush) {
      return { handRank: 6000000 + values[0] * 10000 + values[1] * 100 + values[2], handName: 'Flush' }
    }
    
    if (isStraight) {
      return { handRank: 5000000 + values[0], handName: 'Straight' }
    }
    
    if (counts[0] === 3) {
      const threeKindValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 3)
      const rankName = getRankName(Number(threeKindValue))
      return { handRank: 4000000 + Number(threeKindValue), handName: `Three ${rankName}s` }
    }
    
    if (counts[0] === 2 && counts[1] === 2) {
      const pairs = Object.keys(valueCounts).filter(key => valueCounts[Number(key)] === 2).map(Number).sort((a, b) => b - a)
      const highPairName = getRankName(pairs[0])
      const lowPairName = getRankName(pairs[1])
      return { handRank: 3000000 + pairs[0] * 100 + pairs[1], handName: `${highPairName}s and ${lowPairName}s` }
    }
    
    if (counts[0] === 2) {
      const pairValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 2)
      const rankName = getRankName(Number(pairValue))
      return { handRank: 2000000 + Number(pairValue), handName: `Pair of ${rankName}s` }
    }
    
    // High card
    return { 
      handRank: 1000000 + values[0] * 10000 + values[1] * 100 + values[2], 
      handName: `High Card ${sortedCards[0].rank}` 
    }
  }

  // Check if cards form a straight
  const checkStraight = (values: number[]): boolean => {
    const sortedValues = [...values].sort((a, b) => a - b)
    
    // Check for regular straight
    for (let i = 0; i < 4; i++) {
      if (sortedValues[i + 1] - sortedValues[i] !== 1) {
        break
      }
      if (i === 3) return true
    }
    
    // Check for A-2-3-4-5 straight (wheel)
    if (sortedValues[0] === 2 && sortedValues[1] === 3 && sortedValues[2] === 4 && sortedValues[3] === 5 && sortedValues[4] === 14) {
      return true
    }
    
    return false
  }

  // Deal new round
  const dealNewRound = () => {
    if (isDealing) return
    
    const activePlayers = getActivePlayers()
    if (activePlayers.length < 2) {
      // Game over - not enough active players
      return
    }
    
    setIsDealing(true)
    const deck = createDeck()
    let cardIndex = 0
    
    // Deal 2 hole cards to each active player only
    const playerHands: PlayerHand[] = activePlayers.map(player => {
      const holeCards = [deck[cardIndex++], deck[cardIndex++]]
      return {
        playerId: player.playerId,
        playerName: player.playerName,
        holeCards,
        bestHand: [],
        handRank: 0,
        handName: ''
      }
    })
    
    // Deal 5 community cards
    const communityCards = [
      deck[cardIndex++],
      deck[cardIndex++],
      deck[cardIndex++],
      deck[cardIndex++],
      deck[cardIndex++]
    ]
    
    // Evaluate all hands
    const evaluatedHands = playerHands.map(hand => {
      const evaluation = evaluateHand(hand.holeCards, communityCards)
      return {
        ...hand,
        bestHand: evaluation.bestHand,
        handRank: evaluation.handRank,
        handName: evaluation.handName
      }
    })
    
    // Determine winner and losers
    const sortedHands = [...evaluatedHands].sort((a, b) => b.handRank - a.handRank)
    const winner = sortedHands[0].playerId
    const losers = sortedHands.slice(1).map(hand => hand.playerId)
    
    const newRound: GameRound = {
      communityCards,
      playerHands: evaluatedHands,
      winner,
      losers,
      isComplete: true
    }
    
    setCurrentRound(newRound)
    setGameHistory(prev => [...prev, newRound])
    
    // Show remove clothing message on winner's card
    setShowRemoveClothingMessage(winner)
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setShowRemoveClothingMessage(null)
    }, 3000)
    
    // Remove clothing from winner (reversed logic)
    setTimeout(() => {
      removeClothingFromWinner(winner)
      setIsDealing(false)
    }, 2000)
  }

  const removeClothingFromWinner = (winnerId: string) => {
    // Check if winner is about to lose their last item
    const isWinnerLosingLastItem = isLastClothingItem(winnerId)
    
    if (isWinnerLosingLastItem) {
      // Show dramatic message for winner losing their last item
      const player = playerClothing.find(p => p.playerId === winnerId)
      if (player) {
        console.log(`🚨 FINAL ELIMINATION! ${player.playerName} won but must remove their last clothing item! 🚨`)
      }
    }
    
    setPlayerClothing(prev => 
      prev.map(player => {
        if (player.playerId === winnerId) {
          const wearingItems = player.clothing.filter(item => item.isWearing)
          if (wearingItems.length > 0) {
            // Remove random clothing item from winner
            const randomIndex = Math.floor(Math.random() * wearingItems.length)
            const itemToRemove = wearingItems[randomIndex]
            
            return {
              ...player,
              clothing: player.clothing.map(item =>
                item.id === itemToRemove.id ? { ...item, isWearing: false } : item
              )
            }
          }
        }
        return player
      })
    )
  }

  const removeClothingFromLosers = (loserIds: string[]) => {
    // Check for players about to lose their last item
    const playersLosingLastItem = loserIds.filter(id => isLastClothingItem(id))
    
    if (playersLosingLastItem.length > 0) {
      // Show dramatic message for players losing their last item
      const playerNames = playersLosingLastItem.map(id => {
        const player = playerClothing.find(p => p.playerId === id)
        return player?.playerName
      }).filter(Boolean)
      
      console.log(`🚨 FINAL ELIMINATION! ${playerNames.join(' and ')} must remove their last clothing item! 🚨`)
    }
    
    setPlayerClothing(prev => 
      prev.map(player => {
        if (loserIds.includes(player.playerId)) {
          const wearingItems = player.clothing.filter(item => item.isWearing)
          if (wearingItems.length > 0) {
            // Remove random clothing item
            const randomIndex = Math.floor(Math.random() * wearingItems.length)
            const itemToRemove = wearingItems[randomIndex]
            
            return {
              ...player,
              clothing: player.clothing.map(item =>
                item.id === itemToRemove.id ? { ...item, isWearing: false } : item
              )
            }
          }
        }
        return player
      })
    )
  }

  const getActivePlayers = () => {
    return playerClothing.filter(player => getWearingCount(player.clothing) > 0)
  }

  const isPlayerEliminated = (playerId: string) => {
    const player = playerClothing.find(p => p.playerId === playerId)
    return player ? getWearingCount(player.clothing) === 0 : false
  }

  const isLastClothingItem = (playerId: string) => {
    const player = playerClothing.find(p => p.playerId === playerId)
    return player ? getWearingCount(player.clothing) === 1 : false
  }

  const getCardSymbol = (suit: Card['suit']): string => {
    switch (suit) {
      case 'hearts': return '♥️'
      case 'diamonds': return '♦️'
      case 'clubs': return '♣️'
      case 'spades': return '♠️'
    }
  }

  const getCardColor = (suit: Card['suit']): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'
  }

  const getRankName = (value: number): string => {
    switch (value) {
      case 14: return 'Ace'
      case 13: return 'King'
      case 12: return 'Queen'
      case 11: return 'Jack'
      default: return value.toString()
    }
  }

  // Setup phase render
  const renderSetup = () => (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="text-6xl mb-6">🃏</div>
        <h1 className="text-3xl font-bold text-purple-800 mb-4">Strip Poker Setup</h1>
        <p className="text-lg text-gray-600 mb-8">
          Enter how many clothing items each player is wearing to start the game.
        </p>
        
        <div className="space-y-6 mb-8">
          {players.map((playerName, index) => (
            <div key={index} className="flex items-center justify-center space-x-4">
              <label className="text-lg font-medium text-gray-700 w-32 text-right">
                {playerName}:
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateClothingCount(playerName, (clothingCounts[playerName] || 5) - 1)}
                  className="w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={clothingCounts[playerName] || 5}
                  onChange={(e) => updateClothingCount(playerName, parseInt(e.target.value) || 5)}
                  className="w-20 h-10 text-center text-lg border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={() => updateClothingCount(playerName, (clothingCounts[playerName] || 5) + 1)}
                  className="w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500 w-20 text-left">
                {clothingCounts[playerName] === 1 ? 'item' : 'items'}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Game Rules:</h3>
          <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto">
            <li>• Players are dealt cards each round</li>
            <li>• Lowest hand loses and removes one clothing item</li>
            <li>• Game continues until someone is fully undressed</li>
            <li>• Have fun and play responsibly! 😉</li>
          </ul>
        </div>

        <button
          onClick={initializeGame}
          className="btn-primary px-8 py-4 text-xl"
        >
          <Play className="w-6 h-6 mr-2" />
          Start Strip Poker Game!
        </button>
      </div>
    </div>
  )





  // Calculate player positions around the poker table
  // Fixed 8-spot table layout: 2 top, 2 each side, 2 bottom
  const getPlayerPositions = (playerCount: number) => {
    // Define the 8 fixed spots around the table with better spacing
    const fixedSpots = [
      { top: 5, left: '30%', transform: 'translateX(-50%)' },   // Spot 1: Top Left
      { top: 5, right: '30%', transform: 'translateX(50%)' },  // Spot 2: Top Right
      { top: '25%', right: 2, transform: 'translateY(-50%)' }, // Spot 3: Right Top
      { bottom: '25%', right: 2, transform: 'translateY(50%)' }, // Spot 4: Right Bottom
      { bottom: 5, right: '30%', transform: 'translateX(50%)' }, // Spot 5: Bottom Right
      { bottom: 5, left: '30%', transform: 'translateX(-50%)' }, // Spot 6: Bottom Left
      { bottom: '25%', left: 2, transform: 'translateY(50%)' }, // Spot 7: Left Bottom
      { top: '25%', left: 2, transform: 'translateY(-50%)' }   // Spot 8: Left Top
    ]

    // For different player counts, use the appropriate spots
    const spotAssignments = {
      2: [0, 4], // Top left and bottom right
      3: [0, 2, 4], // Top left, right top, bottom right
      4: [0, 2, 4, 6], // Top left, right top, bottom right, left bottom
      5: [0, 1, 2, 4, 6], // Top left, top right, right top, bottom right, left bottom
      6: [0, 1, 2, 4, 5, 6], // All except right bottom and left top
      7: [0, 1, 2, 3, 4, 5, 6], // All except left top
      8: [0, 1, 2, 3, 4, 5, 6, 7] // All spots
    }

    const spots = spotAssignments[Math.min(playerCount, 8) as keyof typeof spotAssignments] || spotAssignments[2]
    return spots.map(spotIndex => fixedSpots[spotIndex])
  }

  const renderPokerTable = () => {
    const positions = getPlayerPositions(playerClothing.length)
    
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">🃏 Strip Poker Table</h1>
          <p className="text-gray-600">
            Welcome to the table! Let the games begin...
          </p>
        </div>

        {/* Poker Table */}
        <div className="relative mx-auto" style={{ width: '800px', height: '500px' }}>
          {/* Table Surface */}
          <div 
            className="absolute inset-4 rounded-full border-8 border-amber-800 shadow-2xl"
            style={{
              background: 'radial-gradient(ellipse at center, #0f5132 0%, #198754 50%, #0f5132 100%)',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3), 0 0 50px rgba(0,0,0,0.3)'
            }}
          >
            {/* Table Center */}
            <div className="absolute inset-8 rounded-full border-2 border-amber-600 bg-green-800 bg-opacity-20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🃏</div>
              </div>
            </div>

            {/* Dealer Position Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-amber-900 px-3 py-1 rounded-full text-xs font-bold">
              DEALER
            </div>

            {/* Table Spot Markers - Show empty spots */}
            {(() => {
              const allSpots = [
                { top: 5, left: '30%', transform: 'translateX(-50%)' },   // Spot 1: Top Left
                { top: 5, right: '30%', transform: 'translateX(50%)' },  // Spot 2: Top Right
                { top: '25%', right: 2, transform: 'translateY(-50%)' }, // Spot 3: Right Top
                { bottom: '25%', right: 2, transform: 'translateY(50%)' }, // Spot 4: Right Bottom
                { bottom: 5, right: '30%', transform: 'translateX(50%)' }, // Spot 5: Bottom Right
                { bottom: 5, left: '30%', transform: 'translateX(-50%)' }, // Spot 6: Bottom Left
                { bottom: '25%', left: 2, transform: 'translateY(50%)' }, // Spot 7: Left Bottom
                { top: '25%', left: 2, transform: 'translateY(-50%)' }   // Spot 8: Left Top
              ]
              
              const spotAssignments = {
                2: [0, 4], // Top left and bottom right
                3: [0, 2, 4], // Top left, right top, bottom right
                4: [0, 2, 4, 6], // Top left, right top, bottom right, left bottom
                5: [0, 1, 2, 4, 6], // Top left, top right, right top, bottom right, left bottom
                6: [0, 1, 2, 4, 5, 6], // All except right bottom and left top
                7: [0, 1, 2, 3, 4, 5, 6], // All except left top
                8: [0, 1, 2, 3, 4, 5, 6, 7] // All spots
              }
              
              const spots = spotAssignments[Math.min(playerClothing.length, 8) as keyof typeof spotAssignments] || spotAssignments[2]
              
              return allSpots.map((spot, index) => {
                const isUsed = spots.includes(index)
                
                if (isUsed) return null
                
                return (
                  <div
                    key={index}
                    className="absolute w-6 h-6 border-2 border-amber-500 border-dashed rounded-full bg-amber-100 bg-opacity-30"
                    style={spot}
                  />
                )
              })
            })()}
          </div>

          {/* Players around the table */}
          {playerClothing.map((player, index) => {
            const position = positions[index]
            const clothingCount = getWearingCount(player.clothing)
            const playerHand = currentRound?.playerHands.find(h => h.playerId === player.playerId)
            const isWinner = currentRound?.winner === player.playerId
            const isLoser = currentRound?.losers.includes(player.playerId)
            const isEliminated = isPlayerEliminated(player.playerId)
            const isLastItem = isLastClothingItem(player.playerId)
            const isWinnerInDanger = isWinner && isLastItem
            
            return (
              <div
                key={player.playerId}
                className="absolute"
                style={position}
              >
                {/* Player Card - Bigger Version */}
                <div className={`bg-white rounded-lg shadow-lg border-3 p-3 min-w-[100px] max-w-[120px] ${
                  isEliminated ? 'border-gray-400 bg-gray-100 opacity-75' :
                  isWinnerInDanger ? 'animate-danger-pulse' :
                  isWinner ? 'border-green-500 bg-green-50 animate-celebrate' : 
                  isLastItem ? 'border-orange-400 bg-orange-50' :
                  isLoser ? 'border-blue-500 bg-blue-50' : 
                  'border-purple-200'
                }`}>
                  {/* Player Name */}
                  <div className="text-center mb-1">
                    <div className={`font-semibold text-xs truncate ${
                      isEliminated ? 'text-gray-500' :
                      isWinnerInDanger ? 'text-orange-800' :
                      isWinner ? 'text-green-800' : 
                      isLoser ? 'text-blue-800' : 
                      'text-gray-800'
                    }`}>
                      {isEliminated && '💀 '}
                      {isWinnerInDanger && '⚠️🏆 '}
                      {isWinner && !isWinnerInDanger && '🎉 '}
                      {player.playerName}
                      {isEliminated && ' 💀'}
                      {isWinnerInDanger && ' ⚠️🏆'}
                      {isWinner && !isWinnerInDanger && ' 🏆🎉'}
                    </div>
                  </div>

                  {/* Clothing Status */}
                  <div className="text-center mb-1">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-xs text-gray-600">👕</span>
                      <span className="text-xs font-bold text-purple-600">
                        {clothingCount}
                      </span>
                    </div>
                  </div>

                  {/* Temporary Remove Clothing Message */}
                  {showRemoveClothingMessage === player.playerId && (
                    <div className="text-center mb-1 animate-pulse">
                      <div className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-300">
                        Remove 1 clothing item!
                      </div>
                    </div>
                  )}

                  {/* Player Hole Cards */}
                  <div className="flex justify-center space-x-1 mb-1">
                    {playerHand?.holeCards.map((card, cardIndex) => (
                      <div
                        key={cardIndex}
                        className={`w-5 h-7 bg-white rounded border-2 flex flex-col items-center justify-center text-xs shadow-sm ${
                          isWinnerInDanger ? 'border-orange-400 animate-flicker' :
                          isWinner ? 'border-green-400 animate-flicker-gold' : 
                          isLoser ? 'border-blue-400' : 
                          'border-purple-400'
                        }`}
                      >
                        <div className={getCardColor(card.suit)}>{card.rank}</div>
                        <div className={getCardColor(card.suit)}>{getCardSymbol(card.suit)}</div>
                      </div>
                    )) || [1, 2].map((cardIndex) => (
                      <div
                        key={cardIndex}
                        className="w-5 h-7 bg-blue-600 rounded border-2 border-blue-800 flex items-center justify-center"
                      >
                        <div className="text-white text-xs">🂠</div>
                      </div>
                    ))}
                  </div>

                  {/* Hand Name */}
                  {playerHand && (
                    <div className="text-center">
                      <div className="text-xs text-gray-600 truncate">
                        {playerHand.handName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Community Cards Area (center of table) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
            {/* Deal Cards Button */}
            <div className="text-center mb-4">
              <button
                onClick={dealNewRound}
                disabled={isDealing || getActivePlayers().length < 2}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isDealing || getActivePlayers().length < 2
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                }`}
              >
                <Play className="w-5 h-5 mr-2" />
                {isDealing ? 'Dealing...' : 
                 getActivePlayers().length < 2 ? 'Game Over' : 
                 'Deal Cards'}
              </button>
            </div>
            
            <div className="flex space-x-2">
              {currentRound?.communityCards.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className="w-10 h-14 bg-white rounded border-4 border-yellow-400 flex flex-col items-center justify-center animate-flicker shadow-lg"
                >
                  <div className={`text-lg font-bold ${getCardColor(card.suit)}`}>
                    {card.rank}
                  </div>
                  <div className={`text-lg ${getCardColor(card.suit)}`}>
                    {getCardSymbol(card.suit)}
                  </div>
                </div>
              )) || [1, 2, 3, 4, 5].map((cardIndex) => (
                <div
                  key={cardIndex}
                  className="w-10 h-14 bg-gray-300 rounded border-4 border-gray-500 flex items-center justify-center"
                >
                  <div className="text-gray-500 text-xs">?</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-amber-200">Community Cards</span>
            </div>
          </div>


        </div>

        {/* Game Over / Elimination Notifications */}
        {currentRound && (() => {
          const activePlayers = getActivePlayers()
          const winnerEliminated = isPlayerEliminated(currentRound.winner)
          const playersLosingLast = winnerEliminated ? [currentRound.winner] : []
          
          // Game Over - Only one player left
          if (activePlayers.length === 1) {
            const winner = activePlayers[0]
            return (
              <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg p-8 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-6">👑🏆👑</div>
                  <h1 className="text-4xl font-bold mb-4">GAME OVER!</h1>
                  <div className="text-2xl mb-4">
                    🎉 {winner.playerName} WINS! 🎉
                  </div>
                  <div className="text-lg opacity-90">
                    Congratulations! You're the last player standing with {getWearingCount(winner.clothing)} clothing items remaining!
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setGamePhase('setup')
                        setCurrentRound(null)
                        setGameHistory([])
                      }}
                      className="px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          
          // Elimination notification
          return playersLosingLast.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-lg p-6 text-white animate-pulse">
              <div className="text-center">
                <div className="text-4xl mb-4">🚨💀🚨</div>
                <h2 className="text-2xl font-bold mb-2">ELIMINATION!</h2>
                <div className="text-lg">
                  {playersLosingLast.map(id => {
                    const player = playerClothing.find(p => p.playerId === id)
                    return player?.playerName
                  }).filter(Boolean).join(' and ')} {playersLosingLast.length === 1 ? 'has' : 'have'} been eliminated!
                </div>
                <div className="text-sm mt-2 opacity-90">
                  {winnerEliminated ? 'The winner had to remove their last clothing item and is out of the game!' : 
                   'They have lost their last clothing item and are out of the game!'}
                </div>
                <div className="text-sm mt-2 font-semibold">
                  {activePlayers.length} player{activePlayers.length === 1 ? '' : 's'} remaining
                </div>
              </div>
            </div>
          )
        })()}



        {/* Round Results */}
        {currentRound && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Round Results
            </h3>
            <div className="text-center mb-4">
              {currentRound.playerHands.map(hand => (
                <div 
                  key={hand.playerId}
                  className={`inline-block mx-2 px-4 py-2 rounded-lg ${
                    hand.playerId === currentRound.winner 
                      ? 'bg-orange-100 text-orange-800 border-2 border-orange-500'
                      : 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                  }`}
                >
                  <div className="font-semibold">
                    {hand.playerName} 
                    {hand.playerId === currentRound.winner && ' 🏆⚠️'}
                  </div>
                  <div className="text-sm">{hand.handName}</div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              {currentRound.winner && (
                <p>
                  <span className="font-semibold text-orange-700">
                    {currentRound.playerHands.find(h => h.playerId === currentRound.winner)?.playerName}
                  </span> won but must remove one clothing item! 
                  Others stay safe.
                </p>
              )}
            </div>
          </div>
        )}




      </div>
    )
  }

  if (gamePhase === 'setup') {
    return renderSetup()
  }

  return renderPokerTable()
}

export default StripPoker