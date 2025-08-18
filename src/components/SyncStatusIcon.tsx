import React from 'react';
import { CloudOff, Loader, CheckCircle } from 'lucide-react';
import { LocalRoll } from '../integrations/db';

interface SyncStatusIconProps {
  status: LocalRoll['sync_status'];
}

const SyncStatusIcon: React.FC<SyncStatusIconProps> = ({ status }) => {
  switch (status) {
    case 'syncing':
      return <Loader className="w-4 h-4 text-blue-400 animate-spin" title="Syncing..." />;
    case 'synced':
      return <CheckCircle className="w-4 h-4 text-green-400" title="Backed up" />;
    case 'local_only':
    default:
      return <CloudOff className="w-4 h-4 text-gray-500" title="Not backed up" />;
  }
};

export default SyncStatusIcon;