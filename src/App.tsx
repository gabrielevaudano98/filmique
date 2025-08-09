import React from 'react';
import { Camera, Film, User, Trophy, Users } from 'lucide-react';
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
    const justNamedRoll = rollToName;
    setRollToName(null);
    if (justNamedRoll && !justNamedRoll.title) {
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
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-gray-800 border-t border-gray-700 px-2 py-1 safe-area-bottom z-50">
        <div className="flex items-center justify-around max-w-md mx-auto py-1">
          <button onClick={() => setCurrentView('challenges')} className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${currentView === 'challenges' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`} aria-label="Challenges">
            <Trophy className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrentView('rolls')} className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${currentView === 'rolls' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`} aria-label="Rolls">
            <Film className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrentView('camera')} className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ease-in-out translate-y-[-12px] ring-2 ring-amber-300 ring-offset-2 ring-offset-gray-800 bg-amber-500 text-white hover:bg-amber-400 border-4 border-amber-200" aria-label="Camera">
            <Camera className="w-7 h-7" />
          </button>
          <button onClick={() => setCurrentView('community')} className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${currentView === 'community' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`} aria-label="Community">
            <Users className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center justify-center p-2 transition-colors min-h-[44px] min-w-[60px] ${currentView === 'profile' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`} aria-label="Profile">
            <User className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;