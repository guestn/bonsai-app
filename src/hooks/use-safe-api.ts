import { Chain } from '@pufferfinance/puffer-sdk';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useEffect, useMemo } from 'react';
import useSWR, { BareFetcher } from 'swr';
import { Address } from 'viem';
import { useAccount, useChainId } from 'wagmi';

const safeBaseUrlHolesky = 'https://gateway.holesky-safe.protofire.io/';
const safeBaseUrlMainnet = 'https://safe-transaction-mainnet.safe.global/api/';

const safeWalletEndpoint = (chain: Chain, address: string) =>
  chain === Chain.Holesky
    ? `/v1/chains/${chain}/safes/${address}`
    : `/v1/safes/${address}/`;

const safeTxEndpoint = (chain: Chain, safeTx: string) =>
  chain === Chain.Holesky
    ? `/v1/chains/${chain}/transactions/${safeTx}`
    : `/v1/multisig-transactions/${safeTx}/`;

const safeFetcher: (chain: Chain) => BareFetcher<any> =
  (chain: Chain) => async (options) =>
    axios({
      baseURL:
        chain === Chain.Holesky ? safeBaseUrlHolesky : safeBaseUrlMainnet,
      ...options,
    });

export const useFetchIsSafeWallet = () => {
  const chainId = useChainId();
  const { address } = useAccount();

  const { data, error, isLoading } = useSWR(
    address && { url: safeWalletEndpoint(chainId, address) },
    safeFetcher(chainId),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    },
  );

  if ((data?.status && data.status !== 200) || error) {
    return { isSafeWallet: false, error, isLoading };
  }

  return {
    isSafeWallet: data ? data.data?.owners?.length > 0 : undefined,
    error,
    isLoading,
  };
};

export const useFetchOnChainSafeTx = () => {
  const chainId = useChainId();
  const isHolesky = chainId === Chain.Holesky;
  const abortController = useMemo(() => new AbortController(), []);

  // Abort request on unmount. That is, when the modal closes.
  useEffect(() => () => abortController.abort(), [abortController]);

  const fetchOnChainSafeTx = (safeTx: Address) => {
    const recheckInterval = 1000;
    const timeout = 1000 * 60 * 5; // 5 minutes
    let timeElapsed = 0;
    let interval: NodeJS.Timeout;

    return new Promise<Address>((resolve, reject) => {
      const abortListener = () => {
        abortController.signal.removeEventListener('abort', abortListener);
        reject(new Error('Request cancelled to get on-chain tx for safe tx'));
        clearInterval(interval);
      };
      abortController.signal.addEventListener('abort', abortListener);

      interval = setInterval(async () => {
        let response: AxiosResponse;

        try {
          response = await axios({
            baseURL: isHolesky ? safeBaseUrlHolesky : safeBaseUrlMainnet,
            url: safeTxEndpoint(chainId, safeTx),
          });
        } catch (error) {
          clearInterval(interval);

          // Not a safe tx. So we resolve with the original tx.
          if (error instanceof AxiosError && error.response?.status === 404) {
            resolve(safeTx);
          } else {
            reject(error);
          }

          return;
        }

        // It might not be a safe tx, but a regular tx.
        if (response?.status && response.status !== 200) {
          resolve(safeTx);
        }

        const txHash = isHolesky
          ? response?.data?.txHash
          : response?.data?.transactionHash;

        if (txHash) {
          clearInterval(interval);
          resolve(txHash);
        } else if (timeElapsed > timeout) {
          clearInterval(interval);
          reject(new Error(`Failed to get on-chain tx for safe tx: ${safeTx}`));
        }

        timeElapsed += recheckInterval;
      }, recheckInterval);
    });
  };

  return { fetchOnChainSafeTx };
};
