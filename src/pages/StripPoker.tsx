import React, { useState, useEffect } from 'react'
import { Play, Settings, ChevronRight } from 'lucide-react'
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
  winners: string[] // Add support for multiple winners
  losers: string[]
  isComplete: boolean
}

interface ScoreBasedRound {
  phase: 'preflop' | 'flop' | 'turn' | 'river' | 'complete'
  communityCards: Card[]
  playerHands: PlayerHand[]
  foldedPlayers: string[]
  activePlayers: string[]
  winner: string | null
  winners: string[] // Add support for multiple winners
  losers: string[]
  isComplete: boolean
}

const StripPoker = () => {
  const settings = useSettings()
  const [gamePhase, setGamePhase] = useState<'setup' | 'game'>('setup')
  const [gameMode, setGameMode] = useState<'simplified' | 'score-based'>('simplified')
  const [players, setPlayers] = useState<string[]>(settings.players.names)
  const [playerClothing, setPlayerClothing] = useState<PlayerClothing[]>([])
  const [clothingCounts, setClothingCounts] = useState<{[key: string]: number}>({})
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null)
  const [scoreBasedRound, setScoreBasedRound] = useState<ScoreBasedRound | null>(null)
  const [gameHistory, setGameHistory] = useState<GameRound[]>([])
  const [isDealing, setIsDealing] = useState(false)
  const [showRemoveClothingMessage, setShowRemoveClothingMessage] = useState<string | null>(null)
  const [waitingForFolds, setWaitingForFolds] = useState(false)
  
  // Effect to handle remove clothing message timing
  useEffect(() => {
    if (showRemoveClothingMessage) {
      const timer = setTimeout(() => {
        setShowRemoveClothingMessage(null)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [showRemoveClothingMessage])

  // Effect to handle waitingForFolds state management
  useEffect(() => {
    if (scoreBasedRound && scoreBasedRound.isComplete) {
      // Ensure waitingForFolds is false when round is complete
      setWaitingForFolds(false)
    }
  }, [scoreBasedRound?.isComplete])

  // Debug effect to log state changes (commented out to reduce console noise)
  // useEffect(() => {
  //   console.log('Active players:', getActivePlayers().length, getActivePlayers().map(p => p.playerName))
  //   console.log('Score-based round state:', scoreBasedRound?.phase, scoreBasedRound?.isComplete, waitingForFolds)
  // }, [playerClothing, scoreBasedRound, waitingForFolds])
  
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
    
    // Start the appropriate game mode
    if (gameMode === 'score-based') {
      startScoreBasedRound()
    }
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
    let bestEvaluation: { bestHand: Card[], handRank: number, handName: string } = { bestHand: [], handRank: 0, handName: 'High Card' }
    
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
      const kickerValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 1)
      const rankName = getRankName(Number(fourKindValue))
      return { handRank: 8000000 + Number(fourKindValue) * 100 + Number(kickerValue), handName: `Four ${rankName}s` }
    }
    
    if (counts[0] === 3 && counts[1] === 2) {
      const threeKindValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 3)
      const pairValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 2)
      const threeRankName = getRankName(Number(threeKindValue))
      const pairRankName = getRankName(Number(pairValue))
      return { handRank: 7000000 + Number(threeKindValue) * 100 + Number(pairValue), handName: `${threeRankName}s full of ${pairRankName}s` }
    }
    
    if (isFlush) {
      return { handRank: 6000000 + values[0] * 10000 + values[1] * 1000 + values[2] * 100 + values[3] * 10 + values[4], handName: 'Flush' }
    }
    
    if (isStraight) {
      return { handRank: 5000000 + values[0], handName: 'Straight' }
    }
    
    if (counts[0] === 3) {
      const threeKindValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 3)
      const kickers = Object.keys(valueCounts).filter(key => valueCounts[Number(key)] === 1).map(Number).sort((a, b) => b - a)
      const rankName = getRankName(Number(threeKindValue))
      return { handRank: 4000000 + Number(threeKindValue) * 10000 + kickers[0] * 100 + kickers[1], handName: `Three ${rankName}s` }
    }
    
    if (counts[0] === 2 && counts[1] === 2) {
      const pairs = Object.keys(valueCounts).filter(key => valueCounts[Number(key)] === 2).map(Number).sort((a, b) => b - a)
      const kickerValue = Object.keys(valueCounts).find(key => valueCounts[Number(key)] === 1)
      const highPairName = getRankName(pairs[0])
      const lowPairName = getRankName(pairs[1])
      return { handRank: 3000000 + pairs[0] * 10000 + pairs[1] * 100 + Number(kickerValue), handName: `${highPairName}s and ${lowPairName}s` }
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
    console.log('dealNewRound - Active players before round:', activePlayers.length, activePlayers.map(p => p.playerName))
    
    if (activePlayers.length <= 1) {
      // Game over - only one player remaining
      console.log('dealNewRound - Game over, only one player remaining')
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
    
    // Determine winners and losers (handle ties)
    const sortedHands = [...evaluatedHands].sort((a, b) => b.handRank - a.handRank)
    const highestRank = sortedHands[0].handRank
    
    // Find all players with the highest hand rank (winners)
    const winners = sortedHands.filter(hand => hand.handRank === highestRank).map(hand => hand.playerId)
    const losers = sortedHands.filter(hand => hand.handRank < highestRank).map(hand => hand.playerId)
    
    // For simplified mode: all winners lose clothes (tie logic)
    const winner = winners[0] // Keep first winner for display purposes
    const allLosers = winners // All winners lose clothes in simplified mode (including ties)
    
    console.log('dealNewRound - Winners:', winners, 'Losers:', losers, 'All losers:', allLosers)
    
    const newRound: GameRound = {
      communityCards,
      playerHands: evaluatedHands,
      winner,
      winners,
      losers: allLosers,
      isComplete: true
    }
    
    setCurrentRound(newRound)
    setGameHistory(prev => [...prev, newRound])
    
    // Show remove clothing message on winner's card
    setShowRemoveClothingMessage(winner)
    
    // Remove clothing from all winners (simplified mode - winners lose, including ties)
    setTimeout(() => {
      console.log('dealNewRound - Removing clothing from winners:', allLosers)
      allLosers.forEach(playerId => removeClothingFromWinner(playerId))
      // Add a small delay to ensure state updates are processed before allowing next round
      setTimeout(() => {
        const remainingPlayers = getActivePlayers()
        console.log('dealNewRound - Active players after clothing removal:', remainingPlayers.length, remainingPlayers.map(p => p.playerName))
        setIsDealing(false)
      }, 100)
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
    
    setPlayerClothing(prev => {
      const updated = prev.map(player => {
        if (player.playerId === winnerId) {
          const wearingItems = player.clothing.filter(item => item.isWearing)
          if (wearingItems.length > 0) {
            // Remove random clothing item from winner
            const randomIndex = Math.floor(Math.random() * wearingItems.length)
            const itemToRemove = wearingItems[randomIndex]
            
            const playerName = player.playerName
            const newWearingCount = wearingItems.length - 1
            console.log(`removeClothingFromWinner - ${playerName}: removing ${itemToRemove.name}, wearing count: ${wearingItems.length} -> ${newWearingCount}`)
            
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
      
      // Log the final state after clothing removal
      const finalActivePlayers = updated.filter(player => getWearingCount(player.clothing) > 0)
      console.log('removeClothingFromWinner - Final active players:', finalActivePlayers.length, finalActivePlayers.map(p => p.playerName))
      
      return updated
    })
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

  // Calculate hand strength percentage for score-based mode
  const calculateHandStrength = (holeCards: Card[], communityCards: Card[] = []): number => {
    if (communityCards.length === 0) {
      // Preflop strength based on hole cards only
      const card1 = holeCards[0]
      const card2 = holeCards[1]
      
      // Standard poker hand strength calculation for preflop
      let strength = 0
      
      // Pairs (strongest preflop hands)
      if (card1.value === card2.value) {
        // AA = 100%, KK = 95%, QQ = 90%, etc.
        strength = 85 + (card1.value - 7) * 2.5 // Aces get 100%, 7s get 85%
        strength = Math.min(100, Math.max(85, strength))
      }
      // Suited hands
      else if (card1.suit === card2.suit) {
        const highCard = Math.max(card1.value, card2.value)
        const lowCard = Math.min(card1.value, card2.value)
        const gap = highCard - lowCard
        
        // AKs = 67%, AQs = 66%, AJs = 65%, etc.
        if (highCard === 14) { // Ace high
          strength = 67 - (lowCard - 10) * 2 // AKs=67%, AQs=65%, AJs=63%, etc.
        } else if (highCard === 13) { // King high
          strength = 60 - (lowCard - 10) * 2
        } else if (highCard === 12) { // Queen high
          strength = 55 - (lowCard - 10) * 2
        } else {
          strength = 50 - gap * 2
        }
        strength = Math.max(30, strength)
      }
      // Connected hands (broadway cards)
      else if (Math.max(card1.value, card2.value) >= 10 && Math.min(card1.value, card2.value) >= 10) {
        const highCard = Math.max(card1.value, card2.value)
        const lowCard = Math.min(card1.value, card2.value)
        const gap = highCard - lowCard
        if (gap === 1) strength = 55 // AK, KQ, QJ, JT
        else if (gap === 2) strength = 50 // AQ, KJ, QT
        else if (gap === 3) strength = 45 // AJ, KQ
        else strength = 40
      }
      // High card hands
      else {
        const highCard = Math.max(card1.value, card2.value)
        const lowCard = Math.min(card1.value, card2.value)
        
        if (highCard === 14) strength = 45 // A with any card
        else if (highCard === 13) strength = 40 // K with any card
        else if (highCard === 12) strength = 35 // Q with any card
        else if (highCard === 11) strength = 30 // J with any card
        else strength = 25
      }
      
      return Math.min(100, Math.max(20, strength))
    } else {
      // Post-flop strength based on actual hand evaluation
      const evaluation = evaluateHand(holeCards, communityCards)
      
      // Convert hand rank to percentage based on poker hand hierarchy
      let strength = 0
      
      if (evaluation.handRank >= 10000000) strength = 100 // Royal Flush
      else if (evaluation.handRank >= 9000000) strength = 99 // Straight Flush
      else if (evaluation.handRank >= 8000000) strength = 98 // Four of a Kind
      else if (evaluation.handRank >= 7000000) strength = 97 // Full House
      else if (evaluation.handRank >= 6000000) strength = 95 // Flush
      else if (evaluation.handRank >= 5000000) strength = 93 // Straight
      else if (evaluation.handRank >= 4000000) strength = 90 // Three of a Kind
      else if (evaluation.handRank >= 3000000) strength = 85 // Two Pair
      else if (evaluation.handRank >= 2000000) strength = 75 // Pair
      else strength = 50 // High Card
      
      // Adjust based on the specific hand value within its category
      const baseRank = Math.floor(evaluation.handRank / 1000000)
      const specificValue = evaluation.handRank % 1000000
      
      if (baseRank === 9) { // Straight Flush
        strength += (specificValue - 14) * 0.1 // Higher straight = better
      } else if (baseRank === 8) { // Four of a Kind
        strength += (specificValue - 14) * 0.5
      } else if (baseRank === 7) { // Full House
        strength += (specificValue - 1400) * 0.01
      } else if (baseRank === 6) { // Flush
        strength += (specificValue - 140000) * 0.0001
      } else if (baseRank === 5) { // Straight
        strength += (specificValue - 14) * 0.5
      } else if (baseRank === 4) { // Three of a Kind
        strength += (specificValue - 14) * 0.5
      } else if (baseRank === 3) { // Two Pair
        strength += (specificValue - 1400) * 0.01
      } else if (baseRank === 2) { // Pair
        strength += (specificValue - 14) * 0.5
      } else { // High Card
        strength += (specificValue - 140000) * 0.0001
      }
      
      return Math.min(100, Math.max(20, strength))
    }
  }

  // Score-based game functions
  const startScoreBasedRound = () => {
    const activePlayers = getActivePlayers()
    if (activePlayers.length <= 1) {
      // Game over - only one player remaining
      return
    }
    
    // Reset any previous round state
    setScoreBasedRound(null)
    setWaitingForFolds(false)
    
    const deck = createDeck()
    let cardIndex = 0
    
    // Deal hole cards to active players only
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

    const newRound: ScoreBasedRound = {
      phase: 'preflop',
      communityCards: [],
      playerHands,
      foldedPlayers: [],
      activePlayers: activePlayers.map(player => player.playerId),
      winner: null,
      winners: [],
      losers: [],
      isComplete: false
    }

    setScoreBasedRound(newRound)
    setWaitingForFolds(true)
  }

  const handlePlayerFold = (playerId: string) => {
    if (!scoreBasedRound || !waitingForFolds) return

    setScoreBasedRound(prev => {
      if (!prev) return prev
      
      const newFoldedPlayers = [...prev.foldedPlayers, playerId]
      const newActivePlayers = prev.activePlayers.filter(id => id !== playerId)
      
      return {
        ...prev,
        foldedPlayers: newFoldedPlayers,
        activePlayers: newActivePlayers
      }
    })
  }

  const proceedToNextPhase = () => {
    if (!scoreBasedRound) return
    
    console.log('proceedToNextPhase - Current phase:', scoreBasedRound.phase, 'Active players:', scoreBasedRound.activePlayers.length)

    const deck = createDeck()
    let cardIndex = 0
    
    // Remove already dealt cards (hole cards + community cards)
    const dealtCards = [
      ...scoreBasedRound.playerHands.flatMap(hand => hand.holeCards),
      ...scoreBasedRound.communityCards
    ]
    const remainingDeck = deck.filter(card => 
      !dealtCards.some(dealt => dealt.suit === card.suit && dealt.rank === card.rank)
    )

    let newCommunityCards = [...scoreBasedRound.communityCards]
    let newPhase = scoreBasedRound.phase

    switch (scoreBasedRound.phase) {
      case 'preflop':
        // Deal flop (3 cards)
        newCommunityCards = [
          remainingDeck[0],
          remainingDeck[1], 
          remainingDeck[2]
        ]
        newPhase = 'flop'
        break
      case 'flop':
        // Deal turn (1 card)
        newCommunityCards.push(remainingDeck[3])
        newPhase = 'turn'
        break
      case 'turn':
        // Deal river (1 card) and immediately complete the round
        newCommunityCards.push(remainingDeck[4])
        newPhase = 'complete'
        break
      case 'river':
        // Complete the round
        newPhase = 'complete'
        break
    }

    // Evaluate hands for active players
    const evaluatedHands = scoreBasedRound.playerHands.map(hand => {
      if (scoreBasedRound.foldedPlayers.includes(hand.playerId)) {
        return hand
      }
      
      const evaluation = evaluateHand(hand.holeCards, newCommunityCards)
      return {
        ...hand,
        bestHand: evaluation.bestHand,
        handRank: evaluation.handRank,
        handName: evaluation.handName
      }
    })

    // Determine winner and losers
    const activeHands = evaluatedHands.filter(hand => 
      !scoreBasedRound.foldedPlayers.includes(hand.playerId)
    )
    
    if (activeHands.length === 0) {
      // All players folded - no winner, but folded players don't lose clothes in score-based mode
      const losers: string[] = [] // No one loses clothes when everyone folds
      
      setScoreBasedRound(prev => ({
        ...prev!,
        phase: newPhase,
        communityCards: newCommunityCards,
        playerHands: evaluatedHands,
        winner: null,
        winners: [],
        losers,
        isComplete: true
      }))
      
      // No clothing removal when everyone folds (folded players are safe)
      setTimeout(() => {
        // Add a small delay to ensure state updates are processed before allowing next round
        setTimeout(() => {
          setWaitingForFolds(false)
        }, 100)
      }, 2000)
      
    } else if (activeHands.length === 1) {
      // Only one player left, they win
      const winner = activeHands[0].playerId
      const winners = [winner] // Single winner when only one player remains
      const losers: string[] = [] // Folded players don't lose clothes in score-based mode
      
      setScoreBasedRound(prev => ({
        ...prev!,
        phase: newPhase,
        communityCards: newCommunityCards,
        playerHands: evaluatedHands,
        winner,
        winners,
        losers,
        isComplete: true
      }))
      
      // No clothing removal (folded players are safe in score-based mode)
      setTimeout(() => {
        // Add a small delay to ensure state updates are processed before allowing next round
        setTimeout(() => {
          setWaitingForFolds(false)
        }, 100)
      }, 2000)
      
    } else if (newPhase === 'complete') {
      // Game complete, determine winners and losers (handle ties)
      console.log('proceedToNextPhase - Round complete, evaluating hands')
      const sortedHands = [...activeHands].sort((a, b) => b.handRank - a.handRank)
      const highestRank = sortedHands[0].handRank
      
      // Find all players with the highest hand rank (winners)
      const winners = sortedHands.filter(hand => hand.handRank === highestRank).map(hand => hand.playerId)
      
      // For score-based mode: only playing players (non-folded) with lowest hand lose clothes
      // Folded players do NOT lose clothes in score-based mode
      const losers = sortedHands.filter(hand => hand.handRank < highestRank).map(h => h.playerId)
      
      // For score-based mode: only non-winners lose clothes (winners keep clothes)
      const winner = winners[0] // Keep first winner for display purposes
      
      setScoreBasedRound(prev => ({
        ...prev!,
        phase: newPhase,
        communityCards: newCommunityCards,
        playerHands: evaluatedHands,
        winner,
        winners,
        losers,
        isComplete: true
      }))
      
      // Remove clothing from losers (winners keep clothes in score-based mode)
      setTimeout(() => {
        removeClothingFromLosers(losers)
        // Add a small delay to ensure state updates are processed before allowing next round
        setTimeout(() => {
          setWaitingForFolds(false)
        }, 100)
      }, 2000)
      
    } else {
      // Continue to next phase
      setScoreBasedRound(prev => ({
        ...prev!,
        phase: newPhase,
        communityCards: newCommunityCards,
        playerHands: evaluatedHands
      }))
      setWaitingForFolds(true)
    }
  }

  // Setup phase render
  const renderSetup = () => (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <div className="text-6xl mb-6">🃏</div>
        <h1 className="text-3xl font-bold text-purple-800 mb-4">Strip Poker Setup</h1>
        
        {/* Game Mode Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Game Mode:</h2>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setGameMode('simplified')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                gameMode === 'simplified'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="text-lg mb-1">🎯</div>
              <div className="font-bold">Simplified</div>
              <div className="text-xs opacity-90">Winner loses clothing</div>
            </button>
            
            <button
              onClick={() => setGameMode('score-based')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                gameMode === 'score-based'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="text-lg mb-1">🏆</div>
              <div className="font-bold">Score Based</div>
              <div className="text-xs opacity-90">Strategic Texas Hold'em</div>
            </button>
          </div>
        </div>
        
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
          {gameMode === 'simplified' ? (
            <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto">
              <li>• Players are dealt cards each round</li>
              <li>• Winner must remove one clothing item</li>
              <li>• Game continues until only 1 player remains</li>
              <li>• Have fun and play responsibly! 😉</li>
            </ul>
                     ) : (
             <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto">
               <li>• Players see hole card strength percentage</li>
               <li>• Choose to fold or continue after each street</li>
               <li>• Losers must remove clothing items</li>
               <li>• Strategic betting with Texas Hold'em rules</li>
             </ul>
           )}
        </div>

        <button
          onClick={initializeGame}
          className="inline-flex items-center px-8 py-4 text-xl font-semibold rounded-lg transition-colors shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
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
          <h1 className="text-3xl font-bold text-purple-800 mb-2">
            🃏 {gameMode === 'score-based' ? 'Score-Based' : 'Simplified'} Strip Poker Table
          </h1>
          <p className="text-gray-600">
            {gameMode === 'score-based' 
              ? 'Strategic betting with Texas Hold\'em rules!' 
              : 'Welcome to the table! Let the games begin...'
            }
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
             const playerHand = gameMode === 'simplified' 
               ? currentRound?.playerHands.find(h => h.playerId === player.playerId)
               : scoreBasedRound?.playerHands.find(h => h.playerId === player.playerId)
             const isWinner = gameMode === 'simplified'
               ? currentRound?.winners?.includes(player.playerId)
               : scoreBasedRound?.winners?.includes(player.playerId)
             const isLoser = gameMode === 'simplified'
               ? currentRound?.losers.includes(player.playerId)
               : scoreBasedRound?.losers.includes(player.playerId)
             const isEliminated = isPlayerEliminated(player.playerId)
             const isLastItem = isLastClothingItem(player.playerId)
             const isWinnerInDanger = isWinner && isLastItem
             const isFolded = gameMode === 'score-based' && scoreBasedRound?.foldedPlayers.includes(player.playerId)
            
            return (
              <div
                key={player.playerId}
                className="absolute"
                style={position}
              >
                                 {/* Player Card - Bigger Version */}
                 <div className={`bg-white rounded-lg shadow-lg border-3 p-3 min-w-[100px] max-w-[120px] ${
                   isEliminated ? 'border-gray-400 bg-gray-100 opacity-75' :
                   isFolded ? 'border-gray-500 bg-gray-200 opacity-60' :
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
                       isFolded ? 'text-gray-600' :
                       isWinnerInDanger ? 'text-orange-800' :
                       isWinner ? 'text-green-800' : 
                       isLoser ? 'text-blue-800' : 
                       'text-gray-800'
                     }`}>
                       {isEliminated && '💀 '}
                       {isFolded && '🃏 '}
                       {isWinnerInDanger && '⚠️🏆 '}
                       {isWinner && !isWinnerInDanger && '🎉 '}
                       {player.playerName}
                       {isEliminated && ' 💀'}
                       {isFolded && ' 🃏'}
                       {isWinnerInDanger && ' ⚠️🏆'}
                       {isWinner && !isWinnerInDanger && ' 🏆🎉'}
                     </div>
                   </div>

                   {/* Hand Strength (Score-based mode) */}
                   {gameMode === 'score-based' && playerHand && (
                     <div className="text-center mb-1">
                       <div className="text-xs font-bold text-purple-600">
                         {/* Only show percentage during active play, not when results are shown */}
                         {scoreBasedRound && !scoreBasedRound.isComplete 
                           ? `${calculateHandStrength(playerHand.holeCards, scoreBasedRound?.communityCards || []).toFixed(0)}%`
                           : ''}
                       </div>
                     </div>
                   )}

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
                  {(showRemoveClothingMessage === player.playerId || 
                    (gameMode === 'score-based' && scoreBasedRound?.isComplete && 
                     scoreBasedRound.losers.includes(player.playerId))) && (
                    <div className="text-center mb-1 animate-pulse">
                      <div className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-300">
                        Remove 1 clothing item!
                      </div>
                    </div>
                  )}

                  {/* Player Hole Cards */}
                  <div className="flex justify-center space-x-1 mb-1">
                    {(() => {
                      // In score-based mode, only show hole cards when round is complete
                      if (gameMode === 'score-based' && scoreBasedRound && !scoreBasedRound.isComplete) {
                        // Show face-down cards during the round
                        return [1, 2].map((cardIndex) => (
                          <div
                            key={cardIndex}
                            className="w-5 h-7 bg-blue-600 rounded border-2 border-blue-800 flex items-center justify-center"
                          >
                            <div className="text-white text-xs">🂠</div>
                          </div>
                        ))
                      }
                      
                      // Show actual cards for simplified mode or when round is complete
                      if (playerHand?.holeCards) {
                        return playerHand.holeCards.map((card, cardIndex) => (
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
                        ))
                      }
                      
                      // Fallback to face-down cards
                      return [1, 2].map((cardIndex) => (
                        <div
                          key={cardIndex}
                          className="w-5 h-7 bg-blue-600 rounded border-2 border-blue-800 flex items-center justify-center"
                        >
                          <div className="text-white text-xs">🂠</div>
                        </div>
                      ))
                    })()}
                  </div>

                                     {/* Hand Name */}
                   {playerHand && (
                     <div className="text-center">
                       <div className="text-xs text-gray-600 truncate">
                         {/* In score-based mode, only show hand name when round is complete */}
                         {gameMode === 'score-based' && scoreBasedRound && !scoreBasedRound.isComplete 
                           ? '???' 
                           : playerHand.handName}
                       </div>
                     </div>
                   )}

                   {/* Fold Button (Score-based mode) */}
                   {gameMode === 'score-based' && scoreBasedRound && !scoreBasedRound.isComplete && 
                    waitingForFolds && !isFolded && !isEliminated && scoreBasedRound.phase !== 'river' && (
                     <div className="text-center mt-1">
                       <button
                         onClick={() => handlePlayerFold(player.playerId)}
                         className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                       >
                         Fold
                       </button>
                     </div>
                   )}
                </div>
              </div>
            )
          })}

          {/* Community Cards Area (center of table) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
            {/* Game Mode Specific Controls */}
            {gameMode === 'simplified' ? (
              /* Simplified Mode Controls */
              <div className="text-center mb-4">
                <button
                  onClick={dealNewRound}
                  disabled={isDealing || getActivePlayers().length <= 1}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isDealing || getActivePlayers().length <= 1
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                  }`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  {isDealing ? 'Dealing...' : 
                   getActivePlayers().length <= 1 ? `Game Over (${getActivePlayers().length} players)` : 
                   `Deal Cards (${getActivePlayers().length} players)`}
                </button>
              </div>
            ) : (
              /* Score-Based Mode Controls */
              <div className="text-center mb-4">
                {scoreBasedRound && !scoreBasedRound.isComplete && (
                  <div className="space-y-2">
                    <div className="text-sm text-amber-200 font-semibold">
                      Phase: {scoreBasedRound.phase.toUpperCase()}
                    </div>
                    {waitingForFolds && (
                      <div className="text-xs text-amber-100">
                        Waiting for players to fold...
                      </div>
                    )}
                    <button
                      onClick={proceedToNextPhase}
                      disabled={scoreBasedRound.isComplete}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                        scoreBasedRound.isComplete
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg'
                      }`}
                    >
                      <span>{scoreBasedRound.phase === 'turn' ? 'Deal River & Show Results' : 'Next Phase'}</span>
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                )}
                {(!scoreBasedRound || scoreBasedRound.isComplete) && (
                  <button
                    onClick={startScoreBasedRound}
                    disabled={getActivePlayers().length <= 1}
                    className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                      getActivePlayers().length <= 1
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                    }`}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {getActivePlayers().length <= 1 ? `Game Over (${getActivePlayers().length} players)` : `Start New Round (${getActivePlayers().length} players)`}
                  </button>
                )}
              </div>
            )}
            
            <div className="flex space-x-2">
              {(gameMode === 'simplified' ? currentRound?.communityCards : scoreBasedRound?.communityCards)?.map((card, cardIndex) => (
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
         {(gameMode === 'simplified' ? currentRound : scoreBasedRound) && (() => {
           const activePlayers = getActivePlayers()
           const currentRoundData = gameMode === 'simplified' ? currentRound : scoreBasedRound
           const winnerEliminated = currentRoundData && currentRoundData.winner ? isPlayerEliminated(currentRoundData.winner) : false
           const playersLosingLast = winnerEliminated && currentRoundData && currentRoundData.winner ? [currentRoundData.winner] : []
          
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
         {(gameMode === 'simplified' ? currentRound : scoreBasedRound) && (
           <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
             <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
               {gameMode === 'score-based' ? 'Round Results' : 'Round Results'}
             </h3>
             
             {/* Tie Notification */}
             {(gameMode === 'simplified' ? currentRound?.winners?.length : scoreBasedRound?.winners?.length) > 1 && (
               <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                 <div className="text-center text-yellow-800 font-semibold">
                   🤝 TIE! Multiple players have the same winning hand!
                   {gameMode === 'simplified' 
                     ? ' All tied players lose clothing items.' 
                     : ' Tied players keep their clothing items.'}
                 </div>
               </div>
             )}
             <div className="text-center mb-4">
               {(gameMode === 'simplified' ? currentRound?.playerHands : scoreBasedRound?.playerHands)?.map(hand => {
                 const currentRoundData = gameMode === 'simplified' ? currentRound : scoreBasedRound
                 const isWinner = currentRoundData?.winners?.includes(hand.playerId)
                 const isFolded = gameMode === 'score-based' && scoreBasedRound?.foldedPlayers?.includes(hand.playerId)
                 
                 return (
                   <div 
                     key={hand.playerId}
                     className={`inline-block mx-2 px-4 py-2 rounded-lg ${
                       isWinner 
                         ? 'bg-green-100 text-green-800 border-2 border-green-500'
                         : isFolded
                         ? 'bg-gray-100 text-gray-600 border-2 border-gray-400'
                         : 'bg-red-100 text-red-800 border-2 border-red-500'
                     }`}
                   >
                     <div className="font-semibold">
                       {hand.playerName} 
                       {isWinner && ' 🏆'}
                       {isFolded && ' 🃏'}
                     </div>
                     <div className="text-sm">
                       {/* In score-based mode, only show hand name when round is complete */}
                       {gameMode === 'score-based' && scoreBasedRound && !scoreBasedRound.isComplete 
                         ? '???' 
                         : hand.handName}
                     </div>
                     {gameMode === 'score-based' && scoreBasedRound && (
                       <div className="text-xs text-gray-500">
                         {calculateHandStrength(hand.holeCards, scoreBasedRound.communityCards || []).toFixed(0)}%
                       </div>
                     )}
                   </div>
                 )
               })}
             </div>
             <div className="text-center text-sm text-gray-600">
               {gameMode === 'simplified' ? (
                 currentRound?.winner && (
                   <p>
                     <span className="font-semibold text-orange-700">
                       {currentRound.playerHands.find(h => h.playerId === currentRound.winner)?.playerName}
                     </span> won but must remove one clothing item! 
                     Others stay safe.
                   </p>
                 )
               ) : (
                 scoreBasedRound?.winner && (
                   <p>
                     <span className="font-semibold text-green-700">
                       {scoreBasedRound.playerHands.find(h => h.playerId === scoreBasedRound.winner)?.playerName}
                     </span> wins! Losers must remove clothing items.
                   </p>
                 )
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