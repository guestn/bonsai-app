import { Config, UseAccountReturnType } from 'wagmi';
import { Web3ContextProps } from '@/context/web3-context/types';

export const MOCK_WEB3_CONTEXT = (
  overrides?: Partial<UseAccountReturnType<Config>>,
): Web3ContextProps =>
  ({
    disconnect: () => {},
    address: '0x418FaF118bD6bf9C9142Cghj01787436b4EcDABA',
    addresses: ['0x418FaF118bD6bf9C9142Cghj01787436b4EcDABA'],
    chain: {
      id: 17000,
      name: 'Holesky',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 5 },
      rpcUrls: { default: { http: ['x'] } },
    },
    chainId: 17000,
    connector: { name: 'Metamask' },
    isConnected: false,
    isReconnecting: false,
    isConnecting: false,
    isDisconnected: true,
    status: 'disconnected',
    ...overrides,
  }) as Web3ContextProps;
