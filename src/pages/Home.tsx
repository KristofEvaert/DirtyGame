import { useState } from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { name: 'Total Users', value: '2,847', change: '+12%', changeType: 'positive' },
    { name: 'Active Sessions', value: '1,234', change: '+8%', changeType: 'positive' },
    { name: 'Revenue', value: '$45,231', change: '+23%', changeType: 'positive' },
    { name: 'Conversion Rate', value: '3.24%', change: '-1%', changeType: 'negative' },
  ]

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'Completed level 5', time: '2 minutes ago', avatar: 'JD' },
    { id: 2, user: 'Jane Smith', action: 'Achieved new high score', time: '5 minutes ago', avatar: 'JS' },
    { id: 3, user: 'Mike Johnson', action: 'Joined the game', time: '10 minutes ago', avatar: 'MJ' },
    { id: 4, user: 'Sarah Wilson', action: 'Unlocked new feature', time: '15 minutes ago', avatar: 'SW' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Dirty Game</h1>
          <p className="text-xl mb-6 text-primary-100">
            Experience the ultimate gaming platform with cutting-edge features and immersive gameplay.
          </p>
          <div className="flex space-x-4">
            <Link to="/dashboard" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
              Get Started
            </Link>
            <button className="btn-secondary bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex items-center text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{stat.change}</span>
                <svg className={`ml-1 h-4 w-4 ${
                  stat.changeType === 'positive' ? 'rotate-0' : 'rotate-180'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'features', 'community'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-medium">{activity.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                          <p className="text-sm text-gray-500">{activity.action}</p>
                        </div>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Start New Game</p>
                          <p className="text-xs text-gray-500">Begin your adventure</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Join Tournament</p>
                          <p className="text-xs text-gray-500">Compete with others</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Customize Profile</p>
                          <p className="text-xs text-gray-500">Personalize your experience</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Real-time Multiplayer', description: 'Play with friends and compete in real-time battles', icon: '🎮' },
                  { title: 'Achievement System', description: 'Unlock achievements and track your progress', icon: '🏆' },
                  { title: 'Custom Characters', description: 'Create and customize your own characters', icon: '👤' },
                  { title: 'Leaderboards', description: 'Compete for the top spot on global leaderboards', icon: '📊' },
                  { title: 'Daily Challenges', description: 'Complete daily challenges for rewards', icon: '📅' },
                  { title: 'Social Features', description: 'Connect with other players and form teams', icon: '👥' },
                ].map((feature, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-3">{feature.icon}</div>
                    <h4 className="font-medium text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Join Our Community</h3>
                <p className="text-gray-600 mb-4">
                  Connect with thousands of players, share strategies, and participate in community events.
                </p>
                <div className="flex space-x-4">
                  <button className="btn-primary">Join Discord</button>
                  <button className="btn-secondary">Follow on Twitter</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h4 className="font-medium text-gray-900 mb-3">Community Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Members</span>
                      <span className="font-medium">15,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Online Now</span>
                      <span className="font-medium">2,341</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Today</span>
                      <span className="font-medium">8,923</span>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <h4 className="font-medium text-gray-900 mb-3">Upcoming Events</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">Weekly Tournament</p>
                      <p className="text-xs text-yellow-600">Starts in 2 days</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Community Meetup</p>
                      <p className="text-xs text-blue-600">Next Saturday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
