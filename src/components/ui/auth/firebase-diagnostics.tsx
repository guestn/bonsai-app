import { FC } from 'react';
import { auth } from '../../../utils/firebase';

export const FirebaseDiagnostics: FC = () => {
  const checkFirebaseConfig = () => {
    console.info('=== Firebase Configuration Diagnostics ===');

    // Check if auth is available
    console.info('Auth instance available:', !!auth);

    // Check Firebase app configuration
    if (auth?.app?.options) {
      const config = auth.app.options;
      console.info('Firebase config:', {
        apiKey: config.apiKey ? '✅ Set' : '❌ Missing',
        authDomain: config.authDomain ? '✅ Set' : '❌ Missing',
        projectId: config.projectId ? '✅ Set' : '❌ Missing',
        storageBucket: config.storageBucket ? '✅ Set' : '❌ Missing',
        messagingSenderId: config.messagingSenderId ? '✅ Set' : '❌ Missing',
        appId: config.appId ? '✅ Set' : '❌ Missing',
      });
    } else {
      console.error('❌ Firebase app configuration not found');
    }

    // Check environment variables
    console.info('Environment variables:', {
      VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY
        ? '✅ Set'
        : '❌ Missing',
      VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
        ? '✅ Set'
        : '❌ Missing',
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID
        ? '✅ Set'
        : '❌ Missing',
    });

    console.info('Current domain:', window.location.hostname);
    console.info('Current URL:', window.location.href);
    console.info('Firebase Auth Domain:', auth.app.options.authDomain);
    console.info('Port:', window.location.port);

    // Check if we're on the correct domain
    const currentDomain = window.location.hostname;
    const authDomain = auth.app.options.authDomain;
    console.info(
      'Domain match:',
      currentDomain === authDomain || authDomain?.includes(currentDomain),
    );

    console.info('=== End Diagnostics ===');
  };

  return (
    <div
      style={{
        padding: '10px',
        background: '#f5f5f5',
        margin: '10px 0',
        borderRadius: '4px',
      }}
    >
      <button
        onClick={checkFirebaseConfig}
        style={{
          padding: '8px 12px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Check Firebase Configuration
      </button>
      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
        Click to run diagnostics and check the browser console for results
      </p>
    </div>
  );
};
