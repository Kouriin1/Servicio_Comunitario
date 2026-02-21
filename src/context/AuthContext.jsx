import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function getInitials(profile) {
  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  if (!name) return 'U';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function mapRole(dbRole) {
  if (dbRole === 'admin') return 'admin';
  if (dbRole === 'professor') return 'profesor';
  return 'estudiante';
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Computed user object — backwards-compatible with the old mock shape
  const user = profile
    ? {
        id: profile.id,
        name:
          profile.display_name ||
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
          'Usuario',
        email: profile.email,
        role: mapRole(profile.role),
        school: profile.faculty?.name || '',
        initials: getInitials(profile),
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        first_name: profile.first_name,
        last_name: profile.last_name,
        faculty_id: profile.faculty_id,
      }
    : null;

  /* ───── Lifecycle ─────────────────────────────────────── */

  useEffect(() => {
    // 1. Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ───── Helpers ───────────────────────────────────────── */

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, faculty:faculties(id, name, code, color)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  /* ───── Auth actions ──────────────────────────────────── */

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Fetch role to determine redirect
    const { data: prof } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    return prof?.role === 'admin' ? '/admin' : '/dashboard';
  };

  const register = async ({ email, password, firstName, lastName, facultyId }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    if (error) throw error;

    // If auto-confirm enabled → session returned → update faculty
    if (data.session && facultyId) {
      await supabase
        .from('profiles')
        .update({ faculty_id: facultyId })
        .eq('id', data.user.id);
    }

    // null means email confirmation is required
    return data.session ? '/dashboard' : null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  /* ───── Provider ──────────────────────────────────────── */

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, session, profile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
