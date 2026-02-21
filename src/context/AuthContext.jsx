import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password, extraData = {}) => {
    const isAdmin = email.toLowerCase().includes('admin');
    const name = extraData.name || email.split('@')[0];
    const school = extraData.school || 'Derecho';
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    setUser({
      name,
      email,
      role: isAdmin ? 'admin' : 'estudiante',
      school,
      initials,
    });

    return isAdmin ? '/admin' : '/dashboard';
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
