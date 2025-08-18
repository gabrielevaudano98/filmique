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
  const { syncStatus } = useAppContext();
  const { icon: Icon, color, label, animation } = statusInfo[syncStatus];

  return (
    <div className="flex items-center justify-center w-10 h-10" title={label}>
      <Icon className={`w-5 h-5 ${color} ${animation}`} />
    </div>
  );
};

export default SyncStatusIndicator;