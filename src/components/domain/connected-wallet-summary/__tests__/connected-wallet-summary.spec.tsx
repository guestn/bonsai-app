import { screen, fireEvent, waitFor } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { wrappedRender } from '@/test/render-utils';
import { ConnectedWalletSummary } from '../connected-wallet-summary';

jest.mock('wagmi', () => ({
  __esModule: true,
  ...jest.requireActual('wagmi'),
  useAccount: jest.fn(),
  useDisconnect: jest.fn(),
  useEnsName: jest.fn(),
  useEnsAvatar: jest.fn(),
  useChainId: jest.fn(),
}));

describe('ConnectedWalletSummary', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const mockDisconnect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(wagmi.useAccount).mockReturnValue({
      address: mockAddress,
      isConnected: true,
    } as any);

    jest.mocked(wagmi.useDisconnect).mockReturnValue({
      disconnectAsync: mockDisconnect,
    } as any);

    jest.mocked(wagmi.useChainId).mockReturnValue(1);
  });

  it('renders truncated connected wallet address', async () => {
    await wrappedRender(<ConnectedWalletSummary />);

    expect(screen.getByText('0x12...7890')).toBeInTheDocument();
  });

  it('renders emoji', async () => {
    await wrappedRender(<ConnectedWalletSummary />);

    expect(screen.getByText('🐠'));
  });

  it('handles disconnect click', async () => {
    await wrappedRender(<ConnectedWalletSummary />);

    await waitFor(() => {
      const disconnectButton = screen.getByRole('button', {
        name: /disconnect/i,
      });
      fireEvent.click(disconnectButton);

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  it('handles linking to etherscan page', async () => {
    const ETHERSCAN_LINK_URL = `https://etherscan.io/address/${mockAddress}`;

    await wrappedRender(<ConnectedWalletSummary />);

    const etherscanLink = screen.getByRole('link', { name: '0x12...7890' });
    expect(etherscanLink).toHaveAttribute('href', ETHERSCAN_LINK_URL);
  });
});
