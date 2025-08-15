import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import RollListItem from './RollListItem';
import { isRollDeveloping } from '../utils/rollUtils';

const DarkroomView: React.FC = () => {
  const { completedRolls, setCurrentView } = useAppContext();

  const developingRolls = completedRolls.filter(isRollDeveloping);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentView('profile')} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Profile</span>
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Darkroom</h2>
        <p className="text-gray-400 mt-1">
          {developingRolls.length} {developingRolls.length === 1 ? 'roll is' : 'rolls are'} currently developing.
        </p>
      </div>

      {developingRolls.length > 0 ? (
        <div className="space-y-3">
          {developingRolls.map(roll => (
            <RollListItem
              key={roll.id}
              roll={roll}
              onDelete={() => {}}
              onAssignAlbum={() => {}}
              isDeveloping={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 px-4 col-span-full bg-gray-800/50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-white">Darkroom is Empty</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Send undeveloped rolls from your shelf to the darkroom to start the development process.
          </p>
        </div>
      )}
    </div>
  );
};

export default DarkroomView;