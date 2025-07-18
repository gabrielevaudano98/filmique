import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Camera, Film, Settings, Share2, Edit, PlusCircle, ChevronRight, Star, Zap, Award, Image as ImageIcon } from 'lucide-react';

const ProfileView: React.FC = () => {
  const { user, completedRolls, feed, setCurrentView } = useAppContext();
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' or 'rolls'

  // Dummy data for badges and achievements
  const badges = [
    { id: 'b1', name: 'First Roll', description: 'Completed your first film roll', icon: <Film className="w-6 h-6 text-amber-400" /> },
    { id: 'b2', name: 'Daily Streak', description: 'Maintained a 7-day photo streak', icon: <Star className="w-6 h-6 text-yellow-400" /> },
    { id: 'b3', name: 'Pro Mode Master', description: 'Took 50 photos in Pro Mode', icon: <Camera className="w-6 h-6 text-blue-400" /> },
    { id: 'b4', name: 'Social Butterfly', description: 'Shared 10 photos with friends', icon: <Share2 className="w-6 h-6 text-green-400" /> },
  ];

  const achievements = [
    { id: 'a1', name: '100 Photos Taken', progress: 100, target: 100, icon: <ImageIcon className="w-5 h-5 text-purple-400" /> },
    { id: 'a2', name: '5 Rolls Developed', progress: 3, target: 5, icon: <Film className="w-5 h-5 text-red-400" /> },
    { id: 'a3', name: '500 Credits Earned', progress: 350, target: 500, icon: <Zap className="w-5 h-5 text-yellow-400" /> },
  ];

  const userPhotos = feed.flatMap(post => post.photos);

  return (
    <div className="flex flex-col w-full">
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-4xl font-bold text-amber-400 border-2 border-amber-400">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold font-recoleta">{user?.username || 'Guest User'}</h2>
            <p className="text-gray-400 text-sm">{user?.email || 'No email'}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">Level {user?.level || 1}</span>
              <span className="text-yellow-400 text-sm flex items-center">
                <Zap className="w-4 h-4 mr-1" /> {user?.credits || 0} Credits
              </span>
              <span className="text-green-400 text-sm flex items-center">
                <Star className="w-4 h-4 mr-1" /> {user?.streak || 0}-Day Streak
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-around border-t border-gray-700 pt-4 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold">{userPhotos.length}</div>
            <div className="text-gray-400 text-sm">Photos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{completedRolls.length}</div>
            <div className="text-gray-400 text-sm">Rolls</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{badges.length}</div>
            <div className="text-gray-400 text-sm">Badges</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3 font-recoleta">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Edit className="w-5 h-5 mr-2 text-blue-400" /> Edit Profile
          </button>
          <button className="flex items-center justify-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <PlusCircle className="w-5 h-5 mr-2 text-green-400" /> Add Credits
          </button>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3 font-recoleta">My Badges</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {badges.map(badge => (
            <div key={badge.id} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center mb-2 border border-gray-600">
                {badge.icon}
              </div>
              <span className="text-xs font-medium text-gray-300">{badge.name}</span>
            </div>
          ))}
        </div>
        {badges.length === 0 && (
          <p className="text-gray-400 text-center py-4">No badges earned yet. Keep shooting!</p>
        )}
      </div>

      {/* Achievements Section */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3 font-recoleta">Achievements</h3>
        <div className="space-y-3">
          {achievements.map(achievement => (
            <div key={achievement.id} className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg">
              <div className="flex-shrink-0">{achievement.icon}</div>
              <div className="flex-grow">
                <h4 className="text-sm font-medium">{achievement.name}</h4>
                <div className="bg-gray-600 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-gray-400">{achievement.progress}/{achievement.target}</span>
            </div>
          ))}
        </div>
        {achievements.length === 0 && (
          <p className="text-gray-400 text-center py-4">No achievements in progress.</p>
        )}
      </div>

      {/* Tab Navigation for Photos/Rolls */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
        {['photos', 'rolls'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-amber-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'photos' ? 'My Photos' : 'My Rolls'}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-3 gap-2">
          {userPhotos.length > 0 ? (
            userPhotos.map(photo => (
              <div key={photo.id} className="w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                <img src={photo.thumbnail} alt="User Photo" className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-recoleta">No photos yet</h3>
              <p className="text-gray-400">Start shooting to fill your gallery!</p>
              <button 
                onClick={() => setCurrentView('camera')}
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                <Camera className="w-5 h-5 inline mr-2" /> Take a Photo
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rolls' && (
        <div className="space-y-4">
          {completedRolls.length > 0 ? (
            completedRolls.map(roll => (
              <div key={roll.id} className="bg-gray-800 rounded-xl p-4 flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                  {roll.photos.length > 0 ? (
                    <img src={roll.photos[0].thumbnail} alt="Roll Cover" className="w-full h-full object-cover" />
                  ) : (
                    <Film className="w-10 h-10 text-gray-400 mx-auto my-5" />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold font-recoleta">{roll.filmType} Roll</h3>
                  <p className="text-gray-400 text-sm">{roll.shotsUsed} / {roll.capacity} shots</p>
                  <p className="text-gray-500 text-xs">Completed on {new Date(roll.createdDate).toLocaleDateString()}</p>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 font-recoleta">No rolls developed yet</h3>
              <p className="text-gray-400">Complete a roll of film to see it here!</p>
              <button 
                onClick={() => setCurrentView('home')}
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                <Film className="w-5 h-5 inline mr-2" /> Start a New Roll
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileView;
