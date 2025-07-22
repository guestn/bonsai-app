import { PufferClient } from '@pufferfinance/puffer-sdk';
import { useMemo } from 'react';
import { Config, useChainId, usePublicClient, useWalletClient } from 'wagmi';

type PufferSDKParams = {
  chainId?: number;
};

export const usePufferSDK = (params?: PufferSDKParams) => {
  const currentChainId = useChainId();
  const chainId = params?.chainId ?? currentChainId;
  // For some reason, the client types mismatch between the SDK and
  // wagmi.
  const publicClient: any = usePublicClient<Config, number>({ chainId });
  const { data: walletClient } = useWalletClient<Config, number, any>({
    chainId,
  });

  return useMemo(
    () => new PufferClient(chainId, walletClient, publicClient),
    [chainId, publicClient, walletClient],
  );
};
