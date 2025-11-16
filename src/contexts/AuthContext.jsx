import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const getInitialUser = () => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    return JSON.parse(savedUser);
  } else {
    const demoUser = { name: 'Demo User', email: 'demo@example.com' };
    localStorage.setItem('user', JSON.stringify(demoUser));
    return demoUser;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      logout
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
