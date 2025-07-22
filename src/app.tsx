import { FC } from 'react';
import ReactGA from 'react-ga4';
import { Route, Routes } from 'react-router-dom';
import { env } from './utils/env';

// Pages
import { HomePage } from './pages/home-page/home-page';
import { BonsaiDetailPage } from './pages/bonsai-detail-page/bonsai-detail-page';

// Initialize Google Analytics
if (env.VITE_GOOGLE_ANALYTICS_ID) {
  ReactGA.initialize(env.VITE_GOOGLE_ANALYTICS_ID);
}

export const App: FC = () => {
  return (
    <>
      <header>Header</header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:id" element={<BonsaiDetailPage />} />
        </Routes>
      </main>
      <footer>Footer</footer>
    </>
  );
};
