import { renderHook } from '@testing-library/react';
import { useToastContext } from '@pufferfinance/puffer-ui-components';
import { useWeb3 } from '@/context/web3-context/web3-context';
import { useConnectWalletToast } from '../use-connect-wallet-toast';

jest.mock('@/context/web3-context/web3-context');
jest.mock('@pufferfinance/puffer-ui-components', () => ({
  ...jest.requireActual('@pufferfinance/puffer-ui-components'),
  useToastContext: jest.fn(),
}));

describe('useConnectWalletToast', () => {
  const mockAddToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useToastContext).mockReturnValue({
      add: mockAddToast,
    } as any);

    jest.mocked(useWeb3).mockReturnValue({
      isConnected: false,
      connector: null,
    } as any);
  });

  it('shows toast when wallet connects', async () => {
    // Initial render with disconnected state
    const { rerender } = renderHook(() => useConnectWalletToast());

    // Simulate connection
    jest.mocked(useWeb3).mockReturnValue({
      isConnected: true,
      connector: { name: 'MetaMask' },
    } as any);

    rerender();

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'CONNECT_WALLET.CONNECT_TOAST_MESSAGE',
      }),
      {
        timeout: 3000,
      },
    );
  });

  it('shows toast when disconnecting', () => {
    // Start connected
    jest.mocked(useWeb3).mockReturnValue({
      isConnected: true,
      connector: { name: 'MetaMask' },
    } as any);

    const { rerender } = renderHook(() => useConnectWalletToast());

    // Simulate disconnection
    jest.mocked(useWeb3).mockReturnValue({
      isConnected: false,
      connector: null,
    } as any);

    rerender();

    expect(mockAddToast).toHaveBeenCalled();
  });
});
