import React from 'react';

interface XPBarProps {
  xp: number;
  level: number;
}

const getXpForLevel = (level: number) => 100 * (level - 1) * (level - 1);

const XPBar: React.FC<XPBarProps> = ({ xp, level }) => {
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const xpIntoLevel = xp - currentLevelXp;
  const xpForNextLevel = nextLevelXp - currentLevelXp;
  const progress = Math.min(100, (xpIntoLevel / xpForNextLevel) * 100);

  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-bold text-amber-400">Level {level}</span>
        <span className="text-gray-400">{xpIntoLevel} / {xpForNextLevel} XP</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default XPBar;