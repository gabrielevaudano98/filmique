import React from 'react';
import { Printer } from 'lucide-react';

const PrintsView: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center p-8 bg-neutral-800/50 border border-neutral-700/50 rounded-2xl max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand-amber-start to-brand-amber-end flex items-center justify-center shadow-lg">
          <Printer className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">Coming Soon: Prints</h3>
        <p className="mt-3 text-neutral-400 max-w-xs mx-auto">
          Get high-quality physical prints of your favorite photos delivered right to your door.
        </p>
      </div>
    </div>
  );
};

export default PrintsView;