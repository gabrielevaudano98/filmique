import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../integrations/db';
import { useAppContext } from '../context/AppContext';
import { X, RefreshCw, Trash2, AlertTriangle, Loader } from 'lucide-react';
import { PendingTransaction } from '../integrations/db';

const getTransactionDescription = (tx: PendingTransaction): string => {
  switch (tx.type) {
    case 'CREATE_POST':
      return `Post: "${tx.payload.caption.substring(0, 20)}..."`;
    case 'PURCHASE_PRINT':
      return `Print Order for Roll ID: ...${tx.payload.rollId.slice(-6)}`;
    case 'BACKUP_ROLL':
      return `Cloud Backup for Roll ID: ...${tx.payload.rollId.slice(-6)}`;
    case 'DELETE_ROLL':
        return `Delete Roll ID: ...${tx.payload.rollId.slice(-6)}`;
    default:
      return `Unknown action`;
  }
};

const SyncStatusModal: React.FC = () => {
  const { setIsSyncStatusModalOpen, retryFailedTransaction, deleteFailedTransaction } = useAppContext();
  
  const failedTransactions = useLiveQuery(() =>
    db.pending_transactions.where('status').equals('failed').toArray()
  , []);

  const pendingTransactions = useLiveQuery(() =>
    db.pending_transactions.where('status').equals('pending').toArray()
  , []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-neutral-800 rounded-2xl max-w-md w-full flex flex-col max-h-[80vh] shadow-2xl animate-modal-enter">
        <div className="flex-shrink-0 p-5 border-b border-neutral-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Sync Status
          </h2>
          <button onClick={() => setIsSyncStatusModalOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-5 space-y-6">
          {failedTransactions && failedTransactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Failed Items</h3>
              <div className="space-y-3">
                {failedTransactions.map(tx => (
                  <div key={tx.id} className="bg-neutral-700/50 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{getTransactionDescription(tx)}</p>
                      <p className="text-xs text-gray-500">Failed at {new Date(tx.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => tx.id && retryFailedTransaction(tx.id)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full transition-colors" title="Retry">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button onClick={() => tx.id && deleteFailedTransaction(tx.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingTransactions && pendingTransactions.length > 0 && (
             <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2"><Loader className="w-5 h-5 animate-spin" /> In Queue</h3>
              <div className="space-y-3">
                {pendingTransactions.map(tx => (
                  <div key={tx.id} className="bg-neutral-700/50 rounded-lg p-3">
                    <p className="font-semibold text-white">{getTransactionDescription(tx)}</p>
                    <p className="text-xs text-gray-500">Waiting to sync...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!failedTransactions || failedTransactions.length === 0) && (!pendingTransactions || pendingTransactions.length === 0) && (
            <p className="text-center text-gray-500 py-8">Everything is up to date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncStatusModal;