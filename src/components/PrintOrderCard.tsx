import React from 'react';
import { PrintOrder } from '../types';
import { Clock, Package, Truck, CheckCircle, XCircle, Zap } from 'lucide-react';
import Image from './Image';
import { useAppContext } from '../context/AppContext';

interface PrintOrderCardProps {
  order: PrintOrder;
}

const statusInfo = {
  queued: { icon: Clock, label: 'Queued', color: 'text-cyan-400', description: 'Your order is waiting to be processed.' },
  processing: { icon: Package, label: 'Processing', color: 'text-amber-400', description: 'Your prints are being prepared.' },
  shipped: { icon: Truck, label: 'Shipped', color: 'text-green-400', description: 'Your order is on its way!' },
  canceled: { icon: XCircle, label: 'Canceled', color: 'text-red-400', description: 'This order has been canceled.' },
};

const PrintOrderCard: React.FC<PrintOrderCardProps> = ({ order }) => {
  const { cancelPrintOrder } = useAppContext();
  const info = statusInfo[order.status as keyof typeof statusInfo] || statusInfo.queued;
  const Icon = info.icon;

  return (
    <div className="bg-white/70 dark:bg-neutral-800/60 backdrop-blur-lg border border-white/30 dark:border-neutral-700/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-none">
      <Image
        src={order.rolls.photos?.[0]?.thumbnail_url}
        alt={order.rolls.title || 'Roll cover'}
        className="w-full sm:w-24 h-32 sm:h-24 rounded-lg object-cover bg-neutral-700 flex-shrink-0"
      />
      <div className="flex-1">
        <h3 className="font-bold text-black dark:text-white">{order.rolls.title || 'Untitled Roll'}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{order.rolls.film_type} &bull; {order.rolls.shots_used} photos</p>
        <p className="text-xs text-gray-400 mt-1">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
        
        <div className="flex items-center gap-2 mt-3">
          <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full bg-neutral-700/50 ${info.color}`}>
            <Icon className="w-4 h-4" />
            {info.label}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>{order.cost} Credits</span>
          </div>
        </div>
      </div>
      {order.status === 'queued' && (
        <button 
          onClick={() => cancelPrintOrder(order.id)}
          className="w-full sm:w-auto bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 text-sm font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default PrintOrderCard;