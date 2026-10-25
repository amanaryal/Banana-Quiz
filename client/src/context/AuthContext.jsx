/*
 * Purpose: Remembers who is logged in, and shares that with every page.
 * Theme: Virtual identity
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * On load we call GET /api/auth/me. The cookie is sent automatically.
 * If the cookie is missing or expired, the server returns 401 and user stays null.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const result = await api('/api/auth/me');

      if (!cancelled && result.ok) {
        setUser(result.data.user);
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // Called after a successful login. The cookie is already stored by the browser.
  function setLoggedInUser(nextUser) {
    setUser(nextUser);
  }

  // Used when a protected call returns 401, so the navbar updates straight away.
  function clearSession() {
    setUser(null);
  }

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  const value = {
    user,
    loading,
    setLoggedInUser,
    clearSession,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
