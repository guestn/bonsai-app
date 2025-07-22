import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  I18nProvider,
  resolvedLocale,
  ToastProvider,
} from '@pufferfinance/puffer-ui-components';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import { Web3Provider } from './context/web3-context/web3-context';
import { WalletConnectModalProvider } from './context/walletconnect-context/walletconnect-context';
import { SWRProvider } from './context/swr-provider/swr-provider';

import '@pufferfinance/puffer-ui-components/styles/globals.scss';
import './styles/globals.scss';
import './i18n/i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SWRProvider>
          <I18nProvider locale={resolvedLocale}>
            <ToastProvider>
              <WalletConnectModalProvider>
                <Web3Provider>
                  <App />
                </Web3Provider>
              </WalletConnectModalProvider>
            </ToastProvider>
          </I18nProvider>
        </SWRProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
