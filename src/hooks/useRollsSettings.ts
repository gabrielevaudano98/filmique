import { useState } from 'react';

export const useRollsSettings = () => {
  const [rollsSortOrder, setRollsSortOrder] = useState('newest');
  const [rollsGroupBy, setRollsGroupBy] = useState('date');
  const [rollsSelectedFilm, setRollsSelectedFilm] = useState('all');
  const [rollsViewMode, setRollsViewMode] = useState<'active' | 'archived'>('active');

  return {
    rollsSortOrder, setRollsSortOrder,
    rollsGroupBy, setRollsGroupBy,
    rollsSelectedFilm, setRollsSelectedFilm,
    rollsViewMode, setRollsViewMode,
  };
};