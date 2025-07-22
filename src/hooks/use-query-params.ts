import { useSearchParams } from 'react-router-dom';

export const useQueryParams = <T extends Record<string, string>>() => {
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    searchParams,
    setSearchParams: (params: Partial<T>) => {
      setSearchParams((prev) => {
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') {
            prev.delete(key);
          } else {
            prev.set(key, value);
          }
        });

        return prev;
      });
    },
    resetSearchParams: () => setSearchParams({}),
  };
};
