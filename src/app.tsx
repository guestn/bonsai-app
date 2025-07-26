import { FC } from 'react';
import ReactGA from 'react-ga4';
import { Route, Routes } from 'react-router-dom';
import { env } from './utils/env';

// Pages
import { HomePage, BonsaiDetailPage } from './pages';

// Components
import { Header, Footer } from './components/ui';
import { NotAuthorized } from './components/ui/auth';

// Context
import { AuthProvider, useAuth } from './context/auth-provider';

// Initialize Google Analytics
if (env.VITE_GOOGLE_ANALYTICS_ID) {
  ReactGA.initialize(env.VITE_GOOGLE_ANALYTICS_ID);
}

const AppContent: FC = () => {
  const { user, loading, isAuthorized } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  // If user is not authorized, show the not authorized screen
  if (user && !isAuthorized) {
    return <NotAuthorized />;
  }

  // If no user, show login screen (Header will show login buttons)
  if (!user) {
    return (
      <div className="app">
        <Header />
        <main className="main-content">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
            }}
          >
            <p>Please sign in to access the application.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Authorized user - show full app
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

export const App: FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
