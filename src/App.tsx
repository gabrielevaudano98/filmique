import React from 'react';
import { Camera, Users } from 'lucide-react';
import CameraView from './components/CameraView';
import RollsView from './components/RollsView';
import CommunityView from './components/CommunityView';
import ChallengesView from './components/ChallengesView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import LoginView from './components/LoginView';
import OtpView from './components/OtpView';
import OnboardingView from './components/OnboardingView';
import { useAppContext } from './context/AppContext';
import TopBar from './components/TopBar';
import RollDetailView from './components/RollDetailView';
import AlbumDetailView from './components/AlbumDetailView';
import NameRollModal from './components/NameRollModal';
import NotificationsView from './components/NotificationsView';

function App() {
  const { session, profile, isLoading, currentView, setCurrentView, authStep, rollToName, setRollToName } = useAppContext();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'rolls': return <RollsView />;
      case 'community': return <CommunityView />;
      case 'challenges': return <ChallengesView />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      case 'rollDetail': return <RollDetailView />;
      case 'albumDetail': return <AlbumDetailView />;
      case 'notifications': return <NotificationsView />;
      default: return <CommunityView />;
    }
  };

  const handleNamingModalClose = () => {
    setRollToName(null);
  };

  const handleCameraClick = () => {
    if (currentView === 'rolls' || currentView === 'rollDetail' || currentView === 'albumDetail') {
      setCurrentView('camera');
    } else {
      setCurrentView('rolls');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!session) {
    const AuthComponent = authStep === 'otp' ? <OtpView /> : <LoginView />;
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <main className="flex-1 max-w-6xl mx-auto w-full flex">
          {AuthComponent}
        </main>
      </div>
    );
  }

  if (profile && !profile.has_completed_onboarding) {
    return <OnboardingView />;
  }
  
  if (currentView === 'camera') {
    return (
      <>
        {rollToName && <NameRollModal roll={rollToName} onClose={handleNamingModalClose} />}
        <CameraView />
      </>
    );
  }

  const mainContentPadding = ['settings', 'profile'].includes(currentView) ? '' : 'px-4 py-4';

  return (
    <div className="bg-gray-900 text-white">
      {rollToName && <NameRollModal roll={rollToName} onClose={handleNamingModalClose} />}
      <TopBar />
      <main className={`min-h-screen w-full pt-20 pb-28`}>
        <div className={`max-w-6xl mx-auto w-full h-full ${mainContentPadding}`}>
          {renderCurrentView()}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 w-full flex justify-center items-center z-50" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 1rem)', pointerEvents: 'none' }}>
        <div className="flex items-center space-x-4 bg-gray-800/80 backdrop-blur-lg p-3 rounded-full shadow-2xl border border-gray-700/50" style={{ pointerEvents: 'auto' }}>
          <button
            onClick={handleCameraClick}
            className={`p-3 rounded-full transition-colors duration-300 ${
              ['rolls', 'rollDetail', 'albumDetail', 'camera'].includes(currentView)
                ? 'bg-amber-500 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            aria-label="Camera / Rolls"
          >
            <Camera className="w-7 h-7" />
          </button>
          <button
            onClick={() => setCurrentView('community')}
            className={`p-3 rounded-full transition-colors duration-300 ${
              ['community', 'profile', 'settings', 'notifications'].includes(currentView)
                ? 'bg-amber-500 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            aria-label="Community"
          >
            <Users className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;