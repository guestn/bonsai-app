import { http } from 'viem';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { holesky, mainnet } from '@reown/appkit/networks';
import { env } from '@/utils/env';

export const projectId = env.VITE_PUBLIC_WALLET_CONNECT_PROJECT_ID;
export const mainnetRpcUrl = env.VITE_PUBLIC_MAINNET_RPC_URL;

if (!projectId) throw new Error('Project ID is not defined');

export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, holesky],
  projectId,
  ssr: true,
  // Using this syntax to correctly fallback to the default RPC, If we
  // define `transports` as undefined, the default RPCs are not used.
  ...(mainnetRpcUrl
    ? {
        transports: { [mainnet.id]: http(mainnetRpcUrl), [holesky.id]: http() },
      }
    : {}),
});
