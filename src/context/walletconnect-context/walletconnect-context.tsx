import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { State, WagmiProvider } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { holesky, mainnet } from '@reown/appkit/networks';
import {
  AuthCoreContextProvider,
  AuthCoreModalOptions,
  Theme,
} from '@particle-network/auth-core-modal';
import { env } from '@/utils/env';
import { wagmiAdapter, projectId } from './config';

const queryClient = new QueryClient();

if (!projectId) throw new Error('Project ID is not defined');

const metadata = {
  name: 'Puffer App',
  description: 'Puffer App',
  url: 'https://app.puffer.fi',
  icons: [],
};

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, holesky],
  defaultNetwork: mainnet,
  metadata,
  projectId,
  features: {
    analytics: true,
    onramp: true,
    socials: false,
    email: false,
  },
  featuredWalletIds: [
    'e7c4d26541a7fd84dbdfa9922d3ad21e936e13a7a0e44385d44f006139e44d3b', // WalletConnect
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
    '1aedbcfc1f31aade56ca34c38b0a1607b41cccfa3de93c946ef3b4ba2dfab11c', // OneKey
  ],
  themeMode: 'light',
  themeVariables: {
    '--w3m-color-mix': 'var(--bg)',
    '--w3m-color-mix-strength': 40,
    '--w3m-font-family': 'Inter',
    '--w3m-border-radius-master': '2px',
  },
});

const authCoreOptions: AuthCoreModalOptions = {
  projectId: env.VITE_PUBLIC_PARTICLE_PROJECT_ID as string,
  clientKey: env.VITE_PUBLIC_PARTICLE_CLIENT_KEY as string,
  appId: env.VITE_PUBLIC_PARTICLE_APP_ID as string,
  themeType: 'light' as Theme,
  authTypes: [
    'email',
    'google',
    'apple',
    'facebook',
    'twitter',
    'discord',
    'github',
    'twitch',
    'linkedin',
  ] as AuthCoreModalOptions['authTypes'],
  web3Modal: appKit,
  customStyle: {
    fontFamily: 'Inter',
  },
  wallet: {
    visible: false,
  },
};

/* WagmiProvider is wrapped in Particle AuthCoreContextProvider to allow Particle Wallet functionality */
export const WalletConnectModalProvider = ({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) => {
  if (
    !env.VITE_PUBLIC_PARTICLE_PROJECT_ID ||
    !env.VITE_PUBLIC_PARTICLE_CLIENT_KEY ||
    !env.VITE_PUBLIC_PARTICLE_APP_ID
  ) {
    throw new Error('Particle environment variables are not correctly defined');
  }

  return (
    <AuthCoreContextProvider options={authCoreOptions}>
      <WagmiProvider
        config={wagmiAdapter.wagmiConfig}
        initialState={initialState}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </AuthCoreContextProvider>
  );
};
