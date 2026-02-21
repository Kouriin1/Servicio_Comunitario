import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Loader2, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

/**
 * This page handles two flows:
 *
 * 1. Recovery link landing — Supabase redirects here with hash tokens after
 *    the user clicks the email link.  The Supabase client picks up the tokens,
 *    fires a PASSWORD_RECOVERY event, and we show the "new password" form.
 *
 * 2. Direct navigation — if someone lands here without a recovery session we
 *    show a message pointing them back to /login to request a new link.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Whether we detected a valid recovery session
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checking, setChecking] = useState(true);

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ─── Detect recovery session via onAuthStateChange ─── */
  useEffect(() => {
    // Supabase JS automatically reads the hash fragment (access_token, type=recovery)
    // and triggers a PASSWORD_RECOVERY event.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true);
        setChecking(false);
      }
    });

    // Also check if there's already a session (user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If the URL still has #type=recovery or we already have a session from
      // the recovery flow, allow the user to set a new password.
      if (session) {
        setRecoveryReady(true);
      }
      setChecking(false);
    });

    // Safety timeout – if nothing fires in 4s, stop the spinner
    const timer = setTimeout(() => setChecking(false), 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  /* ─── Submit new password ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Escribe tu nueva contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      });

      if (updateErr) throw updateErr;

      setSuccess(true);
      showToast('Contraseña actualizada correctamente', 'success');

      // Redirect to dashboard after a brief moment
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-usm-blue to-blue-950 flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
      >
        {/* ── Loading state ── */}
        {checking && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Loader2 className="w-10 h-10 text-blue-300 animate-spin" />
            <p className="text-blue-100">Verificando enlace de recuperación…</p>
          </div>
        )}

        {/* ── No valid recovery session ── */}
        {!checking && !recoveryReady && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Enlace inválido o expirado</h2>
            <p className="text-blue-200 text-sm max-w-xs">
              El enlace de recuperación ya no es válido. Solicita uno nuevo desde la página de inicio de sesión.
            </p>
            <Link to="/login">
              <Button className="mt-2 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Volver al Login
              </Button>
            </Link>
          </div>
        )}

        {/* ── Success state ── */}
        {!checking && recoveryReady && success && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white">¡Contraseña actualizada!</h2>
            <p className="text-blue-200 text-sm">
              Serás redirigido al campus en unos segundos…
            </p>
            <Loader2 className="w-5 h-5 text-blue-300 animate-spin mt-2" />
          </div>
        )}

        {/* ── New password form ── */}
        {!checking && recoveryReady && !success && (
          <>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-usm-blue-bright/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
              </div>
            </div>
            <p className="text-blue-200 text-sm mb-6">
              Escribe tu nueva contraseña. Debe tener al menos 6 caracteres.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Contraseña nueva
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Confirmar contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                />
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Guardar contraseña</>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-blue-200">
              <Link to="/login" className="hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Volver al Login
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
