import React from 'react'
import { Lock, Heart } from 'lucide-react'

const PositionGame = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💫</div>
        <h1 className="text-3xl font-bold text-purple-800 mb-4">Position Game</h1>
        <p className="text-lg text-gray-600">
          Discover new intimate positions with guided instructions and difficulty levels
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Coming Soon!</h2>
        <p className="text-gray-600 mb-6">
          We're developing an exciting Position Game that will include:
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🎯 Game Features</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Progressive difficulty levels</li>
              <li>• Detailed position guides</li>
              <li>• Random position generator</li>
              <li>• Comfort level settings</li>
            </ul>
          </div>
          
          <div className="bg-pink-50 p-4 rounded-lg">
            <h3 className="font-semibold text-pink-800 mb-2">📚 Content Library</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Beginner-friendly positions</li>
              <li>• Advanced techniques</li>
              <li>• Safety tips & guidelines</li>
              <li>• Custom position creation</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-purple-600">
          <Heart className="h-5 w-5" />
          <span className="text-sm">Coming soon for adventurous couples!</span>
          <Heart className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default PositionGame
