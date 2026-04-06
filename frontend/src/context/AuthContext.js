import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = process.env.REACT_APP_BACKEND_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState(() => {
    return localStorage.getItem('pending_2fa_email') || null;
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // Persist pendingEmail to localStorage
  useEffect(() => {
    if (pendingEmail) {
      localStorage.setItem('pending_2fa_email', pendingEmail);
    } else {
      localStorage.removeItem('pending_2fa_email');
    }
  }, [pendingEmail]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(`${API}/api/auth/me`, { 
        withCredentials: true,
        headers 
      });
      setUser(data);
    } catch (e) {
      setUser(null);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    const { data } = await axios.post(`${API}/api/auth/register`, { email, password, name }, { withCredentials: true });
    if (data.requires_2fa) {
      setPendingEmail(data.email);
    }
    return data;
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/api/auth/login`, { email, password }, { withCredentials: true });
    if (data.requires_2fa) {
      setPendingEmail(data.email || email);
    }
    return data;
  };

  const verify2FA = async (code) => {
    const { data } = await axios.post(`${API}/api/auth/verify-2fa`, { 
      email: pendingEmail, 
      code 
    }, { withCredentials: true });
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    localStorage.removeItem('pending_2fa_email');
    setUser(data);
    setPendingEmail(null);
    return data;
  };

  const resendCode = async () => {
    await axios.post(`${API}/api/auth/resend-code?email=${encodeURIComponent(pendingEmail)}`, {}, { withCredentials: true });
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      // Ignore errors
    }
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      pendingEmail,
      register, 
      login, 
      verify2FA, 
      resendCode,
      logout,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
