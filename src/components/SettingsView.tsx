import React from 'react';
import {
  UserCircle, Star, Bell, Camera as CameraIcon, ShieldCheck, HelpCircle, Info, ChevronRight, LogOut, Trash2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

// Helper component for the toggle switch
const ToggleSwitch: React.FC<{ enabled?: boolean; onChange?: () => void }> = ({ enabled, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={enabled} onChange={onChange} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-600 peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
  </label>
);

// Helper component for a settings row
const SettingsRow: React.FC<{
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  type?: 'navigation' | 'toggle';
}> = ({ icon, color, title, subtitle, onClick, type = 'navigation' }) => {
  const content = (
    <>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-white font-medium">{title}</p>
      </div>
      <div className="flex items-center space-x-2">
        {subtitle && <p className="text-gray-400">{subtitle}</p>}
        {type === 'navigation' && <ChevronRight className="w-5 h-5 text-gray-500" />}
        {type === 'toggle' && <ToggleSwitch />}
      </div>
    </>
  );

  return (
    <button onClick={onClick} className="w-full flex items-center p-3 text-left border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/50 transition-colors min-h-[56px]">
      {content}
    </button>
  );
};

// Helper component for grouping settings
const SettingsGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
    {children}
  </div>
);

const SettingsView: React.FC = () => {
  const { user, setUser, setCurrentView } = useAppContext();

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
  };

  const handleAccountDeletion = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is permanent and cannot be undone.')) {
      console.log('Account deletion initiated for', user.email);
      setUser(null);
      setCurrentView('home');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white overflow-y-auto no-scrollbar">
      <div className="p-4 pt-6">
        <h1 className="text-3xl font-bold font-recoleta text-white">Settings</h1>
      </div>

      <div className="px-4 mb-6">
        <div className="flex items-center bg-gray-800 p-4 rounded-xl hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setCurrentView('profile')}>
          <img
            src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=600"
            className="w-16 h-16 rounded-full mr-4 object-cover"
            alt="User avatar"
          />
          <div className="flex-1">
            <p className="font-bold text-xl">{user.username}</p>
            <p className="text-gray-400">{user.email}</p>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-500" />
        </div>
      </div>

      <div className="px-4">
        <SettingsGroup>
          <SettingsRow
            icon={<UserCircle className="w-5 h-5 text-white" />}
            color="bg-blue-500"
            title="Manage Account"
            onClick={() => alert('Navigate to Account Management')}
          />
          <SettingsRow
            icon={<Star className="w-5 h-5 text-white" />}
            color="bg-amber-500"
            title="Subscription"
            subtitle={user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1)}
            onClick={() => alert('Navigate to Subscription Management')}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={<Bell className="w-5 h-5 text-white" />}
            color="bg-red-500"
            title="Notifications"
            onClick={() => alert('Navigate to Notification Settings')}
          />
          <SettingsRow
            icon={<CameraIcon className="w-5 h-5 text-white" />}
            color="bg-green-500"
            title="Camera Preferences"
            onClick={() => alert('Navigate to Camera Preferences')}
          />
          <SettingsRow
            icon={<ShieldCheck className="w-5 h-5 text-white" />}
            color="bg-indigo-500"
            title="Privacy & Security"
            onClick={() => alert('Navigate to Privacy Settings')}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={<HelpCircle className="w-5 h-5 text-white" />}
            color="bg-gray-500"
            title="Help & Support"
            onClick={() => alert('Navigate to Help Center')}
          />
          <SettingsRow
            icon={<Info className="w-5 h-5 text-white" />}
            color="bg-gray-500"
            title="About"
            subtitle="v1.0.0"
            onClick={() => alert('Show About screen')}
          />
        </SettingsGroup>

        <div className="my-8 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-800 hover:bg-gray-700/80 rounded-xl transition-colors font-semibold"
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
