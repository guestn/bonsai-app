import { screen, fireEvent } from '@testing-library/react';
import { useMediaQuery } from '@pufferfinance/puffer-ui-components';
import { useAppKit, useAppKitState } from '@reown/appkit/react';
import { useWeb3 } from '@/context/web3-context/web3-context';
import { wrappedRender } from '@/test/render-utils';
import { ConnectWalletButton } from '../connect-wallet-button';

jest.mock('@reown/appkit/react');
jest.mock('@pufferfinance/puffer-ui-components', () => ({
  ...jest.requireActual('@pufferfinance/puffer-ui-components'),
  useMediaQuery: jest.fn(),
}));
jest.mock('@/context/web3-context/web3-context');

describe('ConnectWalletButton', () => {
  const mockOpenConnectModal = jest.fn();
  const mockOnPressWhenConnected = jest.fn();
  const mockSetIsMenuOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useAppKit).mockReturnValue({
      open: mockOpenConnectModal,
    } as any);

    jest.mocked(useAppKitState).mockReturnValue({
      open: false,
    } as any);

    jest.mocked(useMediaQuery).mockReturnValue(false);

    jest.mocked(useWeb3).mockReturnValue({
      address: '',
      isConnected: false,
      isConnecting: false,
      connector: {
        name: 'MetaMask',
      },
    } as any);
  });

  it('renders connect button when not connected', async () => {
    await wrappedRender(<ConnectWalletButton />);

    const button = screen.getByRole('button', {
      name: 'CONNECT_WALLET.TITLE',
    });
    expect(button).toBeInTheDocument();
  });

  it('shows mobile text when on small screen', async () => {
    jest.mocked(useMediaQuery).mockReturnValue(true);

    await wrappedRender(<ConnectWalletButton />);

    const button = screen.getByRole('button', {
      name: 'CONNECT_WALLET.TITLE_MOBILE',
    });
    expect(button).toBeInTheDocument();
  });

  it('shows loading spinner when connecting', async () => {
    jest.mocked(useWeb3).mockReturnValue({
      isConnecting: true,
    } as any);
    jest.mocked(useAppKitState).mockReturnValue({
      open: true,
    } as any);

    await wrappedRender(<ConnectWalletButton />);

    expect(screen.getByTestId('spinner-small'));
  });

  it('shows truncated address when connected', async () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    jest.mocked(useWeb3).mockReturnValue({
      address: mockAddress,
      isConnected: true,
      isConnecting: false,
      connector: {
        name: 'MetaMask',
      },
    } as any);

    await wrappedRender(<ConnectWalletButton />);

    expect(screen.getByText(/0x12...7890/));
  });

  it('calls onPressWhenConnected when connected and clicked', async () => {
    jest.mocked(useWeb3).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      connector: {
        name: 'MetaMask',
      },
    } as any);

    await wrappedRender(
      <ConnectWalletButton onPressWhenConnected={mockOnPressWhenConnected} />,
    );

    const button = screen.getByRole('button', {
      name: /0x12...7890/i,
    });
    fireEvent.click(button);

    expect(mockOnPressWhenConnected).toHaveBeenCalled();
  });

  it('opens connect modal and closes menu when clicked', async () => {
    await wrappedRender(
      <ConnectWalletButton setIsMenuOpen={mockSetIsMenuOpen} />,
    );

    const button = screen.getByRole('button', {
      name: 'CONNECT_WALLET.TITLE',
    });
    fireEvent.click(button);

    expect(mockOpenConnectModal).toHaveBeenCalledWith({ view: 'Connect' });
    expect(mockSetIsMenuOpen).toHaveBeenCalledWith(false);
  });

  it('renders custom label when provided', async () => {
    const customLabel = 'Custom Connect Label';
    await wrappedRender(<ConnectWalletButton label={customLabel} />);

    expect(screen.getByText(customLabel));
  });

  it('renders icon when provided', async () => {
    jest.mocked(useWeb3).mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      connector: {
        name: 'MetaMask',
      },
    } as any);

    const mockIcon = <span data-testid="custom-icon">🌟</span>;
    await wrappedRender(<ConnectWalletButton Icon={mockIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
