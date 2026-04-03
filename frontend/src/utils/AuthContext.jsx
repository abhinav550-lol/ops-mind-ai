// ─── Auth Context ─────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    userApi.me()
      .then((data) => setUser(data.user ?? data))
      .catch(() => setUser(null))
      .finally(() => setInitializing(false));
  }, []);

  const login = async (email, password) => {
    try {
      const data = await userApi.login(email, password);
      const userData = data.user ?? data;
      setUser(userData);
      return { success: true, role: userData.role };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const data = await userApi.register(name, email, password, role);
      const userData = data.user ?? data;
      setUser(userData);
      return { success: true, role: userData.role ?? role };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try { await userApi.logout(); } catch { /* ignore */ }
    finally { setUser(null); }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-snow">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-white text-sm font-display font-bold">OM</span>
          </div>
          <p className="text-xs text-muted font-mono">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
