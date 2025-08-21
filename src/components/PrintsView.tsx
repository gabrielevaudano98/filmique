import React, { useEffect, useMemo } from 'react';
import { Printer, SlidersHorizontal } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PrintOrderCard from './PrintOrderCard';
import ExpandableSearch from './ExpandableSearch';

const PrintsView: React.FC = () => {
  const { 
    printOrders, 
    fetchPrintOrders,
    printSearchTerm,
    setPrintSearchTerm,
    printStatusFilter,
    printSortOrder,
    setIsPrintsSettingsOpen,
  } = useAppContext();

  useEffect(() => {
    fetchPrintOrders();
  }, [fetchPrintOrders]);

  const filteredAndSortedOrders = useMemo(() => {
    let orders = [...printOrders];

    // Filter by status
    if (printStatusFilter !== 'all') {
      orders = orders.filter(order => order.status === printStatusFilter);
    }

    // Filter by search term
    if (printSearchTerm) {
      const lowerCaseSearch = printSearchTerm.toLowerCase();
      orders = orders.filter(order => 
        order.rolls.title?.toLowerCase().includes(lowerCaseSearch) ||
        order.rolls.film_type.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Sort
    orders.sort((a, b) => {
      if (printSortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      // Default to newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return orders;
  }, [printOrders, printSearchTerm, printStatusFilter, printSortOrder]);

  return (
    <div className="flex flex-col w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExpandableSearch searchTerm={printSearchTerm} onSearchTermChange={setPrintSearchTerm} />
            <button
              onClick={() => setIsPrintsSettingsOpen(true)}
              className="flex items-center justify-center w-11 h-11 bg-neutral-800/60 backdrop-blur-lg border border-white/10 text-white hover:bg-neutral-700/80 rounded-xl transition-colors"
              aria-label="Display options"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {filteredAndSortedOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedOrders.map(order => (
            <PrintOrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-neutral-500">
          <Printer className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No Matching Orders</h3>
          <p className="mt-2">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default PrintsView;