import { erc20Abi } from 'viem';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import {
  Chain,
  TOKENS_ADDRESSES,
  Token,
  UnifiToken,
} from '@pufferfinance/puffer-sdk';

export const useTokenBalance = (token: Token | UnifiToken | 'ETH') => {
  let { address, chainId } = useAccount();
  const ethBalanceData = useBalance({ address });

  // UniFi tokens are only on mainnet.
  if (token in UnifiToken) {
    chainId = Chain.Mainnet;
  }

  const {
    data,
    isLoading,
    error,
    refetch: refetchTokenBalance,
  } = useReadContract({
    chainId,
    // This will return either the token address or undefined.
    address:
      token !== 'ETH' && chainId !== undefined
        ? TOKENS_ADDRESSES[token]?.[chainId]
        : undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address && [address],
  });

  if (token === 'ETH') {
    return { ...ethBalanceData, data: ethBalanceData.data?.value };
  }

  return {
    data,
    isLoading,
    error,
    refetch: refetchTokenBalance,
  };
};
