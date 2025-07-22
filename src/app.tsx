import { FC } from 'react';
import ReactGA from 'react-ga4';
import { Route, Routes } from 'react-router-dom';
import { env } from './utils/env';

// Pages
import { HomePage, BonsaiDetailPage } from './pages';

// Components
import { Header, Footer } from './components/ui';

// Initialize Google Analytics
if (env.VITE_GOOGLE_ANALYTICS_ID) {
  ReactGA.initialize(env.VITE_GOOGLE_ANALYTICS_ID);
}

export const App: FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:id" element={<BonsaiDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
