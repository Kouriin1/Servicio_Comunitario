import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, LogOut, User, Mail, Building2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast('Sesión cerrada', 'info');
    navigate('/login');
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
          <h2 className="text-lg font-bold text-usm-blue dark:text-white mb-4">Perfil</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-usm-blue text-white flex items-center justify-center text-xl font-bold">
                {user?.initials || 'U'}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{user?.name || 'Usuario'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'estudiante'}</p>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <Mail className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Correo</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.email || 'No disponible'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <Building2 className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Escuela</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.school || 'No definida'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <Shield className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Rol</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">{user?.role || 'estudiante'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

       

        {/* Sesión */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 className="text-lg font-bold text-usm-blue dark:text-white mb-4">Sesión</h2>
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
