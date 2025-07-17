import React, { useState, useEffect } from 'react';
import { Camera, Home, User, ImageIcon, Trophy, Settings, Film } from 'lucide-react';
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
            <Film className="w-7 h-7 text-amber-400" />
            <h1 className="text-xl font-bold text-amber-400 whitespace-nowrap overflow-hidden text-ellipsis font-recoleta">Filmique</h1>
          </div>
          <div className="flex items-center space-x-3">
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
      <nav className={`fixed bottom-0 left-0 right-0 w-full bg-gray-800 border-t border-gray-700 px-2 py-1 safe-area-bottom z-50 transition-opacity duration-300 ${
        currentView === 'camera' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}>
        <div className="flex items-center justify-around max-w-md mx-auto py-1">
          {/* Left side buttons */}
          <button
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center p-2 transition-colors min-h-[44px] min-w-[44px] ${
              currentView === 'home' 
                ? 'text-amber-400 bg-gray-700 rounded-full' 
                : 'text-gray-400 hover:text-amber-400 hover:bg-amber-100 rounded-full'
            }`}
            aria-label="Home"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => setCurrentView('albums')}
            className={`flex flex-col items-center p-2 transition-colors min-h-[44px] min-w-[44px] ${
              currentView === 'albums' 
                ? 'text-amber-400 bg-gray-700 rounded-full' 
                : 'text-gray-400 hover:text-amber-400 hover:bg-amber-100 rounded-full'
            }`}
            aria-label="Albums"
          >
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Centered Camera Button */}
          <button
            onClick={() => setCurrentView('camera')}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ease-in-out translate-y-[-12px] ring-2 ring-amber-300 ring-offset-2 ring-offset-gray-800
              ${currentView === 'camera' 
                ? 'bg-gray-700 text-gray-400 border-4 border-gray-600' 
                : 'bg-amber-500 text-white hover:bg-amber-400 border-4 border-amber-200'}
            `}
            aria-label="Camera"
          >
            <Camera className="w-7 h-7" />
          </button>

          {/* Right side buttons */}
          <button
            onClick={() => setCurrentView('challenges')}
            className={`flex flex-col items-center p-2 transition-colors min-h-[44px] min-w-[44px] ${
              currentView === 'challenges' 
                ? 'text-amber-400 bg-gray-700 rounded-full' 
                : 'text-gray-400 hover:text-amber-400 hover:bg-amber-100 rounded-full'
            }`}
            aria-label="Challenges"
          >
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center p-2 transition-colors min-h-[44px] min-w-[44px] ${
              currentView === 'profile' 
                ? 'text-amber-400 bg-gray-700 rounded-full' 
                : 'text-gray-400 hover:text-amber-400 hover:bg-amber-100 rounded-full'
            }`}
            aria-label="Profile"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
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
