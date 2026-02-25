import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Shield, BookOpen, Mail, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Avatar({ name, avatarUrl }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 border bg-white shrink-0"
      />
    );
  }
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'U';
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
  ];
  const idx = (name?.charCodeAt(0) ?? 0) % gradients.length;
  return (
    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradients[idx]} text-white flex items-center justify-center font-bold text-3xl shrink-0 ring-4 ring-white dark:ring-slate-800`}>
      {initials}
    </div>
  );
}

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPublicProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name, bio, avatar_url, role, faculty:faculties(name)')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    if (userId) fetchPublicProfile();
  }, [userId]);

  const displayName = profile
    ? profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuario'
    : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-usm-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <UserRound className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-700 dark:text-white">Usuario no encontrado</h2>
        <p className="text-sm text-slate-500">Este perfil no existe o no está disponible.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-usm-blue text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-800 dark:text-white text-sm">Perfil</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
        >
          {/* Banner + Avatar */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-br from-[#1a56db] via-blue-500 to-violet-500 overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)' }}
              />
            </div>
            {/* Avatar posicionado sobre el borde del banner */}
            <div className="absolute left-6 bottom-0 translate-y-1/2">
              <Avatar name={displayName} avatarUrl={profile.avatar_url} />
            </div>
          </div>

          {/* Espacio para el avatar que desborda */}
          <div className="h-14" />

          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{displayName}</h2>
              {profile.role === 'admin' ? (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-usm-blue/10 text-usm-blue dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-[10px] font-bold">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-[10px] font-bold">
                  <GraduationCap className="w-3 h-3" /> Usuario
                </span>
              )}
            </div>

            {profile.faculty?.name && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-5">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>{profile.faculty.name}</span>
              </div>
            )}

            {/* Bio */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Bio
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {profile.bio?.trim() || 'Este usuario aún no ha agregado una biografía.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
