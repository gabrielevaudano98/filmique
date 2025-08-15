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
import NotificationsView from './components/NotificationsView';
import TopBar from './components/TopBar';
import BottomNavBar from './components/BottomNavBar';
import UncategorizedRollsView from './components/UncategorizedRollsView';
import RollCompletionWizard from './components/RollCompletionWizard';
import { Roll } from './types';

function App() {
  const { 
    session, profile, isLoading, currentView, authStep, 
    rollToConfirm, setRollToConfirm, 
    sendToDarkroom, putOnShelf
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

  const handleWizardSendToDarkroom = (roll: Roll, title: string) => {
    sendToDarkroom(roll, title);
    setRollToConfirm(null);
  };

  const handleWizardPutOnShelf = (roll: Roll, title: string) => {
    putOnShelf(roll, title);
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
  
  const wizard = rollToConfirm && (
    <RollCompletionWizard
      roll={rollToConfirm}
      onSendToDarkroom={handleWizardSendToDarkroom}
      onPutOnShelf={handleWizardPutOnShelf}
      onClose={() => setRollToConfirm(null)}
    />
  );

  if (currentView === 'camera') {
    return (
      <>
        {wizard}
        <CameraView />
      </>
    );
  }

  return (
    <div className="bg-transparent text-white">
      <TopBar />
      {wizard}
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