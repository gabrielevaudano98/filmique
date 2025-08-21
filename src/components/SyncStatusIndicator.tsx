import React from 'react';
import { CloudOff, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const statusInfo = {
  offline: { icon: CloudOff, color: 'text-gray-500', label: 'Offline', animation: '' },
  syncing: { icon: Loader, color: 'text-blue-400', label: 'Syncing...', animation: 'animate-spin' },
  synced: { icon: CheckCircle, color: 'text-green-400', label: 'Up to date', animation: '' },
  error: { icon: AlertTriangle, color: 'text-red-400', label: 'Sync Error', animation: '' },
};

const SyncStatusIndicator: React.FC = () => {
  const { syncStatus, setIsSyncStatusModalOpen } = useAppContext();
  const { icon: Icon, color, label, animation } = statusInfo[syncStatus];

  // Only show the indicator if status is 'error' or 'syncing'
  if (syncStatus === 'offline' || syncStatus === 'synced') {
    return null;
  }

  const handleClick = () => {
    if (syncStatus === 'error' || syncStatus === 'syncing') {
      setIsSyncStatusModalOpen(true);
    }
  };

  const isClickable = syncStatus === 'error' || syncStatus === 'syncing';

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isClickable ? 'hover:bg-neutral-700/50' : 'cursor-default'}`} 
      title={label}
      disabled={!isClickable}
    >
      <Icon className={`w-5 h-5 ${color} ${animation}`} />
    </button>
  );
};

export default SyncStatusIndicator;