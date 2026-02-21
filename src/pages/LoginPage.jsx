import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, ArrowLeft, Loader2, KeyRound, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Completa correo y contraseña para continuar.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const redirectTo = await login(email, password);
      showToast('Sesión iniciada correctamente', 'success');
      navigate(redirectTo);
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecovery = async () => {
    if (!recoveryEmail.trim()) {
      setError('Escribe tu correo para recuperar tu cuenta.');
      return;
    }
    setError('');
    setRecoverySubmitting(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
      setRecoverySent(true);
      showToast('Correo de recuperación enviado', 'info');
    } catch (err) {
      setError(err.message || 'Error al enviar el correo de recuperación.');
    } finally {
      setRecoverySubmitting(false);
    }
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
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-6 sm:p-8 bg-gradient-to-br from-usm-blue to-blue-900 relative min-h-screen">
        {/* Botón volver a landing */}
        <Link
          to="/"
          className="self-start mb-4 lg:absolute lg:top-6 lg:left-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-xl transition-colors border border-white/20 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          {/* ── Recovery View ── */}
          {showRecovery ? (
            <motion.div
              key="recovery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => { setShowRecovery(false); setError(''); setRecoverySent(false); }}
                className="flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al login
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-usm-yellow/20 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-usm-yellow" />
                </div>
                <h1 className="text-2xl font-bold text-white">Recuperar cuenta</h1>
              </div>
              <p className="text-blue-200 text-sm mb-6">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {recoverySent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">¡Revisa tu correo!</h3>
                  <p className="text-blue-200 text-sm mb-4 max-w-xs mx-auto">
                    Enviamos un enlace de recuperación a <strong className="text-white">{recoveryEmail}</strong>.
                    Revisa también la carpeta de spam.
                  </p>
                  <button
                    onClick={() => { setRecoverySent(false); setRecoveryEmail(''); }}
                    className="text-sm text-blue-300 hover:underline"
                  >
                    Enviar a otro correo
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="usuario@gmail.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRecovery()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                      autoFocus
                    />
                  </div>

                  {error && <p className="text-sm text-red-300">{error}</p>}

                  <Button
                    type="button"
                    onClick={handleRecovery}
                    disabled={recoverySubmitting}
                    className="w-full py-4 text-lg flex items-center justify-center gap-2"
                  >
                    {recoverySubmitting
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <>Enviar enlace <ArrowRight className="w-5 h-5" /></>}
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
          /* ── Login View ── */
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
            <p className="text-gray-300">Ingresa con tu cuenta</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Correo 
              </label>
              <input
                type="email"
                placeholder="usuario@gmail.com"
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

            <Button type="submit" disabled={submitting} className="w-full py-4 text-lg flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Entrar al Campus <ChevronRight className="w-5 h-5" /></>}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm space-y-2">
            <p className="text-gray-400">
              ¿Olvidaste tu acceso?{' '}
              <button
                type="button"
                onClick={() => { setShowRecovery(true); setError(''); setRecoveryEmail(email); }}
                className="text-blue-200 hover:underline font-medium"
              >
                Recuperar cuenta
              </button>
            </p>
            <p className="text-gray-400">¿No tienes cuenta? <Link to="/registro" className="text-blue-200 hover:underline">Regístrate</Link></p>
          </div>
          </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
