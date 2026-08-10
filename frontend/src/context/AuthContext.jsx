import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
  saveSession,
  clearSession,
  isAdmin as checkIsAdmin,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [initializing, setInitializing] = useState(Boolean(getStoredToken()));

  // On first load, re-validate any stored token against the API so the
  // dashboard never renders for an expired/revoked session.
  useEffect(() => {
    if (!getStoredToken()) {
      setInitializing(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      try {
        const current = await getCurrentUser();
        if (cancelled) return;
        setUser(current);
        setToken(getStoredToken());
        saveSession({ user: current });
      } catch {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const session = await apiLogin({ email, password });
    setUser(session.user);
    setToken(session.access_token);
    return session;
  }, []);

  const register = useCallback(async (payload) => {
    const session = await apiRegister(payload);
    setUser(session.user);
    setToken(session.access_token);
    return session;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      isAdmin: checkIsAdmin(user),
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
