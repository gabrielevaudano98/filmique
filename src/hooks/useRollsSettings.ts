import { useState } from 'react';

export const useRollsSettings = () => {
  const [rollsSortOrder, setRollsSortOrder] = useState('newest');
  const [rollsGroupBy, setRollsGroupBy] = useState('month');
  const [rollsSelectedFilm, setRollsSelectedFilm] = useState('all');

  return {
    rollsSortOrder, setRollsSortOrder,
    rollsGroupBy, setRollsGroupBy,
    rollsSelectedFilm, setRollsSelectedFilm,
  };
};