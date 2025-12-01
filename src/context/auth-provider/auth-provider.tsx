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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // If user was deleted by Cloud Function, they'll be null here
      if (!user) {
        console.info('User signed out or deleted');
      }
    });

    // Check for redirect result (after redirect from OAuth provider)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.info('Sign-in successful via redirect');
          // onAuthStateChanged will update the user state
        }
      })
      .catch((error) => {
        // Only log errors that aren't "no redirect result" (which is normal)
        if (error.code !== 'auth/no-auth-event') {
          console.error('Error getting redirect result:', error);
        }
      });

    return () => unsubscribe();
  }, []);

  // Detect if user is on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();

      // Use redirect on mobile devices, popup on desktop
      if (isMobileDevice()) {
        console.info('Mobile device detected, using redirect flow...');
        await signInWithRedirect(auth, provider);
        return; // Redirect will navigate away, so we return here
      }

      console.info('Attempting Google sign-in with popup...');
      console.info('Firebase auth instance:', auth);
      console.info('Firebase config:', auth.app.options);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      console.error('Error code:', (error as any)?.code);
      console.error('Error message:', (error as any)?.message);

      // Provide specific guidance based on error code
      const errorCode = (error as any)?.code;
      if (errorCode === 'auth/internal-error') {
        console.error(
          'This usually means Google Authentication is not enabled in Firebase Console.',
        );
        console.error(
          'Please enable Google Authentication in Firebase Console > Authentication > Sign-in method',
        );
      } else if (errorCode === 'auth/unauthorized-domain') {
        console.error(
          'This domain is not authorized. Add localhost to authorized domains in Firebase Console.',
        );
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
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google redirect:', error);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
