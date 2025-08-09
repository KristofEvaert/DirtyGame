import { Menu, Heart } from 'lucide-react'

interface NavbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Navbar = ({ sidebarOpen, setSidebarOpen }: NavbarProps) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">No BS Adult Games</h1>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
