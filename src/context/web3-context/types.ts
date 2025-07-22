import { Address, Chain } from 'viem';
import { DisconnectMutateAsync } from 'wagmi/query';

export type Web3ContextProps = {
  disconnect: () => void;
  disconnectAsync: DisconnectMutateAsync;
  address: Address | undefined;
  addresses: readonly Address[] | undefined;
  chain: Chain | undefined;
  chainId: number | undefined;
  connector: any; // Connector | undefined;
  isConnected: boolean;
  isReconnecting: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  status: 'connecting' | 'disconnected' | 'connected' | 'reconnecting';
};
