import useSWR from 'swr';
import { render, screen, waitFor } from '@testing-library/react';
import { FC } from 'react';
import { SWRProvider } from '../swr-provider';

describe('SWRProvider', () => {
  it('should return configured fallback value', () => {
    const mockValue = 'testValue';

    const TestComponent: FC = () => {
      const { data } = useSWR('/test');
      return data;
    };

    render(
      <SWRProvider fallback={{ '/test': mockValue }}>
        <TestComponent />
      </SWRProvider>,
    );

    expect(screen.getByText(mockValue)).toBeTruthy();
  });

  it('should use the passed fetcher', async () => {
    const fetcher = jest.fn((endpoint) => Promise.resolve(endpoint));
    const mockEndpoint = '/test';

    const TestComponent: FC = () => {
      const { data } = useSWR(mockEndpoint);
      return data;
    };

    render(
      <SWRProvider fetcher={fetcher}>
        <TestComponent />
      </SWRProvider>,
    );

    await waitFor(() => expect(fetcher).toHaveBeenCalledWith(mockEndpoint));
  });
});
