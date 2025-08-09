import React from 'react'
import { Lock, Heart } from 'lucide-react'

const StripPoker = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🃏</div>
        <h1 className="text-3xl font-bold text-purple-800 mb-4">Strip Poker</h1>
        <p className="text-lg text-gray-600">
          Classic strip poker with customizable rules and clothing items
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Coming Soon!</h2>
        <p className="text-gray-600 mb-6">
          We're working hard to bring you an exciting Strip Poker experience with:
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🎮 Game Features</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Multiple poker variants</li>
              <li>• Customizable clothing items</li>
              <li>• Progressive difficulty levels</li>
              <li>• Multiple player support</li>
            </ul>
          </div>
          
          <div className="bg-pink-50 p-4 rounded-lg">
            <h3 className="font-semibold text-pink-800 mb-2">⚙️ Customization</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Custom clothing lists</li>
              <li>• Adjustable game rules</li>
              <li>• Timer settings</li>
              <li>• Player preferences</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-purple-600">
          <Heart className="h-5 w-5" />
          <span className="text-sm">Stay tuned for updates!</span>
          <Heart className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export default StripPoker
