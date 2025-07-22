import {
  RenderOptions,
  RenderResult,
  render,
  waitFor,
} from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SWRProvider } from '@/context/swr-provider/swr-provider';

export interface TestWrapperProps {
  children?: ReactNode;
}

export const TestWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <SWRProvider>
    <BrowserRouter>{children}</BrowserRouter>
  </SWRProvider>
);

/*
 * Wraps react testing library render function with TestWrapper
 */
export const wrappedRender = async (
  jsx: ReactElement,
  options: RenderOptions = {},
): Promise<RenderResult> => {
  let renderData: RenderResult;

  await waitFor(() => {
    renderData = render(jsx, {
      wrapper: TestWrapper,
      ...options,
    });
    return Promise.resolve();
  });

  return renderData!;
};
