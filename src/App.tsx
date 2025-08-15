import React, { Suspense } from 'react';
import { useAppContext } from './context/AppContext';
import { Roll } from './types';
import BottomNavBar from './components/BottomNavBar';
import TopBar from './components/TopBar';

// Lazy load views
const CameraView = React.lazy(() => import('./components/CameraView'));
const RollsView = React.lazy(() => import('./components/RollsView'));
const CommunityView = React.lazy(() => import('./components/CommunityView'));
const ChallengesView = React.lazy(() => import('./components/ChallengesView'));
const ProfileView = React.lazy(() => import('./components/ProfileView'));
const SettingsView = React.lazy(() => import('./components/SettingsView'));
const LoginView = React.lazy(() => import('./components/LoginView'));
const OtpView = React.lazy(() => import('./components/OtpView'));
const OnboardingView = React.lazy(() => import('./components/OnboardingView'));
const RollDetailView = React.lazy(() => import('./components/RollDetailView'));
const AlbumDetailView = React.lazy(() => import('./components/AlbumDetailView'));
const NotificationsView = React.lazy(() => import('./components/NotificationsView'));
const UncategorizedRollsView = React.lazy(() => import('./components/UncategorizedRollsView'));
const RollCompletionWizard = React.lazy(() => import('./components/RollCompletionWizard'));

const LoadingFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <p className="text-white">Loading...</p>
  </div>
);

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
          <Suspense fallback={<LoadingFallback />}>
            {AuthComponent}
          </Suspense>
        </main>
      </div>
    );
  }

  if (profile && !profile.has_completed_onboarding) {
    return <Suspense fallback={<LoadingFallback />}><OnboardingView /></Suspense>;
  }
  
  const wizard = rollToConfirm && (
    <Suspense fallback={null}>
      <RollCompletionWizard
        roll={rollToConfirm}
        onSendToDarkroom={handleWizardSendToDarkroom}
        onPutOnShelf={handleWizardPutOnShelf}
      />
    </Suspense>
  );

  if (currentView === 'camera') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {wizard}
        <CameraView />
      </Suspense>
    );
  }

  return (
    <div className="bg-transparent text-white">
      <TopBar />
      {wizard}
      <main className="min-h-screen w-full pb-28">
        <div className="max-w-6xl mx-auto w-full h-full px-4 py-4">
          <Suspense fallback={<LoadingFallback />}>
            {renderCurrentView()}
          </Suspense>
        </div>
      </main>
      <BottomNavBar />
    </div>
  );
}

export default App;