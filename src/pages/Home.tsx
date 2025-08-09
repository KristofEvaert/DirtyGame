import React from 'react'
import { Heart, Play, Sparkles, Lock, Settings } from 'lucide-react'

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Heart className="h-12 w-12 text-purple-600 mr-4" />
          <h1 className="text-4xl font-bold text-purple-800">Spicy Games</h1>
        </div>
        <p className="text-xl text-gray-600 mb-2">Spice up your relationship with fun, intimate games</p>
        <p className="text-sm text-gray-500">Two exciting games available now!</p>
      </div>

      {/* Available Games */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Dare Game - Available */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-3">Dare Game</h2>
            <p className="text-gray-600 mb-4">
              Progressive dare challenge with three difficulty levels. Complete dares to advance through Easy, Medium, and Hard levels!
            </p>
            <div className="flex items-center justify-center mb-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Available Now
              </span>
            </div>
            <a
              href="/game"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Play className="mr-2 w-5 h-5" />
              Play Now
            </a>
          </div>
        </div>

        {/* Spicy Dice Game - Available */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="text-5xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-3">Spicy Dice Game</h2>
            <p className="text-gray-600 mb-4">
              Roll the dice for random romantic and spicy activities. Let chance decide your fun with progressive difficulty!
            </p>
            <div className="flex items-center justify-center mb-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Available Now
              </span>
            </div>
            <a
              href="/dice"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Play className="mr-2 w-5 h-5" />
              Roll Dice
            </a>
          </div>
        </div>

        {/* Strip Poker Game - Available */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="text-5xl mb-4">🃏</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-3">Strip Poker</h2>
            <p className="text-gray-600 mb-4">
              Classic strip poker with a spicy twist! Lose a hand, lose some clothes. Perfect for couples looking to heat things up!
            </p>
            <div className="flex items-center justify-center mb-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Available Now
              </span>
            </div>
            <a
              href="/strip-poker"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Play className="mr-2 w-5 h-5" />
              Play Now
            </a>
          </div>
        </div>

        {/* Position Game - Coming Soon */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 opacity-75">
          <div className="text-center">
            <div className="text-5xl mb-4">💫</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-3">Position Game</h2>
            <p className="text-gray-500 mb-4">
              Discover new intimate positions with guided instructions and difficulty levels for adventurous couples!
            </p>
            <div className="flex items-center justify-center mb-4">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                🚧 Coming Soon
              </span>
            </div>
            <button
              disabled
              className="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
            >
              <Lock className="mr-2 w-5 h-5" />
              Coming Soon
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <div className="text-center">
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-3">Settings</h2>
            <p className="text-gray-600 mb-4">
              Customize player names, game preferences, and personalize your experience!
            </p>
            <div className="flex items-center justify-center mb-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Available Now
              </span>
            </div>
            <a
              href="/settings"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Settings className="mr-2 w-5 h-5" />
              Configure
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 opacity-75">
          <div className="text-center">
            <div className="text-5xl mb-4">🎪</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-3">Custom Games</h2>
            <p className="text-gray-500 mb-4">
              Create your own personalized games with custom rules and content!
            </p>
            <div className="flex items-center justify-center mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                💡 Planned
              </span>
            </div>
            <button
              disabled
              className="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
            >
              <Lock className="mr-2 w-5 h-5" />
              In Development
            </button>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-8">
        <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-purple-800 mb-3">Ready to Heat Things Up?</h2>
        <p className="text-gray-600 mb-6">Choose your game and see where the night takes you!</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="/game"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg"
          >
            <Play className="mr-2 w-5 h-5" />
            Dare Game
          </a>
          <a
            href="/dice"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold rounded-lg hover:from-pink-700 hover:to-red-700 transition-colors shadow-lg"
          >
            <Play className="mr-2 w-5 h-5" />
            Dice Game
          </a>
          <a
            href="/strip-poker"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors shadow-lg"
          >
            <Play className="mr-2 w-5 h-5" />
            Strip Poker
          </a>
        </div>
      </div>
    </div>
  )
}

export default Home