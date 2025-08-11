import React from 'react';
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
import AlbumsView from './components/AlbumsView';
import NameRollModal from './components/NameRollModal';
import NotificationsView from './components/NotificationsView';
import FloatingNav from './components/FloatingNav';

function App() {
  const { session, profile, isLoading, currentView, setCurrentView, authStep, rollToName, setRollToName } = useAppContext();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'rolls': return <RollsView />;
      case 'albums': return <AlbumsView />;
      case 'community': return <CommunityView />;
      case 'challenges': return <ChallengesView />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      case 'rollDetail': return <RollDetailView />;
      case 'albumDetail': return <AlbumDetailView />;
      case 'notifications': return <NotificationsView />;
      default: return <RollsView />;
    }
  };

  const handleNamingModalClose = () => {
    setRollToName(null);
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
      <FloatingNav onNavigate={setCurrentView} />
    </div>
  );
}

export default App;