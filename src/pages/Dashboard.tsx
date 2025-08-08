import { useState } from 'react'

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  const performanceData = [
    { day: 'Mon', score: 85, games: 12 },
    { day: 'Tue', score: 92, games: 15 },
    { day: 'Wed', score: 78, games: 8 },
    { day: 'Thu', score: 95, games: 20 },
    { day: 'Fri', score: 88, games: 14 },
    { day: 'Sat', score: 96, games: 18 },
    { day: 'Sun', score: 91, games: 16 },
  ]

  const achievements = [
    { name: 'First Victory', description: 'Win your first game', progress: 100, icon: '🏆' },
    { name: 'Speed Demon', description: 'Complete 10 games in under 5 minutes', progress: 70, icon: '⚡' },
    { name: 'Social Butterfly', description: 'Play with 50 different players', progress: 45, icon: '🦋' },
    { name: 'Unstoppable', description: 'Win 10 games in a row', progress: 20, icon: '🔥' },
  ]

  const leaderboard = [
    { rank: 1, name: 'ProGamer123', score: 2847, level: 45, avatar: 'PG' },
    { rank: 2, name: 'GameMaster', score: 2654, level: 42, avatar: 'GM' },
    { rank: 3, name: 'SpeedRunner', score: 2489, level: 38, avatar: 'SR' },
    { rank: 4, name: 'LuckyPlayer', score: 2312, level: 35, avatar: 'LP' },
    { rank: 5, name: 'Newbie2024', score: 2156, level: 32, avatar: 'N2' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your gaming performance and progress</p>
        </div>
        <div className="flex space-x-2">
          {['1d', '7d', '30d', '90d'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedPeriod === period
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">68.5%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Play Time</p>
              <p className="text-2xl font-bold text-gray-900">127h</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Games Played</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Level</p>
              <p className="text-2xl font-bold text-gray-900">28</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {performanceData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t" style={{ height: `${data.score}%` }}>
                <div className="bg-primary-600 h-full rounded-t transition-all duration-300"></div>
              </div>
              <div className="mt-2 text-xs text-gray-600">{data.day}</div>
              <div className="text-xs text-gray-500">{data.games} games</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Achievements</h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{achievement.name}</h4>
                    <span className="text-xs text-gray-500">{achievement.progress}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Global Leaderboard</h3>
          <div className="space-y-3">
            {leaderboard.map((player, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {player.rank}
                </div>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-xs font-medium">{player.avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{player.name}</p>
                  <p className="text-xs text-gray-500">Level {player.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{player.score.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Won against ProGamer123', time: '2 minutes ago', type: 'victory' },
            { action: 'Achieved new high score: 2,847', time: '15 minutes ago', type: 'achievement' },
            { action: 'Completed daily challenge', time: '1 hour ago', type: 'challenge' },
            { action: 'Joined weekly tournament', time: '3 hours ago', type: 'tournament' },
            { action: 'Unlocked new character skin', time: '5 hours ago', type: 'unlock' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'victory' ? 'bg-green-500' :
                activity.type === 'achievement' ? 'bg-yellow-500' :
                activity.type === 'challenge' ? 'bg-blue-500' :
                activity.type === 'tournament' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
