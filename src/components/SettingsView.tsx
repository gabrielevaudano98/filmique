import React from 'react';
import {
  UserCircle, Star, Bell, Camera as CameraIcon, ShieldCheck, HelpCircle, Info, ChevronRight, LogOut, Trash2, Edit, Flame, Zap, Image as ImageIcon
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';

const SettingsRow: React.FC<{
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}> = ({ icon, color, title, subtitle, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center p-4 text-left hover:bg-gray-700/50 transition-colors min-h-[64px]">
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
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50">
      {React.Children.map(children, (child, index) => (
        <>
          {child}
          {index < React.Children.count(children) - 1 && <div className="pl-18"><div className="h-px bg-gray-700/50"></div></div>}
        </>
      ))}
    </div>
  </div>
);

const HighlightStat: React.FC<{ icon: React.ReactNode; value: string | number; label: string }> = ({ icon, value, label }) => (
  <div className="bg-gray-800/50 p-4 rounded-xl text-center">
    <div className="text-amber-400 w-8 h-8 mx-auto mb-2 flex items-center justify-center">{icon}</div>
    <p className="text-xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
  </div>
);

const SettingsView: React.FC = () => {
  const { profile, setCurrentView, completedRolls } = useAppContext();

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

  if (!profile) {
    return <div className="text-white p-6">Loading profile...</div>;
  }

  const totalPhotos = completedRolls.reduce((sum, roll) => sum + (roll.developed_at ? roll.shots_used : 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white overflow-y-auto no-scrollbar">
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold font-recoleta text-white mb-6">Profile & Settings</h1>

        {/* Profile Header */}
        <div className="flex items-center bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700/50">
          <img
            src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.username}`}
            className="w-16 h-16 rounded-full mr-4 object-cover bg-gray-700"
            alt="User avatar"
          />
          <div className="flex-1">
            <p className="font-bold text-lg">{profile.username}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
          </div>
          <button onClick={handleComingSoon} className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full transition-colors">
            <Edit className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <HighlightStat icon={<Flame className="w-6 h-6" />} value={profile.streak} label="Day Streak" />
          <HighlightStat icon={<Zap className="w-6 h-6" />} value={profile.credits} label="Credits" />
          <HighlightStat icon={<ImageIcon className="w-6 h-6" />} value={totalPhotos} label="Photos" />
        </div>

        <SettingsGroup title="Account">
          <SettingsRow
            icon={<UserCircle className="w-5 h-5 text-white" />}
            color="bg-blue-500"
            title="Manage Account"
            onClick={handleComingSoon}
          />
          <SettingsRow
            icon={<Star className="w-5 h-5 text-white" />}
            color="bg-amber-500"
            title="Subscription"
            subtitle={profile.subscription.charAt(0).toUpperCase() + profile.subscription.slice(1)}
            onClick={handleComingSoon}
          />
        </SettingsGroup>

        <SettingsGroup title="Preferences">
          <SettingsRow
            icon={<Bell className="w-5 h-5 text-white" />}
            color="bg-red-500"
            title="Notifications"
            onClick={handleComingSoon}
          />
          <SettingsRow
            icon={<CameraIcon className="w-5 h-5 text-white" />}
            color="bg-green-500"
            title="Camera Preferences"
            onClick={handleComingSoon}
          />
          <SettingsRow
            icon={<ShieldCheck className="w-5 h-5 text-white" />}
            color="bg-indigo-500"
            title="Privacy & Security"
            onClick={handleComingSoon}
          />
        </SettingsGroup>

        <SettingsGroup title="Support">
          <SettingsRow
            icon={<HelpCircle className="w-5 h-5 text-white" />}
            color="bg-gray-500"
            title="Help & Support"
            onClick={handleComingSoon}
          />
          <SettingsRow
            icon={<Info className="w-5 h-5 text-white" />}
            color="bg-gray-500"
            title="About"
            subtitle="v1.0.0"
            onClick={handleComingSoon}
          />
        </SettingsGroup>

        <div className="mt-10 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-800 border border-gray-700 hover:bg-gray-700/80 rounded-xl transition-colors font-semibold"
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
      </div>
    </div>
  );
};

export default SettingsView;