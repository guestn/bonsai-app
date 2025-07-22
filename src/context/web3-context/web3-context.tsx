import { createContext, useContext, ReactNode, FC, useMemo } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { Web3ContextProps } from './types';

const Web3Context = createContext<Web3ContextProps | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: FC<Web3ProviderProps> = ({ children }) => {
  const {
    address,
    addresses,
    chain,
    chainId,
    connector,
    isConnected,
    isConnecting,
    isDisconnected,
    isReconnecting,
    status,
  } = useAccount();
  const { disconnect, disconnectAsync } = useDisconnect();
  const value = useMemo(
    () => ({
      address,
      addresses,
      chain,
      chainId,
      connector,
      disconnect,
      disconnectAsync,
      isConnected,
      isConnecting,
      isDisconnected,
      isReconnecting,
      status,
    }),
    [
      address,
      addresses,
      chain,
      chainId,
      connector,
      disconnect,
      disconnectAsync,
      isConnected,
      isConnecting,
      isDisconnected,
      isReconnecting,
      status,
    ],
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);

  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Context.Provider');
  }

  return context;
};
