import React from 'react';

interface ShutterControlProps {
  onTakePhoto: () => void;
  timerOn: boolean;
  onTimerToggle: () => void;
  disabled: boolean;
}

const ShutterControl: React.FC<ShutterControlProps> = ({ onTakePhoto, timerOn, onTimerToggle, disabled }) => {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 w-full flex flex-col items-center justify-between flex-1">
      <div className="flex items-center space-x-3">
        <span className="text-neutral-500 text-sm">timer {timerOn ? 'on' : 'off'}</span>
        <button onClick={onTimerToggle} className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${timerOn ? 'bg-yellow-400' : 'bg-neutral-800'}`}>
          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${timerOn ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
      </div>
      <button onClick={onTakePhoto} disabled={disabled} className="w-16 h-16 rounded-full bg-white transition-transform active:scale-95 disabled:bg-neutral-700"></button>
    </div>
  );
};

export default ShutterControl;