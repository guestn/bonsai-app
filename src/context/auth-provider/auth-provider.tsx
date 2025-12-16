import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  getRedirectResult,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { auth } from '../../utils/firebase';
import { env } from '../../utils/env';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Debug logger for mobile - shows logs on screen
const debugLogs: string[] = [];
const debugLog = (message: string) => {
  console.info(message);
  debugLogs.push(`${new Date().toISOString().slice(11, 19)} ${message}`);
  // Keep only last 20 logs
  if (debugLogs.length > 20) debugLogs.shift();
  // Update debug panel if it exists
  const panel = document.getElementById('auth-debug-panel');
  if (panel) {
    panel.innerText = debugLogs.join('\n');
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  const ALLOWED_EMAIL = env.VITE_AUTHORIZED_EMAIL;

  const isAuthorized = user?.email === ALLOWED_EMAIL;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        // Set persistence to LOCAL to help with mobile browsers
        await setPersistence(auth, browserLocalPersistence);
        debugLog('Auth persistence set to LOCAL');
      } catch (error) {
        debugLog(`Could not set auth persistence: ${error}`);
      }

      // Check for redirect result FIRST (after redirect from OAuth provider)
      try {
        debugLog('Checking for redirect result...');
        debugLog(`Current URL: ${window.location.href}`);

        const result = await getRedirectResult(auth);

        if (result) {
          debugLog('=== REDIRECT SIGN-IN SUCCESSFUL ===');
          debugLog(`User: ${result.user.email}`);
          debugLog(`Provider: ${result.providerId}`);
          // The onAuthStateChanged listener will update the user state
        } else {
          debugLog('No redirect result (normal if not coming from redirect)');
        }
      } catch (error: any) {
        // Only log errors that aren't "no redirect result" (which is normal)
        if (error.code !== 'auth/no-auth-event') {
          debugLog(`Error getting redirect result: ${error.code}`);
          debugLog(`Error message: ${error.message}`);

          const errorCode = error.code;
          const errorMessage = error.message || '';

          // Handle redirect URI mismatch error
          if (
            errorCode === 'auth/redirect-uri-mismatch' ||
            errorMessage.includes('redirect_uri_mismatch') ||
            errorMessage.includes('redirect_uri')
          ) {
            console.error(
              '=== REDIRECT URI MISMATCH ERROR (after redirect) ===',
            );
            console.error(
              'The redirect URI used by Firebase does not match what is configured in Google Cloud Console.',
            );
            console.error('Current URL:', window.location.href);
            console.error('Current origin:', window.location.origin);
            console.error('Auth domain:', auth.app.options.authDomain);
            console.error('To fix this:');
            console.error(
              '1. Go to Google Cloud Console > APIs & Services > Credentials',
            );
            console.error(
              '2. Find your OAuth 2.0 Client ID (used by Firebase)',
            );
            console.error('3. Add the following authorized redirect URIs:');
            console.error(`   - ${window.location.origin}/__/auth/handler`);
            console.error(
              `   - https://${auth.app.options.authDomain}/__/auth/handler`,
            );
            console.error(
              '4. Also check Firebase Console > Authentication > Settings > Authorized domains',
            );
            console.error('   and ensure your domain is listed there.');
            console.error('=== END ERROR INFO ===');
          }
        }
      }

      // Set up auth state listener AFTER checking redirect result
      unsubscribe = onAuthStateChanged(auth, (user) => {
        debugLog(`Auth state changed: ${user ? user.email : 'null'}`);
        setUser(user);
        setLoading(false);

        if (!user) {
          debugLog('User signed out or deleted');
        }
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Detect if user is on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  };

  const signInWithGoogle = async () => {
    setShowDebug(true); // Show debug panel on sign-in attempt
    try {
      const provider = new GoogleAuthProvider();

      // Use redirect on mobile devices, popup on desktop
      if (isMobileDevice()) {
        debugLog('=== MOBILE SIGN-IN INITIATED ===');
        debugLog(`User agent: ${navigator.userAgent.slice(0, 50)}...`);
        debugLog(`Current URL: ${window.location.href}`);
        debugLog(`Origin: ${window.location.origin}`);
        debugLog(`Auth domain: ${auth.app.options.authDomain}`);

        // Ensure persistence is set before redirect
        try {
          await setPersistence(auth, browserLocalPersistence);
          debugLog('Persistence set to LOCAL');
        } catch (e) {
          debugLog(`Could not set persistence: ${e}`);
        }

        // Add custom parameters
        provider.setCustomParameters({
          prompt: 'select_account',
        });

        debugLog('Initiating redirect to Google...');
        await signInWithRedirect(auth, provider);
        return; // Redirect will navigate away, so we return here
      }

      debugLog('Desktop: using popup sign-in...');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      console.error('Error code:', (error as any)?.code);
      console.error('Error message:', (error as any)?.message);

      // Provide specific guidance based on error code
      const errorCode = (error as any)?.code;
      const errorMessage = (error as any)?.message || '';

      if (errorCode === 'auth/internal-error') {
        console.error(
          'This usually means Google Authentication is not enabled in Firebase Console.',
        );
        console.error(
          'Please enable Google Authentication in Firebase Console > Authentication > Sign-in method',
        );
      } else if (errorCode === 'auth/unauthorized-domain') {
        console.error(
          'This domain is not authorized. Add the domain to authorized domains in Firebase Console.',
        );
        console.error('Current domain:', window.location.hostname);
      } else if (
        errorCode === 'auth/redirect-uri-mismatch' ||
        errorMessage.includes('redirect_uri_mismatch') ||
        errorMessage.includes('redirect_uri')
      ) {
        console.error('=== REDIRECT URI MISMATCH ERROR ===');
        console.error(
          'The redirect URI used by Firebase does not match what is configured in Google Cloud Console.',
        );
        console.error('Current URL:', window.location.href);
        console.error('Current origin:', window.location.origin);
        console.error('Auth domain:', auth.app.options.authDomain);
        console.error('To fix this:');
        console.error(
          '1. Go to Google Cloud Console > APIs & Services > Credentials',
        );
        console.error('2. Find your OAuth 2.0 Client ID (used by Firebase)');
        console.error('3. Add the following authorized redirect URIs:');
        console.error(`   - ${window.location.origin}/__/auth/handler`);
        console.error(
          `   - https://${auth.app.options.authDomain}/__/auth/handler`,
        );
        console.error(
          '4. Also check Firebase Console > Authentication > Settings > Authorized domains',
        );
        console.error('   and ensure your domain is listed there.');
        console.error('=== END ERROR INFO ===');
      } else if (errorCode === 'auth/popup-closed-by-user') {
        console.error('User closed the popup before completing sign-in.');
      } else if (errorCode === 'auth/popup-blocked') {
        // If popup is blocked, fall back to redirect
        console.warn('Popup blocked, falling back to redirect flow...');
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
        return;
      }

      console.error('Full error object:', error);
      throw error;
    }
  };

  const signInWithGoogleRedirect = async () => {
    try {
      const provider = new GoogleAuthProvider();
      console.info('Attempting Google sign-in with redirect...');
      console.info('Current URL:', window.location.href);
      console.info('Current origin:', window.location.origin);
      console.info('Auth domain:', auth.app.options.authDomain);

      // Add custom parameters to help with redirect URI configuration
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      await signInWithRedirect(auth, provider);
    } catch (error) {
      const errorCode = (error as any)?.code;
      const errorMessage = (error as any)?.message || '';

      console.error('Error signing in with Google redirect:', error);

      if (
        errorCode === 'auth/redirect-uri-mismatch' ||
        errorMessage.includes('redirect_uri_mismatch') ||
        errorMessage.includes('redirect_uri')
      ) {
        console.error('=== REDIRECT URI MISMATCH ERROR ===');
        console.error(
          'The redirect URI used by Firebase does not match what is configured in Google Cloud Console.',
        );
        console.error('Current URL:', window.location.href);
        console.error('Current origin:', window.location.origin);
        console.error('Auth domain:', auth.app.options.authDomain);
        console.error('To fix this:');
        console.error(
          '1. Go to Google Cloud Console > APIs & Services > Credentials',
        );
        console.error('2. Find your OAuth 2.0 Client ID (used by Firebase)');
        console.error('3. Add the following authorized redirect URIs:');
        console.error(`   - ${window.location.origin}/__/auth/handler`);
        console.error(
          `   - https://${auth.app.options.authDomain}/__/auth/handler`,
        );
        console.error(
          '4. Also check Firebase Console > Authentication > Settings > Authorized domains',
        );
        console.error('   and ensure your domain is listed there.');
        console.error('=== END ERROR INFO ===');
      }

      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthorized,
    signInWithGoogle,
    signInWithGoogleRedirect,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Debug panel for mobile - tap to toggle */}
      {showDebug && (
        <div
          id="auth-debug-panel"
          onClick={() => setShowDebug(false)}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '40vh',
            overflow: 'auto',
            background: 'rgba(0,0,0,0.9)',
            color: '#0f0',
            padding: '8px',
            fontSize: '10px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            zIndex: 9999,
          }}
        >
          {debugLogs.join('\n') || 'Debug logs will appear here...'}
          {'\n\n(tap to close)'}
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
