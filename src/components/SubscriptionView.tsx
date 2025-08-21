import React from 'react';
import { ArrowLeft, CheckCircle, Star, Cloud, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import SettingsToggleRow from './SettingsToggleRow';
import { showInfoToast } from '../utils/toasts';

const Feature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center space-x-3">
    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
    <span className="text-gray-700 dark:text-gray-300">{children}</span>
  </li>
);

const SubscriptionView: React.FC = () => {
  const { profile, setCurrentView, updateProfileDetails, refreshProfile } = useAppContext();

  const handleComingSoon = () => {
    showInfoToast('Payment processing is coming soon!');
  };

  const handleAutoBackupToggle = async (enabled: boolean) => {
    await updateProfileDetails({ is_auto_backup_enabled: enabled });
    await refreshProfile();
  };

  const isPremium = profile?.subscription === 'plus' || profile?.subscription === 'premium';

  return (
    <div className="flex-1 flex flex-col bg-white text-black dark:bg-transparent dark:text-white transition-colors duration-300">
      <div className="flex items-center p-4 border-b border-white/30 dark:border-neutral-800 bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg">
        <button onClick={() => setCurrentView('settings')} className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-black dark:text-white mx-auto">Subscription</h1>
        <div className="w-6 h-6"></div>
      </div>

      <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar">
        {/* Current Plan */}
        <div className="rounded-xl p-6 mb-8 border bg-white/70 dark:bg-neutral-800/60 border-white/30 dark:border-neutral-700/50 backdrop-blur-lg shadow-none">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your Current Plan</h2>
          <p className="text-3xl font-bold text-brand-amber-start mt-1">
            {isPremium ? 'Filmique+' : 'Basic'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isPremium ? 'You have access to all premium features.' : 'The core Filmique experience, for free.'}
          </p>
        </div>

        {/* Premium Features Settings */}
        <div className="mb-8">
          <h3 className="px-4 pb-2 text-sm font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">Premium Settings</h3>
          <div className="rounded-xl overflow-hidden border bg-white/70 dark:bg-neutral-800/60 border-white/30 dark:border-neutral-700/50 backdrop-blur-lg shadow-none">
            <SettingsToggleRow
              icon={<Cloud className="w-5 h-5 text-black dark:text-white" />}
              color="bg-blue-500"
              title="Automatic Cloud Backup"
              subtitle="Automatically back up developed rolls to the cloud."
              checked={isPremium && (profile?.is_auto_backup_enabled ?? true)}
              onChange={handleAutoBackupToggle}
            />
             {!isPremium && (
              <div className="px-4 pb-3 text-xs text-gray-500 dark:text-gray-400 -mt-2">
                Upgrade to Filmique+ to enable this feature.
              </div>
            )}
          </div>
        </div>

        {/* Upgrade Plan */}
        {!isPremium && (
          <div className="rounded-xl p-6 border bg-gradient-to-br from-brand-amber-start/20 to-white/80 dark:to-neutral-800/20 border-brand-amber-start/30 backdrop-blur-lg shadow-none">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-brand-amber-start rounded-full">
                <Star className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white">Upgrade to Filmique+</h2>
            </div>
            <ul className="space-y-3 mb-6">
              <Feature>Automatic cloud backup for all your rolls</Feature>
              <Feature>Sync photos across multiple devices</Feature>
              <Feature>Access to exclusive film stocks</Feature>
              <Feature>High-resolution photo exports</Feature>
            </ul>
            <button 
              onClick={handleComingSoon}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-lg text-base font-bold text-white bg-gradient-to-r from-brand-amber-start to-brand-amber-end hover:opacity-90 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Upgrade Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionView;