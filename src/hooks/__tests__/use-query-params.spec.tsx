import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useQueryParams } from '../use-query-params';

describe('useQueryParams', () => {
  it('should return the initial params', () => {
    const { result } = renderHook(() => useQueryParams<{ test: string }>(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/test?test=hello']}>
          {children}
        </MemoryRouter>
      ),
    });

    expect(result.current.searchParams.get('test')).toEqual('hello');
  });

  it('should set the params', async () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/test?test=hello']}>
          {children}
        </MemoryRouter>
      ),
    });

    await waitFor(() => {
      expect(result.current.searchParams.get('test')).toEqual('hello');
      result.current.setSearchParams({ test: 'world', test2: 'world2' });
      expect(result.current.searchParams.get('test')).toEqual('world');
      expect(result.current.searchParams.get('test2')).toEqual('world2');
    });
  });

  it('should delete the param if the value is undefined', async () => {
    const { result } = renderHook(() => useQueryParams(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/test?test=hello']}>
          {children}
        </MemoryRouter>
      ),
    });

    await waitFor(() => {
      expect(result.current.searchParams.get('test')).toEqual('hello');
      result.current.setSearchParams({ test: undefined });
      expect(result.current.searchParams.get('test')).toEqual(null);
    });
  });
});
