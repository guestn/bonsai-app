import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { App } from './app';
import { SWRProvider } from './context/swr-provider/swr-provider';
import i18n from './i18n/i18n';

// Import dev tools for development
import './utils/dev-tools';

import './styles/globals.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SWRProvider>
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </SWRProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
