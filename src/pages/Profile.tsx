import { useState } from 'react'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)

  const userStats = [
    { label: 'Games Won', value: '234', icon: '🏆' },
    { label: 'Total Score', value: '45,678', icon: '📊' },
    { label: 'Win Rate', value: '68.5%', icon: '📈' },
    { label: 'Play Time', value: '127h', icon: '⏱️' },
  ]

  const badges = [
    { name: 'First Victory', icon: '🥇', earned: true },
    { name: 'Speed Demon', icon: '⚡', earned: true },
    { name: 'Social Butterfly', icon: '🦋', earned: true },
    { name: 'Unstoppable', icon: '🔥', earned: false },
    { name: 'Legendary', icon: '👑', earned: false },
    { name: 'Team Player', icon: '🤝', earned: true },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              JD
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">John Doe</h1>
                <p className="text-gray-600">@johndoe • Level 28</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary"
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>
            
            <p className="text-gray-700 mb-4">
              Passionate gamer who loves competitive play and strategic thinking. Always looking for new challenges and ways to improve.
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>New York, USA</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined March 2023</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userStats.map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'badges', 'history', 'settings'].map((tab) => (
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Games</h3>
                  <div className="space-y-3">
                    {[
                      { opponent: 'ProGamer123', result: 'Won', score: '15-8', time: '2 hours ago' },
                      { opponent: 'GameMaster', result: 'Lost', score: '12-15', time: '4 hours ago' },
                      { opponent: 'SpeedRunner', result: 'Won', score: '18-12', time: '6 hours ago' },
                      { opponent: 'LuckyPlayer', result: 'Won', score: '20-15', time: '1 day ago' },
                    ].map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            game.result === 'Won' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">vs {game.opponent}</p>
                            <p className="text-xs text-gray-500">{game.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            game.result === 'Won' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {game.result}
                          </p>
                          <p className="text-xs text-gray-500">{game.score}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Favorite Games</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Strategy Battle', playtime: '45h', winRate: '72%' },
                      { name: 'Speed Challenge', playtime: '32h', winRate: '65%' },
                      { name: 'Team Combat', playtime: '28h', winRate: '58%' },
                    ].map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{game.name}</p>
                          <p className="text-xs text-gray-500">{game.playtime} played</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{game.winRate} win rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Achievement Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge, index) => (
                  <div key={index} className={`text-center p-4 rounded-lg border-2 ${
                    badge.earned 
                      ? 'border-primary-200 bg-primary-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale opacity-50'}`}>
                      {badge.icon}
                    </div>
                    <p className={`text-sm font-medium ${
                      badge.earned ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {badge.name}
                    </p>
                    <p className={`text-xs ${
                      badge.earned ? 'text-primary-600' : 'text-gray-400'
                    }`}>
                      {badge.earned ? 'Earned' : 'Locked'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Game History</h3>
              <div className="space-y-4">
                {[
                  { date: 'Today', games: 8, wins: 6, losses: 2 },
                  { date: 'Yesterday', games: 12, wins: 8, losses: 4 },
                  { date: '2 days ago', games: 15, wins: 10, losses: 5 },
                  { date: '3 days ago', games: 6, wins: 4, losses: 2 },
                  { date: '4 days ago', games: 10, wins: 7, losses: 3 },
                ].map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{day.date}</p>
                      <p className="text-xs text-gray-500">{day.games} games played</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600">{day.wins}</p>
                        <p className="text-xs text-gray-500">Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-red-600">{day.losses}</p>
                        <p className="text-xs text-gray-500">Losses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {Math.round((day.wins / day.games) * 100)}%
                        </p>
                        <p className="text-xs text-gray-500">Win Rate</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John Doe"
                      className="input-field"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue="@johndoe"
                      className="input-field"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      defaultValue="Passionate gamer who loves competitive play and strategic thinking. Always looking for new challenges and ways to improve."
                      rows={3}
                      className="input-field"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      defaultValue="New York, USA"
                      className="input-field"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Visibility</p>
                      <p className="text-xs text-gray-500">Who can see your profile</p>
                    </div>
                    <select className="input-field w-auto">
                      <option>Public</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Show Online Status</p>
                      <p className="text-xs text-gray-500">Display when you're online</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
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

export default Profile
