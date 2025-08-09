import React from 'react';
import { LogOut, Trash2, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../integrations/supabase/client';
import toast from 'react-hot-toast';

const SettingsRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  isDestructive?: boolean;
}> = ({ icon, title, onClick, isDestructive }) => (
  <button onClick={onClick} className={`w-full flex items-center p-4 text-left transition-colors min-h-[64px] ${isDestructive ? 'text-red-400 hover:bg-red-900/20' : 'text-white hover:bg-gray-700/50'}`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 shrink-0 ${isDestructive ? 'bg-red-900/20' : 'bg-gray-700'}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-medium text-base">{title}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-500" />
  </button>
);

const SettingsView: React.FC = () => {
  const { setCurrentView } = useAppContext();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to log out.');
    } else {
      setCurrentView('rolls');
    }
  };

  const handleAccountDeletion = () => {
    toast.error('Account deletion is a critical action and has not been implemented yet.');
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white">
       <div className="flex items-center p-4 border-b border-gray-800">
        <button onClick={() => setCurrentView('profile')} className="p-2 text-gray-400 hover:text-white rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold font-recoleta text-white mx-auto">Settings</h1>
      </div>
      <div className="p-4 sm:p-6">
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50">
          <SettingsRow
            icon={<LogOut className="w-5 h-5" />}
            title="Log Out"
            onClick={handleLogout}
          />
          <div className="pl-18"><div className="h-px bg-gray-700/50"></div></div>
          <SettingsRow
            icon={<Trash2 className="w-5 h-5" />}
            title="Delete Account"
            onClick={handleAccountDeletion}
            isDestructive
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsView;