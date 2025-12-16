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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ALLOWED_EMAIL = env.VITE_AUTHORIZED_EMAIL;

  const isAuthorized = user?.email === ALLOWED_EMAIL;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        // Set persistence to LOCAL to help with mobile browsers
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.warn('Could not set auth persistence:', error);
      }

      // Check for redirect result (after redirect from OAuth provider)
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.info('Sign-in successful via redirect');
        }
      } catch (error: any) {
        if (error.code !== 'auth/no-auth-event') {
          console.error('Error getting redirect result:', error);
        }
      }

      // Set up auth state listener
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
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
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    // Try popup first (works better on modern mobile browsers)
    try {
      await signInWithPopup(auth, provider);
    } catch (popupError: any) {
      // If popup was blocked or failed, try redirect on mobile
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      ) {
        if (isMobileDevice()) {
          await setPersistence(auth, browserLocalPersistence);
          await signInWithRedirect(auth, provider);
          return;
        }
      }
      throw popupError;
    }
  };

  const signInWithGoogleRedirect = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    isAuthorized,
    signInWithGoogle,
    signInWithGoogleRedirect,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
