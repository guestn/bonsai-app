import { render, screen } from '@testing-library/react';
import { State } from 'wagmi';
import { env } from '@/utils/env';
import { WalletConnectModalProvider } from '../walletconnect-context';

jest.mock('@/utils/env', () => ({
  env: {
    VITE_PUBLIC_PARTICLE_PROJECT_ID: 'test-project-id',
    VITE_PUBLIC_PARTICLE_CLIENT_KEY: 'test-client-key',
    VITE_PUBLIC_PARTICLE_APP_ID: 'test-app-id',
  },
}));

jest.mock('../config', () => ({
  projectId: 'test-project-id',
  wagmiAdapter: {
    wagmiConfig: {},
  },
}));

jest.mock('@particle-network/auth-core-modal', () => ({
  AuthCoreContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Theme: {
    light: 'light',
  },
}));

jest.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  State: {
    status: 'connected',
    chainId: 1,
    connections: {},
    current: undefined,
  },
}));

jest.mock('@reown/appkit/react', () => ({
  createAppKit: () => ({
    adapters: [],
    networks: [],
    defaultNetwork: {},
    metadata: {},
    projectId: 'test-project-id',
    features: {},
    featuredWalletIds: [],
    themeMode: 'light',
    themeVariables: {},
  }),
}));

jest.mock('@reown/appkit/networks', () => ({
  mainnet: {},
  holesky: {},
}));

describe('WalletConnectModalProvider', () => {
  const mockChildren = <div>Test Children</div>;
  let originalEnv: typeof env;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = { ...env };
  });

  afterEach(() => {
    Object.assign(env, originalEnv);
  });

  it('renders children when environment variables are set', () => {
    render(
      <WalletConnectModalProvider>{mockChildren}</WalletConnectModalProvider>,
    );

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('throws error when project ID is missing', () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    env.VITE_PUBLIC_PARTICLE_PROJECT_ID = undefined;

    expect(() =>
      render(
        <WalletConnectModalProvider>{mockChildren}</WalletConnectModalProvider>,
      ),
    ).toThrow('Particle environment variables are not correctly defined');
  });

  it('throws error when client key is missing', () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    env.VITE_PUBLIC_PARTICLE_CLIENT_KEY = undefined;

    expect(() =>
      render(
        <WalletConnectModalProvider>{mockChildren}</WalletConnectModalProvider>,
      ),
    ).toThrow('Particle environment variables are not correctly defined');
  });

  it('throws error when app ID is missing', () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    env.VITE_PUBLIC_PARTICLE_APP_ID = undefined;

    expect(() =>
      render(
        <WalletConnectModalProvider>{mockChildren}</WalletConnectModalProvider>,
      ),
    ).toThrow('Particle environment variables are not correctly defined');
  });

  it('accepts and uses initialState prop', () => {
    const mockInitialState = {
      status: 'connected',
      chainId: 1,
    } as State;

    render(
      <WalletConnectModalProvider initialState={mockInitialState}>
        {mockChildren}
      </WalletConnectModalProvider>,
    );

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('renders with default theme mode', () => {
    render(
      <WalletConnectModalProvider>{mockChildren}</WalletConnectModalProvider>,
    );

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });
});
