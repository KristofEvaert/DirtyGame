import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Game from './pages/Game'
import Home from './pages/Home'


function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-purple-800">Dare no truth game</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="mt-6 px-3">
              <div className="space-y-1">
                <a href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 hover:text-purple-900">
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" />
                  </svg>
                  All Games
                </a>
                <a href="/game" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-purple-100 hover:text-purple-900">
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Dare no truth game
                </a>

              </div>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 lg:ml-0">
            <main className="p-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<Game />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
