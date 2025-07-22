import { FC, ReactNode } from 'react';
import { SWRConfig, SWRConfiguration } from 'swr';
import { pufferBffFetcher } from './lib/fetchers';

type SWRProviderProps = {
  // The fetcher can be overwritten by using a nested `SWRConfig` or
  // `SWRProvider`. For different responses, this will need to be
  // overwritten or a different fetcher needs to be passed to the
  // `useSWR` hook.
  fetcher?: SWRConfiguration['fetcher'];
  fallback?: SWRConfiguration['fallback'];
  provider?: SWRConfiguration['provider'];
  children: ReactNode;
};

export const SWRProvider: FC<SWRProviderProps> = ({
  fetcher = pufferBffFetcher,
  fallback = {},
  provider,
  children,
}) => {
  const isTest = process.env.NODE_ENV === 'test';

  return (
    <SWRConfig
      value={{
        fetcher,
        fallback,
        provider: provider || (() => new Map()),
        isVisible: isTest ? () => true : undefined,
        isOnline: isTest ? () => true : undefined,
        ...(isTest && {
          // Test-specific config
          dedupingInterval: 0,
          focusThrottleInterval: 0,
        }),
      }}
    >
      {children}
    </SWRConfig>
  );
};
