import { renderHook, act } from '@testing-library/react';
import { useToastContext } from '@pufferfinance/puffer-ui-components';
import { useCopyToClipboard } from '../use-copy-to-clipboard';

jest.mock('@pufferfinance/puffer-ui-components', () => ({
  useToastContext: jest.fn(),
  MessageBannerVariant: {
    Warning: 'warning',
    Info: 'info',
    Error: 'error',
  },
}));

describe('useCopyToClipboard', () => {
  const mockAddToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToastContext as jest.Mock).mockReturnValue({ add: mockAddToast });
  });

  it('copies text successfully when clipboard is available', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      const success = await result.current.copy('test text');
      expect(success).toBe(true);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result.current.copiedText).toBe('test text');
    expect(mockAddToast).toHaveBeenCalledWith(
      { label: 'COPY_CLIPBOARD.SUCCESS', variant: 'info' },
      { timeout: 3000 },
    );
  });

  it('handles clipboard API not being available', async () => {
    Object.assign(navigator, {
      clipboard: undefined,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      const success = await result.current.copy('test text');
      expect(success).toBe(false);
    });

    expect(result.current.copiedText).toBeNull();
    expect(mockAddToast).toHaveBeenCalledWith(
      { label: 'COPY_CLIPBOARD.WARNING', variant: 'warning' },
      { timeout: 3000 },
    );
  });

  it('handles clipboard write failure', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockRejectedValue(new Error('Write failed')),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      const success = await result.current.copy('test text');
      expect(success).toBe(false);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result.current.copiedText).toBeNull();
    expect(mockAddToast).toHaveBeenCalledWith(
      { label: 'COPY_CLIPBOARD.ERROR', variant: 'error' },
      { timeout: 3000 },
    );
  });
});
