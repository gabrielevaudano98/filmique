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
import RollDetailView from './components/RollDetailView';
import AlbumDetailView from './components/AlbumDetailView';
import NameRollModal from './components/NameRollModal';
import NotificationsView from './components/NotificationsView';
import TopBar from './components/TopBar';
import BottomNavBar from './components/BottomNavBar';
import UncategorizedRollsView from './components/UncategorizedRollsView';
import ConfirmDevelopmentModal from './components/ConfirmDevelopmentModal';

function App() {
  const { 
    session, profile, isLoading, currentView, authStep, 
    rollToName, setRollToName, 
    rollToConfirm, setRollToConfirm, 
    actionAfterNaming, setActionAfterNaming,
    developRoll, deleteRoll 
  } = useAppContext();

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
      case 'uncategorizedRolls': return <UncategorizedRollsView />;
      default: return <CommunityView />;
    }
  };

  const handleNamingModalClose = () => {
    if (actionAfterNaming === 'develop' && rollToName) {
      developRoll(rollToName);
    }
    setRollToName(null);
    setActionAfterNaming(null);
  };

  const handleConfirmDevelop = () => {
    if (rollToConfirm) {
      setActionAfterNaming('develop');
      setRollToName(rollToConfirm);
      setRollToConfirm(null);
    }
  };
  
  const handleDecideLater = () => {
    if (rollToConfirm) {
      setActionAfterNaming(null);
      setRollToName(rollToConfirm);
      setRollToConfirm(null);
    }
  };

  const handleConfirmTrash = () => {
    if (rollToConfirm) {
      deleteRoll(rollToConfirm.id);
    }
    setRollToConfirm(null);
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
        {rollToConfirm && (
          <ConfirmDevelopmentModal
            isOpen={!!rollToConfirm}
            onClose={handleDecideLater}
            onDevelop={handleConfirmDevelop}
            onTrash={handleConfirmTrash}
            roll={rollToConfirm}
          />
        )}
        <CameraView />
      </>
    );
  }

  return (
    <div className="bg-transparent text-white">
      <TopBar />
      {rollToName && <NameRollModal roll={rollToName} onClose={handleNamingModalClose} />}
      {rollToConfirm && (
        <ConfirmDevelopmentModal
          isOpen={!!rollToConfirm}
          onClose={handleDecideLater}
          onDevelop={handleConfirmDevelop}
          onTrash={handleConfirmTrash}
          roll={rollToConfirm}
        />
      )}
      <main className="min-h-screen w-full pb-28">
        <div className="max-w-6xl mx-auto w-full h-full px-4 py-4">
          {renderCurrentView()}
        </div>
      </main>
      <BottomNavBar />
    </div>
  );
}

export default App;