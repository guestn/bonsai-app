import { screen, fireEvent } from '@testing-library/react';
import { useMediaQuery } from '@pufferfinance/puffer-ui-components';
import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { useWeb3 } from '@/context/web3-context/web3-context';
import { wrappedRender } from '@/test/render-utils';
import { HeaderWalletContainer } from '../header-wallet-container';

jest.mock('@/context/web3-context/web3-context');
jest.mock('@reown/appkit/react', () => ({
  useAppKitState: jest.fn(() => ({
    open: false,
  })),
  useAppKit: jest.fn(() => ({
    open: jest.fn(() => Promise.resolve()),
  })),
  createAppKit: jest.fn(() => ({})),
}));
jest.mock('@pufferfinance/puffer-ui-components', () => ({
  ...jest.requireActual('@pufferfinance/puffer-ui-components'),
  useMediaQuery: jest.fn(),
  ChainIcon: () => <div data-testid="chain-icon" />,
  CaretDownIcon: () => (
    <div data-testid="caret-down-icon" aria-label="Caret pointing down" />
  ),
  CaretUpIcon: () => (
    <div data-testid="caret-up-icon" aria-label="Caret pointing up" />
  ),
}));

describe('HeaderWalletContainer', () => {
  const mockOpenConnectModal = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock AppKit
    (useAppKitState as jest.Mock).mockReturnValue({
      open: false,
    });
    (useAppKit as jest.Mock).mockReturnValue({
      open: mockOpenConnectModal,
    });

    jest.mocked(useMediaQuery).mockReturnValue(false);
    jest.mocked(useWeb3).mockReturnValue({
      isConnected: false,
      chain: null,
      address: '',
      connector: {
        name: 'MetaMask',
      },
    } as any);
  });

  it('renders connect wallet button when not connected', async () => {
    await wrappedRender(<HeaderWalletContainer />);

    expect(
      screen.getByRole('button', { name: 'CONNECT_WALLET.TITLE' }),
    ).toBeInTheDocument();
  });

  it('shows chain info when connected', async () => {
    jest.mocked(useWeb3).mockReturnValue({
      isConnected: true,
      chain: {
        id: 1,
        name: 'Ethereum',
      },
      address: '0x1234567890123456789012345678901234567890',
      connector: {
        name: 'MetaMask',
      },
    } as any);

    await wrappedRender(<HeaderWalletContainer />);

    expect(screen.getByTestId('chain-icon')).toBeInTheDocument();
  });

  it('hides chain name on mobile for mainnet', async () => {
    jest.mocked(useMediaQuery).mockReturnValue(true);
    jest.mocked(useWeb3).mockReturnValue({
      isConnected: true,
      chain: {
        id: 1,
        name: 'Ethereum',
      },
      address: '0x1234567890123456789012345678901234567890',
      connector: {
        name: 'MetaMask',
      },
    } as any);

    await wrappedRender(<HeaderWalletContainer />);

    expect(screen.getByTestId('chain-icon')).toBeInTheDocument();
    expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
  });

  it('toggles wallet popover on button click when connected', async () => {
    jest.mocked(useWeb3).mockReturnValue({
      isConnected: true,
      chain: {
        id: 1,
        name: 'Ethereum',
      },
      address: '0x1234567890123456789012345678901234567890',
      connector: {
        name: 'MetaMask',
      },
    } as any);

    await wrappedRender(<HeaderWalletContainer />);

    const button = screen.getByRole('button', { name: /🐠 0x12...7890/i });
    fireEvent.click(button);

    expect(screen.getByTestId('caret-up-icon')).toBeInTheDocument();

    // Click again to close
    fireEvent.click(button);
    expect(screen.getByTestId('caret-down-icon')).toBeInTheDocument();
  });

  it('does not show popover when disconnected', async () => {
    await wrappedRender(<HeaderWalletContainer />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows caret icons based on popover state', async () => {
    jest.mocked(useWeb3).mockReturnValue({
      isConnected: true,
      chain: {
        id: 1,
        name: 'Ethereum',
      },
      address: '0x1234567890123456789012345678901234567890',
      connector: {
        name: 'MetaMask',
      },
    } as any);

    await wrappedRender(<HeaderWalletContainer />);

    // Initially shows CaretDown
    expect(screen.getByTestId('caret-down-icon')).toBeInTheDocument();

    // Click to open popover
    const button = screen.getByRole('button', { name: /🐠 0x12...7890/i });
    fireEvent.click(button);

    // Shows CaretUp when open
    expect(screen.getByTestId('caret-up-icon')).toBeInTheDocument();
  });
});
