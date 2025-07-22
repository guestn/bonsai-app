import * as wagmi from 'wagmi';
import {
  RenderOptions,
  RenderResult,
  render,
  waitFor,
} from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@pufferfinance/puffer-ui-components';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider, createConfig } from 'wagmi';
import { mainnet } from '@reown/appkit/networks';
import { SWRProvider } from '@/context/swr-provider/swr-provider';
import { MOCK_WEB3_CONTEXT } from './mocks';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  __esModule: true,
  ...jest.requireActual('wagmi'),
  useAccount: () => MOCK_WEB3_CONTEXT(),
}));

export interface TestWrapperProps {
  children?: ReactNode;
  web3ContextOverrides?: Partial<wagmi.UseAccountReturnType<wagmi.Config>>;
}

const createWagmiConfig = () =>
  createConfig({
    chains: [mainnet],
    transports: {
      [mainnet.id]: () => ({
        request: jest.fn().mockResolvedValue({}),
        config: { name: 'test', key: 'test', request: jest.fn(), type: 'test' },
      }),
    },
  });

export const TestWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <QueryClientProvider client={new QueryClient()}>
    <WagmiProvider config={createWagmiConfig()}>
      <SWRProvider>
        <ToastProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ToastProvider>
      </SWRProvider>
    </WagmiProvider>
  </QueryClientProvider>
);

/*
 * Wraps react testing library render function with TestWrapper
 */
export const wrappedRender = async (
  jsx: ReactElement,
  wrapperProps: TestWrapperProps = {},
  options: RenderOptions = {},
): Promise<RenderResult> => {
  let renderData: RenderResult;

  if (wrapperProps.web3ContextOverrides) {
    jest.spyOn(wagmi, 'useAccount').mockReturnValue({
      ...(MOCK_WEB3_CONTEXT(wrapperProps.web3ContextOverrides) as any),
    });
  }

  await waitFor(() => {
    renderData = render(jsx, {
      wrapper: TestWrapper,
      ...options,
    });
    return Promise.resolve();
  });

  return renderData!;
};
