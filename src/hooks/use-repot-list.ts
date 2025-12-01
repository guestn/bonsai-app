import { useCallback } from 'react';
import useSWR from 'swr';
import { RepotListService } from '../services/repot-list-service';
import { useAuth } from '../context/auth-provider';
import { shouldUseMockData } from '../utils/dev-config';

// Mock data fetcher for development
const repotListFetcher = async (userId: string | null): Promise<string[]> => {
  if (!userId) {
    return [];
  }

  if (shouldUseMockData()) {
    console.info('Using mock repot list data');
    // Return empty array for mock data, or you could return some test IDs
    return [];
  }

  try {
    return await RepotListService.getRepotList(userId);
  } catch (error) {
    console.warn('Firebase connection failed for repot list:', error);
    return [];
  }
};

export const useRepotList = () => {
  const { user } = useAuth();
  const userId = user?.uid || null;

  const {
    data: repotList = [],
    error,
    isLoading,
    mutate,
  } = useSWR<string[]>(
    userId ? `repot-list/${userId}` : null,
    () => repotListFetcher(userId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  const addToRepotList = useCallback(
    async (treeId: string) => {
      if (!userId) return;

      try {
        // Optimistic update
        await mutate(
          (current) => {
            if (current?.includes(treeId)) {
              return current;
            }
            return [...(current || []), treeId];
          },
          { revalidate: false },
        );

        // Update Firebase
        await RepotListService.addToRepotList(userId, treeId);
        
        // Revalidate to ensure sync
        await mutate();
      } catch (error) {
        // Rollback on error
        await mutate();
        console.error('Error adding to repot list:', error);
        throw error;
      }
    },
    [userId, mutate],
  );

  const removeFromRepotList = useCallback(
    async (treeId: string) => {
      if (!userId) return;

      try {
        // Optimistic update
        await mutate(
          (current) => (current || []).filter((id) => id !== treeId),
          { revalidate: false },
        );

        // Update Firebase
        await RepotListService.removeFromRepotList(userId, treeId);
        
        // Revalidate to ensure sync
        await mutate();
      } catch (error) {
        // Rollback on error
        await mutate();
        console.error('Error removing from repot list:', error);
        throw error;
      }
    },
    [userId, mutate],
  );

  const toggleRepotList = useCallback(
    async (treeId: string) => {
      if (!userId) return;

      try {
        if (repotList.includes(treeId)) {
          await RepotListService.removeFromRepotList(userId, treeId);
        } else {
          await RepotListService.addToRepotList(userId, treeId);
        }
        await mutate(); // Refresh the list
      } catch (error) {
        console.error('Error toggling repot list:', error);
        throw error;
      }
    },
    [userId, repotList, mutate],
  );

  const isInRepotList = useCallback(
    (treeId: string) => {
      return repotList.includes(treeId);
    },
    [repotList],
  );

  const clearRepotList = useCallback(async () => {
    if (!userId) return;

    try {
      await RepotListService.clearRepotList(userId);
      await mutate(); // Refresh the list
    } catch (error) {
      console.error('Error clearing repot list:', error);
      throw error;
    }
  }, [userId, mutate]);

  return {
    repotList,
    addToRepotList,
    removeFromRepotList,
    toggleRepotList,
    isInRepotList,
    clearRepotList,
    isLoading,
    error,
  };
};

