import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AdminAuthContextType {
  admin: User | null;
  adminToken: string | null;
  isLoading: boolean;
  adminLogin: (credentials: any) => Promise<void>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('baggio_admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      if (!adminToken) {
        setAdmin(null);
        setIsLoading(false);
        return;
      }
      try {
        const profile = await api.adminMe();
        setAdmin(profile);
      } catch (err) {
        console.error('Failed to verify admin token:', err);
        localStorage.removeItem('baggio_admin_token');
        setAdminToken(null);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadAdmin();
  }, [adminToken]);

  const adminLogin = async (credentials: any) => {
    const res = await api.adminLogin(credentials);
    localStorage.setItem('baggio_admin_token', res.token);
    setAdminToken(res.token);
    setAdmin(res.admin);
  };

  const adminLogout = () => {
    localStorage.removeItem('baggio_admin_token');
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, isLoading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
