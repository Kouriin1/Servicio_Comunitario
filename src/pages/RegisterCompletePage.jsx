import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, UserRound, Building2, CheckCircle2, Loader2, AlertTriangle, ArrowLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useContentContext } from '../context/ContentContext';
import { useToast } from '../context/ToastContext';

const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/;

export default function RegisterCompletePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { session } = useAuth();
  const { faculties } = useContentContext();

  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableFaculties = faculties.filter((f) => f.code !== 'TODAS');

  useEffect(() => {
    const hydrate = (s) => {
      if (!s?.user) return;
      setInviteEmail(s.user.email || '');
      const meta = s.user.user_metadata || {};
      setFirstName((meta.first_name || '').toString());
      setLastName((meta.last_name || '').toString());
      setFacultyId(meta.faculty_id || '');
      setSessionReady(true);
    };

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      hydrate(s);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        hydrate(s);
        setChecking(false);
      }
    });

    const timer = setTimeout(() => setChecking(false), 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (session?.user && !sessionReady) {
      setInviteEmail(session.user.email || '');
      const meta = session.user.user_metadata || {};
      setFirstName((meta.first_name || '').toString());
      setLastName((meta.last_name || '').toString());
      setFacultyId(meta.faculty_id || '');
      setSessionReady(true);
    }
  }, [session, sessionReady]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setError('Completa tu nombre y apellido.');
      return;
    }
    if (!nameRegex.test(firstName.trim()) || firstName.trim().length < 2) {
      setError('El nombre solo puede contener letras y debe tener al menos 2 caracteres.');
      return;
    }
    if (!nameRegex.test(lastName.trim()) || lastName.trim().length < 2) {
      setError('El apellido solo puede contener letras y debe tener al menos 2 caracteres.');
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
        data: { registration_complete: true },
      });
      if (updateErr) throw updateErr;

      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s?.user) throw new Error('Sesión no disponible');

      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          faculty_id: facultyId || null,
        })
        .eq('id', s.user.id);

      if (profileErr) throw profileErr;

      setSuccess(true);
      showToast('Cuenta activada correctamente', 'success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Error al activar la cuenta.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-usm-blue to-blue-950 flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
      >
        {checking && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <Loader2 className="w-10 h-10 text-blue-300 animate-spin" />
            <p className="text-blue-100">Verificando tu invitación…</p>
          </div>
        )}

        {!checking && !sessionReady && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Invitación inválida o expirada</h2>
            <p className="text-blue-200 text-sm max-w-sm">
              El enlace de invitación ya no es válido. Pídele a un administrador que te envíe una nueva.
            </p>
            <Link to="/login">
              <Button className="mt-2 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Ir al Login
              </Button>
            </Link>
          </div>
        )}

        {!checking && sessionReady && success && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white">¡Bienvenido a USM RED!</h2>
            <p className="text-blue-200 text-sm">Te estamos redirigiendo al campus…</p>
            <Loader2 className="w-5 h-5 text-blue-300 animate-spin mt-2" />
          </div>
        )}

        {!checking && sessionReady && !success && (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Activa tu cuenta</h1>
            <p className="text-blue-100 mb-2">
              Has sido invitado a <strong className="text-usm-yellow">USM RED</strong>.
            </p>
            <p className="text-blue-200 text-sm mb-6">
              Cuenta asociada a: <span className="font-mono">{inviteEmail}</span>
            </p>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><UserRound className="w-4 h-4" /> Nombre</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Tu nombre"
                />
              </label>

              <label className="block">
                <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><UserRound className="w-4 h-4" /> Apellido</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Tu apellido"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><Building2 className="w-4 h-4" /> Escuela</span>
                <select
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="" className="text-usm-blue">Seleccionar escuela</option>
                  {availableFaculties.map((f) => (
                    <option key={f.id} value={f.id} className="text-usm-blue">{f.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /> Contraseña</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="••••••••"
                />
              </label>

              <label className="block">
                <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /> Confirmar contraseña</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="••••••••"
                />
              </label>

              {error && <p className="md:col-span-2 text-sm text-red-300">{error}</p>}

              <div className="md:col-span-2 pt-2">
                <Button type="submit" disabled={submitting} className="w-full py-4 text-lg flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Activar mi cuenta <ChevronRight className="w-5 h-5" /></>}
                </Button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
