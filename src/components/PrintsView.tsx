import React, { useEffect } from 'react';
import { Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PrintOrderCard from './PrintOrderCard';

const PrintsView: React.FC = () => {
  const { printOrders, fetchPrintOrders } = useAppContext();

  useEffect(() => {
    fetchPrintOrders();
  }, [fetchPrintOrders]);

  const sortedOrders = [...printOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Print Orders</h1>
        <p className="text-gray-400 mt-1">Track the status of your ordered prints.</p>
      </div>

      {sortedOrders.length > 0 ? (
        <div className="space-y-3">
          {sortedOrders.map(order => (
            <PrintOrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-neutral-500">
          <Printer className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No Print Orders Yet</h3>
          <p className="mt-2">Order prints from a developed roll's detail page.</p>
        </div>
      )}
    </div>
  );
};

export default PrintsView;