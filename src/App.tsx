import React, { useState, useEffect } from 'react';
import { Camera, Home, User, ImageIcon, Trophy, Settings, Heart, MessageCircle, Share, Film, Clock, Zap } from 'lucide-react';
import CameraView from './components/CameraView';
import HomeView from './components/HomeView';
import ProfileView from './components/ProfileView';
import AlbumsView from './components/AlbumsView';
import ChallengesView from './components/ChallengesView';
import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const { currentView, setCurrentView, user } = useAppContext();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'camera':
        return <CameraView />;
      case 'home':
        return <HomeView />;
      case 'profile':
        return <ProfileView />;
      case 'albums':
        return <AlbumsView />;
      case 'challenges':
        return <ChallengesView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <Film className="w-8 h-8 text-amber-400" />
            <h1 className="text-xl font-bold text-amber-400 whitespace-nowrap overflow-hidden text-ellipsis">Vintage Roll</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{user.credits}</span>
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">Lvl {user.level}</span>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors min-h-[44px] min-w-[44px]">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full">
        {renderCurrentView()}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 w-full bg-gray-800 border-t border-gray-700 px-2 py-3 safe-area-bottom z-50 transition-opacity duration-300 ${
        currentView === 'camera' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}>
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === 'home' ? 'text-amber-400 bg-gray-700' : 'text-gray-400 hover:text-white'
            } min-h-[48px] min-w-[48px]`}
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs mt-1 leading-tight">Home</span>
          </button>
          <button
            onClick={() => setCurrentView('camera')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === 'camera' ? 'text-amber-400 bg-gray-700' : 'text-gray-400 hover:text-white'
            } min-h-[48px] min-w-[48px]`}
          >
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs mt-1 leading-tight">Camera</span>
          </button>
          <button
            onClick={() => setCurrentView('albums')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === 'albums' ? 'text-amber-400 bg-gray-700' : 'text-gray-400 hover:text-white'
            } min-h-[48px] min-w-[48px]`}
          >
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs mt-1 leading-tight">Albums</span>
          </button>
          <button
            onClick={() => setCurrentView('challenges')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === 'challenges' ? 'text-amber-400 bg-gray-700' : 'text-gray-400 hover:text-white'
            } min-h-[48px] min-w-[48px]`}
          >
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs mt-1 leading-tight">Challenges</span>
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              currentView === 'profile' ? 'text-amber-400 bg-gray-700' : 'text-gray-400 hover:text-white'
            } min-h-[48px] min-w-[48px]`}
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs mt-1 leading-tight">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
