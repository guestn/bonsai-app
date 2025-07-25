import useSWR from 'swr';
import { BonsaiService } from '../services/bonsai-service';
import { BonsaiTree, BonsaiFilters } from '../types/bonsai';

// Import mock data as fallback
import { mockBonsaiData } from '../data/mock-bonsai-data';
import { shouldUseMockData } from '../utils/dev-config';

// Custom fetchers for Firebase operations
const bonsaiListFetcher = async () => {
  if (shouldUseMockData()) {
    console.info('Using mock data (forced by config)');
    return mockBonsaiData;
  }

  try {
    return await BonsaiService.getAllBonsai();
  } catch (error) {
    console.warn('Firebase connection failed, using mock data:', error);
    return mockBonsaiData;
  }
};

const bonsaiByIdFetcher = async (id: string) => {
  try {
    return await BonsaiService.getBonsaiById(id);
  } catch (error) {
    console.warn('Firebase connection failed, using mock data:', error);
    return mockBonsaiData.find((tree) => tree.id === id) || null;
  }
};

const bonsaiWithFiltersFetcher = async (filters: BonsaiFilters) => {
  try {
    return await BonsaiService.getBonsaiWithFilters(filters);
  } catch (error) {
    console.warn('Firebase connection failed, using mock data:', error);
    // Apply filters to mock data
    return mockBonsaiData.filter((tree) => {
      const matchesSearch =
        !filters.search ||
        tree.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tree.species.toLowerCase().includes(filters.search.toLowerCase()) ||
        tree.notes?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || tree.status === filters.status;
      const matchesSpecies =
        !filters.species || tree.species === filters.species;

      return matchesSearch && matchesStatus && matchesSpecies;
    });
  }
};

export const useBonsai = () => {
  const {
    data: bonsai,
    error,
    isLoading,
    mutate,
  } = useSWR<BonsaiTree[]>('bonsai', bonsaiListFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  return {
    bonsai: bonsai || [],
    error,
    isLoading,
    mutate,
  };
};

export const useBonsaiById = (id: string) => {
  const {
    data: bonsai,
    error,
    isLoading,
    mutate,
  } = useSWR<BonsaiTree | null>(
    id ? `bonsai/${id}` : null,
    () => bonsaiByIdFetcher(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    bonsai,
    error,
    isLoading,
    mutate,
  };
};

export const useBonsaiWithFilters = (filters: BonsaiFilters) => {
  const {
    data: bonsai,
    error,
    isLoading,
    mutate,
  } = useSWR<BonsaiTree[]>(
    `bonsai-filters/${JSON.stringify(filters)}`,
    () => bonsaiWithFiltersFetcher(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    bonsai: bonsai || [],
    error,
    isLoading,
    mutate,
  };
};

// Mutation functions
export const useBonsaiMutations = () => {
  const { mutate: mutateAll } = useSWR('bonsai');

  const createBonsai = async (tree: Omit<BonsaiTree, 'id'>) => {
    try {
      const id = await BonsaiService.createBonsai(tree);
      await mutateAll(); // Refresh the list
      return id;
    } catch (error) {
      console.error('Error creating bonsai:', error);
      throw error;
    }
  };

  const updateBonsai = async (id: string, tree: Partial<BonsaiTree>) => {
    try {
      await BonsaiService.updateBonsai(id, tree);
      await mutateAll(); // Refresh the list
      // Note: We can't easily mutate specific items without the mutate function
    } catch (error) {
      console.error('Error updating bonsai:', error);
      throw error;
    }
  };

  const deleteBonsai = async (id: string) => {
    try {
      await BonsaiService.deleteBonsai(id);
      await mutateAll(); // Refresh the list
    } catch (error) {
      console.error('Error deleting bonsai:', error);
      throw error;
    }
  };

  const addEvent = async (
    bonsaiId: string,
    event: Omit<BonsaiTree['events'][0], 'id'>,
    mutateSpecific?: () => Promise<any>,
  ) => {
    try {
      await BonsaiService.addEvent(bonsaiId, event);
      await mutateAll(); // Refresh the list
      if (mutateSpecific) {
        await mutateSpecific(); // Refresh the specific bonsai detail
      }
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (
    bonsaiId: string,
    eventId: string,
    event: Omit<BonsaiTree['events'][0], 'id'>,
    mutateSpecific?: () => Promise<any>,
  ) => {
    try {
      await BonsaiService.updateEvent(bonsaiId, eventId, event);
      await mutateAll(); // Refresh the list
      if (mutateSpecific) {
        await mutateSpecific(); // Refresh the specific bonsai detail
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (
    bonsaiId: string,
    eventId: string,
    mutateSpecific?: () => Promise<any>,
  ) => {
    try {
      await BonsaiService.deleteEvent(bonsaiId, eventId);
      await mutateAll(); // Refresh the list
      if (mutateSpecific) {
        await mutateSpecific(); // Refresh the specific bonsai detail
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  return {
    createBonsai,
    updateBonsai,
    deleteBonsai,
    addEvent,
    updateEvent,
    deleteEvent,
  };
};
