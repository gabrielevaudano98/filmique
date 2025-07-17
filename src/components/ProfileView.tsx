import React, { useState } from 'react';
import { Settings, Edit, Film, Users, Heart, Calendar, Trophy, Star, Package, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ProfileView: React.FC = () => {
  const { user, completedRolls } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Rolls', value: user.totalRolls, icon: Film },
    { label: 'Total Photos', value: user.totalPhotos, icon: Film },
    { label: 'Followers', value: user.followersCount, icon: Users },
    { label: 'Following', value: user.followingCount, icon: Heart }
  ];

  const achievements = [
    { name: 'First Roll', description: 'Complete your first film roll', earned: true },
    { name: 'Week Streak', description: 'Shoot for 7 days in a row', earned: user.streak >= 7 },
    { name: 'Film Explorer', description: 'Try 5 different film types', earned: user.level >= 3 },
    { name: 'Social Butterfly', description: 'Get 100 likes on a roll', earned: user.level >= 5 },
    { name: 'Print Master', description: 'Order 10 sets of prints', earned: false },
    { name: 'Pro Shooter', description: 'Reach level 10', earned: user.level >= 10 }
  ];

  const subscriptionFeatures = {
    free: ['4 rolls per month', 'Basic film types', 'Standard unlock wait'],
    plus: ['30 rolls per month', 'Premium film types', 'Faster unlock (5 days)', 'Priority support'],
    premium: ['Unlimited rolls', 'All film types', 'Instant unlock option', 'Premium prints', 'Early features']
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-amber-100">Level {user.level} Photographer</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{user.streak} day streak</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>{user.credits} credits</span>
                </div>
              </div>
            </div>
          </div>
          <button className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {/* XP Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>XP Progress</span>
            <span>{user.xp}/3000</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${(user.xp / 3000) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-800 rounded-lg p-4 text-center">
            <stat.icon className="w-6 h-6 mx-auto mb-2 text-amber-400" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subscription Status */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Subscription</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.subscription === 'premium' 
              ? 'bg-purple-500 text-white'
              : user.subscription === 'plus'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-600 text-gray-300'
          }`}>
            {user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
          </div>
        </div>
        
        <div className="space-y-2">
          {subscriptionFeatures[user.subscription].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {user.subscription !== 'premium' && (
          <button className="mt-4 w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 py-3 rounded-lg font-semibold transition-colors">
            Upgrade Subscription
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {['overview', 'achievements', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-amber-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Rolls */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Rolls</h3>
            <div className="space-y-3">
              {completedRolls.slice(0, 3).map((roll) => (
                <div key={roll.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Film className="w-5 h-5 text-amber-400" />
                  <div className="flex-1">
                    <div className="font-medium">{roll.filmType}</div>
                    <div className="text-sm text-gray-400">
                      {roll.photos.length} photos • {roll.createdDate.toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    roll.isUnlocked 
                      ? 'bg-green-500 bg-opacity-20 text-green-400' 
                      : 'bg-orange-500 bg-opacity-20 text-orange-400'
                  }`}>
                    {roll.isUnlocked ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.name} className={`bg-gray-800 rounded-lg p-4 ${
              achievement.earned ? 'border border-amber-400' : ''
            }`}>
              <div className="flex items-center space-x-3">
                <Trophy className={`w-6 h-6 ${
                  achievement.earned ? 'text-amber-400' : 'text-gray-500'
                }`} />
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    achievement.earned ? 'text-white' : 'text-gray-400'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{achievement.description}</p>
                </div>
                {achievement.earned && (
                  <div className="bg-amber-400 text-black px-2 py-1 rounded text-xs font-medium">
                    Earned
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Account Settings</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                Edit Profile
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                Privacy Settings
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                Notifications
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                Manage Subscription
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-4">App Preferences</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                Camera Settings
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                Print Preferences
              </button>
              <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
