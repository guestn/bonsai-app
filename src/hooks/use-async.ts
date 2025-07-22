import { DependencyList, useEffect, useState } from 'react';

// The hook will persist value across re-renders but not mount/unmount.
export const useAsync = <T, E extends Error = Error>(
  asyncFunction: () => Promise<T>,
  deps?: DependencyList,
) => {
  const [data, setData] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<E>();

  const execute = () => {
    setIsLoading(true);

    asyncFunction()
      .then((returnedData) => {
        setData(returnedData);
        setError(undefined);
      })
      .catch((caughtError) => {
        setData(undefined);
        setError(caughtError);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => execute(), deps);

  return { data, isLoading, error, refetch: execute };
};
