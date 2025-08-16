import React from 'react';
import { Printer } from 'lucide-react';

const PrintsView: React.FC = () => {
  return (
    <div className="text-center py-24 text-neutral-500">
      <Printer className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white">Prints</h3>
      <p className="mt-2">This feature is coming soon!</p>
    </div>
  );
};

export default PrintsView;