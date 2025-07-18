import React from 'react';
import { Camera, Home, User, ImageIcon, Trophy, Settings, Film, ArrowLeft, Zap } from 'lucide-react';
import CameraView from './components/CameraView';
import HomeView from './components/HomeView';
import ProfileView from './components/ProfileView';
import AlbumsView from './components/AlbumsView';
import ChallengesView from './components/ChallengesView';
import SettingsView from './components/SettingsView';
import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const { currentView, setCurrentView, flashMode, setFlashMode, setShowFilmModal } = useAppContext();

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
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Navigation */}
      <nav className={`bg-gray-800 border-b border-gray-700 px-4 py-2 transition-colors duration-300 ${
        currentView === 'camera' ? 'bg-transparent border-transparent absolute top-0 left-0 right-0 z-20 pt-safe' : ''
      }`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left side: Filmique logo for all non-camera views */}
          {currentView !== 'camera' && (
            <div className="flex items-center justify-center flex-grow font-recoleta"> {/* Added justify-center and flex-grow */}
              <Film className="w-7 h-7 text-amber-400" />
              <h1 className="text-xl font-bold text-amber-400 whitespace-nowrap overflow-hidden text-ellipsis ml-2">Filmique</h1> {/* Added ml-2 */}
            </div>
          )}

          {/* Right side: Conditional buttons */}
          <div className={`flex items-center w-full ${currentView === 'camera' ? 'justify-between' : 'justify-end'}`}>
            {currentView === 'camera' ? (
              <>
                {/* Camera specific buttons */}
                <button
                  onClick={() => setFlashMode(prev => {
                    if (prev === 'off') return 'on';
                    if (prev === 'on') return 'auto';
                    return 'off';
                  })}
                  className="flex items-center justify-center w-11 h-11 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full transition-colors"
                  aria-label="Toggle Flash"
                >
                  <Zap className={`w-5 h-5 ${flashMode === 'on' ? 'text-amber-400' : 'text-white'}`} />
                </button>
                <button
                  onClick={() => setShowFilmModal(true)}
                  className="flex items-center justify-center w-11 h-11 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full transition-colors"
                  aria-label="Change Film"
                >
                  <Film className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center justify-center w-11 h-11 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full transition-colors"
                  aria-label="Exit Camera"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </>
            ) : currentView === 'settings' ? ( // Back button for settings page
              <button
                onClick={() => setCurrentView('home')} // Go back to home from settings
                className="flex items-center justify-center w-11 h-11 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : ( // Settings button for home, albums, challenges, profile
              <button
                onClick={() => setCurrentView('settings')}
                className="flex items-center justify-center w-11 h-11 hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 max-w-6xl mx-auto w-full flex ${currentView !== 'settings' ? 'px-4 py-4' : ''}`}>
        {renderCurrentView()}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 w-full bg-gray-800 border-t border-gray-700 px-2 py-1 safe-area-bottom z-50 transition-opacity duration-300 ${
        currentView === 'camera' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}>
        <div className="flex items-center justify-around max-w-md mx-auto py-1">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${
              currentView === 'home'
                ? 'text-amber-400'
                : 'text-gray-400 hover:text-amber-400'
            }`}
            aria-label="Home"
          >
            <Home className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentView('albums')}
            className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${
              currentView === 'albums'
                ? 'text-amber-400'
                : 'text-gray-400 hover:text-amber-400'
            }`}
            aria-label="Albums"
          >
            <ImageIcon className="w-6 h-6" />
          </button>

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

          <button
            onClick={() => setCurrentView('challenges')}
            className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${
              currentView === 'challenges'
                ? 'text-amber-400'
                : 'text-gray-400 hover:text-amber-400'
            }`}
            aria-label="Challenges"
          >
            <Trophy className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${
              currentView === 'profile'
                ? 'text-amber-400'
                : 'text-gray-400 hover:text-amber-400'
            }`}
            aria-label="Profile"
          >
            <User className="w-6 h-6" />
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
