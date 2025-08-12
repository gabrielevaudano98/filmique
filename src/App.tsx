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
import RollDetailView from './components/RollDetailView';
import AlbumDetailView from './components/AlbumDetailView';
import NameRollModal from './components/NameRollModal';
import NotificationsView from './components/NotificationsView';
import TopBar from './components/TopBar';
import GlassCard from './components/GlassCard';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!session) {
    const AuthComponent = authStep === 'otp' ? <OtpView /> : <LoginView />;
    return (
      <div className="min-h-screen bg-brand-bg text-white flex flex-col">
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

  return (
    <div className="bg-transparent text-white min-h-screen">
      <TopBar />
      {rollToName && <NameRollModal roll={rollToName} onClose={handleNamingModalClose} />}
      <main className="min-h-screen w-full pb-28">
        <div className="max-w-6xl mx-auto w-full h-full px-4 py-4">
          {renderCurrentView()}
        </div>
      </main>

      {/* Floating bottom nav */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(800px,94%)]">
        <div className="flex items-center justify-between px-4 py-3 bg-[linear-gradient(180deg,rgba(12,7,5,0.6),rgba(12,7,5,0.36))] border border-white/6 rounded-3xl shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView('challenges')} className={`flex flex-col items-center justify-center text-sm ${currentView === 'challenges' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'}`} aria-label="Challenges">
              <Trophy className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentView('rolls')} className={`flex flex-col items-center justify-center text-sm ${currentView === 'rolls' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'}`} aria-label="Rolls">
              <Film className="w-6 h-6" />
            </button>
          </div>

          {/* Center camera button — elevated with ring */}
          <div className="relative -translate-y-5">
            <button onClick={() => setCurrentView('camera')} className="relative w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95">
              <span className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 180deg at 50% 50%, rgba(246,174,85,0.95), rgba(233,138,67,0.95), rgba(212,106,46,0.95))', filter: 'blur(10px)', transform: 'scale(1.12)' }} />
              <span className="absolute w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                <CameraIcon className="w-6 h-6 text-gray-900" />
              </span>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentView('community')} className={`flex flex-col items-center justify-center text-sm ${currentView === 'community' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'}`} aria-label="Community">
              <Users className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center justify-center text-sm ${currentView === 'profile' ? 'text-amber-400' : 'text-gray-400 hover:text-amber-300'}`} aria-label="Profile">
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;