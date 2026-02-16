
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message?: string };
  register: (name: string, email: string, password: string, role: UserRole) => { success: boolean; message?: string };
  logout: () => void;
  checkEmail: (email: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUsers = (): any[] => {
  const users = localStorage.getItem('smartflow_db_users');
  return users ? JSON.parse(users) : [];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('smartflow_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
    setLoading(false);
  }, []);

  const checkEmail = (email: string) => {
    const users = getStoredUsers();
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const login = (email: string, password: string) => {
    const users = getStoredUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      return { success: false, message: 'No account found. Please check your email.' };
    }

    if (foundUser.password !== password) {
      return { success: false, message: 'Invalid passkey. Access denied.' };
    }

    const sessionUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundUser.email}`
    };

    setUser(sessionUser);
    localStorage.setItem('smartflow_session', JSON.stringify(sessionUser));
    return { success: true };
  };

  const register = (name: string, email: string, password: string, role: UserRole) => {
    const users = getStoredUsers();
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return login(email, password);
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('smartflow_db_users', JSON.stringify(updatedUsers));

    return login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartflow_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, checkEmail, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
