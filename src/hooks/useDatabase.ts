import { useState, useEffect } from 'react';
import { dbService } from '../services/database';

export const useDatabase = () => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await dbService.initialize();
        setIsDbInitialized(true);
      } catch (err: any) {
        setDbError(err);
      }
    };
    init();
  }, []);

  return { isDbInitialized, dbError };
};