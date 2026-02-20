import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuth } from '../services/auth';
import type { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const unsub = subscribeToAuth((authUser) => {
        setUser(authUser);
        if (!authUser) setRole(null);
        setIsLoading(false);
      });
      return unsub;
    } catch (error) {
      // Auth non disponible (normal pour interface Client)
      setIsLoading(false);
      return () => {};
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, setRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
