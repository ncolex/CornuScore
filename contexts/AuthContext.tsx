import React, { createContext, useState, ReactNode } from 'react';

export interface User {
  phone: string;
}

export interface AuthContextType {
  user: User | null;
  login: (phone: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const item = window.sessionStorage.getItem('user');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to parse user from sessionStorage', error);
      return null;
    }
  });

  const login = (phone: string) => {
    const newUser = { phone };
    setUser(newUser);
    window.sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    window.sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};