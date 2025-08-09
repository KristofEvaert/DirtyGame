import { Menu } from 'lucide-react'

interface NavbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Navbar = ({ sidebarOpen, setSidebarOpen }: NavbarProps) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 relative">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 absolute left-0 z-10"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-pulse relative">
              🔥 No BS Adult Games 🔥
              <span className="absolute -top-1 -right-1 text-xs animate-bounce">✨</span>
            </h1>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
