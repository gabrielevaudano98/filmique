import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
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
import PostDevelopmentWizard from './components/PostDevelopmentWizard';
import RollsSettingsView from './components/RollsSettingsView';
import LibraryView from './components/LibraryView';
import SpeedUpModal from './components/SpeedUpModal';
import { Roll } from './types';
import SubscriptionView from './components/SubscriptionView';

const SPEED_UP_COST = 25;

function App() {
  const { 
    session, profile, isLoading, currentView, setCurrentView, authStep, 
    rollToConfirm, setRollToConfirm, 
    rollToSpeedUp, setRollToSpeedUp,
    sendToStudio, putOnShelf,
    developedRollForWizard, setDevelopedRollForWizard,
    isRollsSettingsOpen, setIsRollsSettingsOpen,
    setSelectedRoll, setSelectedAlbum,
    speedUpDevelopment
  } = useAppContext();

  useEffect(() => {
    const initializeNativeApp = async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setStyle({ style: Style.Dark });
        await SplashScreen.hide();
      }
    };
    initializeNativeApp();
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleBackButton = () => {
      if (isRollsSettingsOpen) { setIsRollsSettingsOpen(false); return; }
      if (developedRollForWizard) { setDevelopedRollForWizard(null); return; }
      if (rollToConfirm) { setRollToConfirm(null); return; }

      switch (currentView) {
        case 'rollDetail': setSelectedRoll(null); setCurrentView('rolls'); break;
        case 'albumDetail': setSelectedAlbum(null); setCurrentView('profile'); break;
        case 'settings': setCurrentView('profile'); break;
        case 'subscription': setCurrentView('settings'); break;
        case 'notifications': setCurrentView('community'); break;
        case 'uncategorizedRolls': setCurrentView('rolls'); break;
        case 'camera': setCurrentView('rolls'); break;
        default: console.log("Back button pressed on main view. Preventing exit."); break;
      }
    };

    const listenerPromise = CapacitorApp.addListener('backButton', handleBackButton);
    return () => { listenerPromise.then(l => l.remove()); };
  }, [
    isRollsSettingsOpen, developedRollForWizard, rollToConfirm, currentView,
    setIsRollsSettingsOpen, setDevelopedRollForWizard, setRollToConfirm,
    setCurrentView, setSelectedRoll, setSelectedAlbum
  ]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'rolls': return <RollsView />;
      case 'library': return <LibraryView />;
      case 'community': return <CommunityView />;
      case 'challenges': return <ChallengesView />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      case 'subscription': return <SubscriptionView />;
      case 'rollDetail': return <RollDetailView />;
      case 'albumDetail': return <AlbumDetailView />;
      case 'notifications': return <NotificationsView />;
      case 'uncategorizedRolls': return <UncategorizedRollsView />;
      default: return <CommunityView />;
    }
  };

  const handleWizardSendToStudio = (roll: Roll, title: string) => {
    sendToStudio(roll, title);
    setRollToConfirm(null);
  };

  const handleWizardPutOnShelf = (roll: Roll, title: string) => {
    putOnShelf(roll, title);
    setRollToConfirm(null);
  };

  const handleConfirmSpeedUp = () => {
    if (rollToSpeedUp) {
      speedUpDevelopment(rollToSpeedUp);
      setRollToSpeedUp(null);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center"><p className="text-white">Loading...</p></div>;
  }

  if (!session) {
    const AuthComponent = authStep === 'otp' ? <OtpView /> : <LoginView />;
    return <div className="min-h-screen bg-transparent text-white flex flex-col"><main className="flex-1 max-w-6xl mx-auto w-full flex">{AuthComponent}</main></div>;
  }

  if (profile && !profile.has_completed_onboarding) {
    return <OnboardingView />;
  }
  
  const completionWizard = rollToConfirm && <RollCompletionWizard roll={rollToConfirm} onSendToStudio={handleWizardSendToStudio} onPutOnShelf={handleWizardPutOnShelf} />;
  const postDevelopmentWizard = developedRollForWizard && <PostDevelopmentWizard roll={developedRollForWizard} onClose={() => setDevelopedRollForWizard(null)} />;
  const speedUpModal = rollToSpeedUp && <SpeedUpModal isOpen={!!rollToSpeedUp} onClose={() => setRollToSpeedUp(null)} onConfirm={handleConfirmSpeedUp} cost={SPEED_UP_COST} />;

  if (currentView === 'camera') {
    return <>{completionWizard}{postDevelopmentWizard}{speedUpModal}<CameraView /></>;
  }

  return (
    <div className="bg-transparent text-white">
      <TopBar />
      {completionWizard}
      {postDevelopmentWizard}
      {speedUpModal}
      {isRollsSettingsOpen && <RollsSettingsView />}
      <main className="min-h-screen w-full pb-28">
        <div className="max-w-6xl mx-auto w-full h-full px-4 py-4 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
          {renderCurrentView()}
        </div>
      </main>
      <BottomNavBar />
    </div>
  );