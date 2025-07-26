import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-provider';

// Mock Firebase auth
jest.mock('../../../utils/firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>;

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={signInWithGoogle} data-testid="signin">
        Sign In
      </button>
      <button onClick={logout} data-testid="logout">
        Logout
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides loading state initially', () => {
    mockOnAuthStateChanged.mockImplementation(() => {
      // Don't call callback immediately to test loading state
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('provides user state when authenticated', async () => {
    const mockUser = { email: 'test@example.com' } as User;

    mockOnAuthStateChanged.mockImplementation((_auth, nextOrObserver) => {
      if (typeof nextOrObserver === 'function') {
        nextOrObserver(mockUser);
      }
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });

  it('provides null user state when not authenticated', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, nextOrObserver) => {
      if (typeof nextOrObserver === 'function') {
        nextOrObserver(null);
      }
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  it('calls signInWithPopup when signInWithGoogle is called', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, nextOrObserver) => {
      if (typeof nextOrObserver === 'function') {
        nextOrObserver(null);
      }
      return () => {};
    });

    mockSignInWithPopup.mockResolvedValue({} as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    screen.getByTestId('signin').click();

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled();
    });
  });

  it('calls signOut when logout is called', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, nextOrObserver) => {
      if (typeof nextOrObserver === 'function') {
        nextOrObserver(null);
      }
      return () => {};
    });

    mockSignOut.mockResolvedValue();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    screen.getByTestId('logout').click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
