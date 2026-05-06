import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Mail, Building2, Shield, Camera, Save, Loader2, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useContentContext } from '../context/ContentContext';

const NAME_REGEX = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, uploadAvatar } = useAuth();
  const { showToast } = useToast();
  const { faculties } = useContentContext();

  const fileInputRef = useRef(null);
  const [bio, setBio] = useState(user?.bio || '');
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [facultyId, setFacultyId] = useState(user?.faculty_id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const studentFaculties = useMemo(
    () => faculties.filter((f) => f.code !== 'TODAS'),
    [faculties],
  );

  const hasChanges =
    bio !== (user?.bio || '') ||
    firstName.trim() !== (user?.first_name || '') ||
    lastName.trim() !== (user?.last_name || '') ||
    facultyId !== (user?.faculty_id || '');

  const handleLogout = async () => {
    await logout();
    showToast('Sesión cerrada', 'info');
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      showToast('Nombre y apellido son obligatorios.', 'error');
      return;
    }
    if (!NAME_REGEX.test(trimmedFirst) || trimmedFirst.length < 2) {
      showToast('El nombre solo puede contener letras y al menos 2 caracteres.', 'error');
      return;
    }
    if (!NAME_REGEX.test(trimmedLast) || trimmedLast.length < 2) {
      showToast('El apellido solo puede contener letras y al menos 2 caracteres.', 'error');
      return;
    }
    if (!facultyId) {
      showToast('Selecciona una escuela.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        bio,
        first_name: trimmedFirst,
        last_name: trimmedLast,
        display_name: `${trimmedFirst} ${trimmedLast}`,
        faculty_id: facultyId,
      });
      showToast('Perfil actualizado con éxito', 'success');
    } catch (err) {
      showToast(err.message || 'Error al actualizar el perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona una imagen válida', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no debe superar los 5MB', 'error');
      return;
    }

    try {
      setIsUploading(true);
      await uploadAvatar(file);
      showToast('Foto de perfil actualizada', 'success');
    } catch (err) {
      showToast(err.message || 'Error al subir la imagen', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            to="/dashboard"
            className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-usm-blue dark:text-white">Configuración</h1>
        </div>

        {/* Perfil */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-usm-blue dark:text-white">Perfil</h2>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-usm-blue text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cambios
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-usm-blue text-white flex items-center justify-center text-xl font-bold ring-2 ring-transparent group-hover:ring-usm-blue/50 transition-all">
                    {user?.initials || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isUploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </div>

              <div>
                <p className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">@{user?.email?.split('@')[0]}</p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Biografía
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-usm-blue dark:focus:border-blue-500 text-slate-800 dark:text-white transition-colors"
                rows="3"
                placeholder="Escribe algo interesante sobre ti..."
                maxLength={500}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{bio.length}/500</p>
            </div>

            <div className="grid gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                    <UserRound className="w-3.5 h-3.5" /> Nombre
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-usm-blue dark:focus:border-blue-500 text-slate-800 dark:text-white transition-colors"
                    placeholder="Tu nombre"
                    maxLength={50}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                    <UserRound className="w-3.5 h-3.5" /> Apellido
                  </span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-usm-blue dark:focus:border-blue-500 text-slate-800 dark:text-white transition-colors"
                    placeholder="Tu apellido"
                    maxLength={50}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Escuela
                </span>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-usm-blue dark:focus:border-blue-500 text-slate-800 dark:text-white transition-colors"
                >
                  <option value="">Selecciona tu escuela</option>
                  {studentFaculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correo Electrónico</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.email || 'No disponible'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rol Sistema</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">{user?.role || 'usuario'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sesión */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
        >

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </motion.section>
      </div>
    </div>
  );
}
