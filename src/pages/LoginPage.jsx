import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Completa correo y contraseña para continuar.');
      return;
    }

    setError('');
    const redirectTo = login(email, password);
    showToast('Sesión iniciada correctamente', 'success');
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-usm-blue">
      {/* Lado Izquierdo: Visual Majestuosa */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <img
            src="/src/assets/lugar.png"
            alt="USM Campus"
            className="w-full h-full object-cover grayscale opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-slate-100/90" />
        </motion.div>

        <div className="relative z-10 text-center p-12">
          <motion.img
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            src="/src/assets/loguito.png"
            className="h-40 mx-auto mb-6 drop-shadow-xl"
          />
          <h2 className="text-5xl font-bold text-usm-blue mb-4 tracking-tight">Excelencia Académica</h2>
          <p className="text-slate-500 text-xl font-medium tracking-[0.2em] uppercase">USM RED</p>
        </div>
      </div>

      {/* Lado Derecho: Formulario Glassmorphism */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-usm-blue to-blue-900">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
            <p className="text-gray-300">Ingresa con tu cuenta institucional</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Correo Institucional
              </label>
              <input
                type="email"
                placeholder="usuario@usm.edu.ve"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-usm-blue-bright transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-usm-blue-bright transition-all"
              />
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}

            <Button type="submit" className="w-full py-4 text-lg flex items-center justify-center gap-2">
              Entrar al Campus <ChevronRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="mt-8 text-center text-sm space-y-2">
            <p className="text-gray-400">
              ¿Olvidaste tu acceso?{' '}
              <button
                type="button"
                onClick={() => {
                  setRecoveryMsg('Se envió una guía de recuperación al correo institucional (simulado).');
                  showToast('Correo de recuperación enviado', 'info');
                }}
                className="text-blue-200 hover:underline"
              >
                Recuperar cuenta
              </button>
            </p>
            <p className="text-gray-400">¿No tienes cuenta? <Link to="/registro" className="text-blue-200 hover:underline">Regístrate</Link></p>
            {recoveryMsg && <p className="text-green-300">{recoveryMsg}</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
