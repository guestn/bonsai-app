import { renderHook, waitFor, act } from '@testing-library/react';
import { useAccount, useChainId } from 'wagmi';
import axios from 'axios';
import { Chain } from '@pufferfinance/puffer-sdk';
import { SWRConfig } from 'swr';
import { useFetchIsSafeWallet, useFetchOnChainSafeTx } from '../use-safe-api';

const mockedAxios = axios as unknown as jest.Mock;

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useChainId: jest.fn(),
}));

jest.mock('axios');

// need to clear the cache after each test
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe('useFetchIsSafeWallet', () => {
  const mockAddress = '0x123' as `0x${string}`;

  beforeEach(() => {
    jest.clearAllMocks();
    (useAccount as jest.Mock).mockReturnValue({ address: mockAddress });
    (useChainId as jest.Mock).mockReturnValue(Chain.Holesky);
  });

  it('returns undefined if no address', async () => {
    (useAccount as jest.Mock).mockReturnValue({ address: undefined });

    const { result } = renderHook(() => useFetchIsSafeWallet());

    expect(result.current.isSafeWallet).toBeUndefined();
  });

  it('returns false for non-safe wallet', async () => {
    mockedAxios.mockResolvedValueOnce({
      data: { owners: [] },
      status: 200,
    });

    const { result } = renderHook(() => useFetchIsSafeWallet());

    await waitFor(() => {
      expect(result.current.isSafeWallet).toBe(false);
    });
  });

  it('returns true for safe wallet', async () => {
    mockedAxios.mockResolvedValueOnce({
      data: { owners: ['0x123', '0x456'] },
      status: 200,
    });

    const { result } = renderHook(() => useFetchIsSafeWallet(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSafeWallet).toBe(true);
    });
  });

  it('returns false on error', async () => {
    mockedAxios.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useFetchIsSafeWallet(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSafeWallet).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('uses correct URL for Holesky', async () => {
    (useChainId as jest.Mock).mockReturnValue(Chain.Holesky);
    mockedAxios.mockResolvedValueOnce({
      data: { data: { owners: [] } },
    });

    renderHook(() => useFetchIsSafeWallet(), { wrapper });

    await waitFor(() => {
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://gateway.holesky-safe.protofire.io/',
        }),
      );
    });
  });

  it('uses correct URL for Mainnet', async () => {
    (useChainId as jest.Mock).mockReturnValue(Chain.Mainnet);
    mockedAxios.mockResolvedValueOnce({
      data: { owners: [] },
    });

    renderHook(() => useFetchIsSafeWallet(), { wrapper });

    await waitFor(() => {
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://safe-transaction-mainnet.safe.global/api/',
        }),
      );
    });
  });
});

describe('useFetchOnChainSafeTx', () => {
  const mockSafeTx = '0xsafetx' as `0x${string}`;
  const mockTxHash = '0xtxhash' as `0x${string}`;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useChainId as jest.Mock).mockReturnValue(Chain.Holesky);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with transaction hash when available on Holesky', async () => {
    mockedAxios.mockResolvedValueOnce({
      status: 200,
      data: { txHash: mockTxHash },
    });

    const { result } = renderHook(() => useFetchOnChainSafeTx());

    const promise = result.current.fetchOnChainSafeTx(mockSafeTx);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await expect(promise).resolves.toBe(mockTxHash);
  });

  it('resolves with transaction hash when available on Mainnet', async () => {
    (useChainId as jest.Mock).mockReturnValue(Chain.Mainnet);
    mockedAxios.mockResolvedValueOnce({
      status: 200,
      data: { transactionHash: mockTxHash },
    });

    const { result } = renderHook(() => useFetchOnChainSafeTx());

    const promise = result.current.fetchOnChainSafeTx(mockSafeTx);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await expect(promise).resolves.toBe(mockTxHash);
  });

  it('rejects with 404 non-safe transactions', async () => {
    const mock404 = {
      response: { status: 404 },
    };
    mockedAxios.mockRejectedValueOnce(mock404);

    const { result } = renderHook(() => useFetchOnChainSafeTx());

    const promise = result.current.fetchOnChainSafeTx(mockSafeTx);

    await act(async () => {
      jest.advanceTimersByTime(1000);

      await expect(promise).rejects.toEqual(mock404);
    });
  });

  it('rejects on abort', async () => {
    const { result, unmount } = renderHook(() => useFetchOnChainSafeTx());

    const promise = result.current.fetchOnChainSafeTx(mockSafeTx);

    unmount(); // This should trigger abort

    await expect(promise).rejects.toThrow('Request cancelled');
  });

  it('cleans up interval on success', async () => {
    mockedAxios.mockResolvedValueOnce({
      status: 200,
      data: { txHash: mockTxHash },
    });

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { result } = renderHook(() => useFetchOnChainSafeTx());

    const promise = result.current.fetchOnChainSafeTx(mockSafeTx);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await promise;
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
