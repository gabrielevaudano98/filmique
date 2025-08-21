import React from 'react';
import { PrintOrder } from '../types';
import { Clock, Package, Truck, CheckCircle, XCircle, Zap } from 'lucide-react';
import Image from './Image';
import { useAppContext } from '../context/AppContext';

interface PrintOrderCardProps {
  order: PrintOrder;
}

const statusInfo = {
  queued: {
    icon: Clock,
    label: 'Queued',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/40',
  },
  processing: {
    icon: Package,
    label: 'Processing',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  shipped: {
    icon: Truck,
    label: 'Shipped',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/40',
  },
  canceled: {
    icon: XCircle,
    label: 'Canceled',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/40',
  },
};

const PrintOrderCard: React.FC<PrintOrderCardProps> = ({ order }) => {
  const { cancelPrintOrder } = useAppContext();
  const info = statusInfo[order.status as keyof typeof statusInfo] || statusInfo.queued;
  const Icon = info.icon;

  return (
    <div className="
      bg-white/80 dark:bg-neutral-800/60
      border border-white/40 dark:border-neutral-700/50
      rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5
      shadow-none backdrop-blur-lg
      transition-colors
    ">
      <Image
        src={order.rolls.photos?.[0]?.thumbnail_url}
        alt={order.rolls.title || 'Roll cover'}
        className="w-full sm:w-28 h-36 sm:h-28 rounded-xl object-cover bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 border border-neutral-200 dark:border-neutral-700"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-neutral-900 dark:text-white text-lg">{order.rolls.title || 'Untitled Roll'}</h3>
        <p className="text-sm text-neutral-600 dark:text-gray-400 mt-1">{order.rolls.film_type} &bull; {order.rolls.shots_used} photos</p>
        <p className="text-xs text-neutral-400 dark:text-gray-400 mt-1">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
        
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${info.bg} ${info.color}`}>
            <Icon className="w-4 h-4" />
            {info.label}
          </div>
          <div className="flex items-center gap-1 text-sm text-amber-700 dark:text-yellow-400 font-semibold bg-amber-100 dark:bg-transparent px-2 py-1 rounded-full">
            <Zap className="w-4 h-4" />
            <span>{order.cost} Credits</span>
          </div>
        </div>
      </div>
      {order.status === 'queued' && (
        <button 
          onClick={() => cancelPrintOrder(order.id)}
          className="
            w-full sm:w-auto mt-4 sm:mt-0
            bg-red-100 dark:bg-red-600/20
            text-red-700 dark:text-red-400
            hover:bg-red-200 dark:hover:bg-red-600/40
            font-bold py-2 px-5 rounded-lg transition-colors
            border border-red-200 dark:border-red-600
            shadow-none
          "
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default PrintOrderCard;