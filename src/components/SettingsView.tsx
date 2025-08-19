import React from 'react';
import {
  UserCircle, Star, Bell, Camera as CameraIcon, ShieldCheck, HelpCircle, Info, ChevronRight, LogOut, Trash2, ArrowLeft, MapPin, Film
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';
import SettingsToggleRow from './SettingsToggleRow';
import TextSegmentedControl from './TextSegmentedControl';

const SettingsRow: React.FC<{
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}> = ({ icon, color, title, subtitle, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center p-4 text-left hover:bg-white/5 transition-colors min-h-[64px]">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0 ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-white font-medium text-base">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
    </div>
    <ChevronRight className="w-5 h-5 text-gray-500" />
  </button>
);

const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 pb-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
    <div className="bg-neutral-800/60 backdrop-blur-lg rounded-xl overflow-hidden border border-neutral-700/50 shadow-lg">
      {React.Children.map(children, (child, index) => (
        <>
          {child}
          {index < React.Children.count(children) - 1 && <div className="pl-18"><div className="h-px bg-white/5"></div></div>}
        </>
      ))}
    </div>
  </div>
);

const SettingsView: React.FC = () => {
  const { profile, setCurrentView, updateProfileDetails, refreshProfile } = useAppContext();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to log out.');
    } else {
      setCurrentView('rolls');
    }
  };

  const handleComingSoon = () => {
    toast('Feature coming soon!', { icon: '🚧' });
  };

  const handleAccountDeletion = () => {
    toast.error('Account deletion is a critical action and has not been implemented yet.');
  };

  const handleGeolocationToggle = async (enabled: boolean) => {
    await updateProfileDetails({ is_geolocation_enabled: enabled });
    await refreshProfile();
  };

  const handleExperienceChange = async (mode: 'digital' | 'standard' | 'authentic') => {
    await updateProfileDetails({ experience_mode: mode });
    await refreshProfile();
  };

  const experienceOptions = [
    { value: 'digital', label: 'Digital' },
    { value: 'standard', label: 'Standard' },
    { value: 'authentic', label: 'Authentic' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-transparent text-white">
       <div className="flex items-center p-4 border-b border-neutral-700/50 bg-neutral-800/60 backdrop-blur-lg">
        <button onClick={() => setCurrentView('profile')} className="p-2 text-gray-400 hover:text-white rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white mx-auto">Settings</h1>
        <div className="w-6 h-6"></div>
      </div>
      <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar">
        <SettingsGroup title="Account">
          <SettingsRow
            icon={<UserCircle className="w-5 h-5 text-white" />}
            color="bg-blue-500"
            title="Manage Account"
            subtitle={profile?.email}
            onClick={handleComingSoon}
          />
          <SettingsRow
            icon={<Star className="w-5 h-5 text-white" />}
            color="bg-brand-amber-start"
            title="Subscription"
            subtitle={profile?.subscription ? profile.subscription.charAt(0).toUpperCase() + profile.subscription.slice(1) : 'Free'}
            onClick={() => setCurrentView('subscription')}
          />
        </SettingsGroup>

        <SettingsGroup title="Experience Mode">
          <div className="p-4">
            <TextSegmentedControl 
              options={experienceOptions} 
              value={profile?.experience_mode || 'standard'} 
              onChange={(val) => handleExperienceChange(val as any)} 
            />
            <p className="text-xs text-gray-400 mt-3 text-center px-2">
              {profile?.experience_mode === 'digital' && 'Digital-only experience. Prints are disabled.'}
              {profile?.experience_mode === 'standard' && 'Digital photos develop on a timer. Prints can be ordered anytime.'}
              {profile?.experience_mode === 'authentic' && 'Digital photos are locked until you order prints and enter the unlock code.'}
            </p>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Preferences">
          <SettingsRow
            icon={<Bell className="w-5 h-5 text-white" />}
            color="bg-accent-coral"
            title="Notifications"
            onClick={() => setCurrentView('notifications')}
          />
          <SettingsRow
            icon={<CameraIcon className="w-5 h-5 text-white" />}
            color="bg-accent-teal"
            title="Camera Preferences"
            onClick={handleComingSoon}
          />
        </SettingsGroup>

        <SettingsGroup title="Privacy & Security">
          <SettingsToggleRow
            icon={<MapPin className="w-5 h-5 text-white" />}
            color="bg-green-500"
            title="Enable Geotagging"
            subtitle="Save location data with your photos"
            checked={profile?.is_geolocation_enabled || false}
            onChange={handleGeolocationToggle}
          />
          <SettingsRow
            icon={<ShieldCheck className="w-5 h-5 text-white" />}
            color="bg-accent-violet"
            title="Privacy Policy"
            onClick={handleComingSoon}
          />
        </SettingsGroup>

        <SettingsGroup title="Support">
           <SettingsRow
            icon={<HelpCircle className="w-5 h-5 text-white" />}
            color="bg-teal-500"
            title="Help & Support"
            onClick={handleComingSoon}
          />
           <SettingsRow
            icon={<Info className="w-5 h-5 text-white" />}
            color="bg-gray-500"
            title="About Filmique"
            onClick={handleComingSoon}
          />
        </SettingsGroup>

        <div className="mt-10 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700/80 rounded-xl transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
          <button
            onClick={handleAccountDeletion}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-transparent hover:bg-red-900/30 rounded-xl transition-colors text-red-500 hover:text-red-400 font-semibold"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Account</span>
          </button>
        </div>

        <div className="text-center text-gray-500 text-xs mt-8">
          Version 0.0.4.69
        </div>
      </div>
    </div>
  );
};

export default SettingsView;