import { useMemo } from 'react';
import useSWR from 'swr';
import { Token } from '@pufferfinance/puffer-sdk';
import { AxiosError } from 'axios';
import { pufferBffFetcher } from '@/context/swr-provider/lib/fetchers';
import { pufferBffApiRoutes } from '@/api/puffer-bff-routes';
import { buildTokensAddressMap } from '@/utils/token-utils';

type UseFetchUsdRateResponseData = {
  [tokenAddress: string]: {
    usd: number;
  };
};

type TokensUsdRate = {
  [token in Token]?: number;
};

type UseFetchUsdRateResponse = {
  data?: TokensUsdRate;
  error?: AxiosError;
  isLoading: boolean;
};

export const useFetchUsdRate = (
  token: Token | Token[],
): UseFetchUsdRateResponse => {
  const tokens = Array.isArray(token) ? token : [token];

  // To map USD values fetched through addresses back to tokens.
  const addressToTokenMap = useMemo(
    () => buildTokensAddressMap(tokens),
    [tokens],
  );

  const { data, error, isLoading } = useSWR<UseFetchUsdRateResponseData>(
    [pufferBffApiRoutes.TOKEN_PRICE, addressToTokenMap],
    ([url]) => {
      const tokenAddresses = Object.keys(addressToTokenMap);

      const params = new URLSearchParams({
        addresses: tokenAddresses.join(','),
      });

      return pufferBffFetcher({ url, params });
    },
  );

  const tokenUsdRate = useMemo(() => {
    if (!data) {
      return undefined;
    }

    return Object.keys(data).reduce<TokensUsdRate>((acc, tokenAddress) => {
      acc[addressToTokenMap[tokenAddress]] = data[tokenAddress].usd;
      return acc;
    }, {});
  }, [data, addressToTokenMap]);

  return { data: tokenUsdRate, error, isLoading };
};
