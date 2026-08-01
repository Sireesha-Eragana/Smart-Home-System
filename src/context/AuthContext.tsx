import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, homeName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => Promise<void>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr_demo',
  name: 'Alex Rivera',
  email: 'admin@smarthome.io',
  role: 'admin',
  homeName: 'Sentinel Smart Villa',
  phone: '+1 (555) 019-2831',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smarthome_user');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('smarthome_jwt') || 'demo_token_xyz_123';
  });

  useEffect(() => {
    if (user) localStorage.setItem('smarthome_user', JSON.stringify(user));
    else localStorage.removeItem('smarthome_user');

    if (token) localStorage.setItem('smarthome_jwt', token);
    else localStorage.removeItem('smarthome_jwt');
  }, [user, token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };

      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      // Fallback demo login
      setToken('demo_jwt_token_fallback');
      setUser({ ...DEMO_USER, email, name: email.split('@')[0] });
      return { success: true };
    }
  };

  const register = async (name: string, email: string, pass: string, homeName?: string) => {
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, homeName }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Registration failed' };

      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch {
      setToken('demo_jwt_token_fallback');
      setUser({
        id: 'usr_' + Date.now(),
        name,
        email,
        role: 'admin',
        homeName: homeName || 'My Smart Home',
        createdAt: new Date().toISOString(),
      });
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const demoLogin = () => {
    setUser(DEMO_USER);
    setToken('demo_token_xyz_123');
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!user) return;
    const newProfile = { ...user, ...updated };
    setUser(newProfile);

    if (token) {
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        });
      } catch (e) {
        console.error('Failed to sync profile with server', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
