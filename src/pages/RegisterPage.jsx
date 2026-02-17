import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound, Mail, Lock, Building2, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { faculties } from '../mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faculty, setFaculty] = useState('Ingeniería');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Completa todos los campos para continuar.');
      return;
    }

    setError('');
    const fullName = `${name.trim()} ${lastName.trim()}`;
    const redirectTo = login(email, password, { name: fullName, faculty });
    showToast(`Cuenta creada exitosamente. Bienvenido/a, ${name}!`, 'success');
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-usm-blue to-blue-950 p-6 md:p-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl p-8 md:p-10"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Crear cuenta</h1>
        <p className="text-blue-100 mb-8">Completa tus datos para acceder a la plataforma.</p>



        <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
          <label className="block md:col-span-1">
            <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><UserRound className="w-4 h-4" /> Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Tu nombre"
            />
          </label>

          <label className="block md:col-span-1">
            <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><UserRound className="w-4 h-4" /> Apellido</span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Tu apellido"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><Mail className="w-4 h-4" /> Correo institucional</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="usuario@usm.edu.ve"
            />
          </label>

          <label className="block md:col-span-1">
            <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><Building2 className="w-4 h-4" /> Facultad</span>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {faculties.filter((f) => f !== 'Todas').map((f) => (
                <option key={f} value={f} className="text-usm-blue">{f}</option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-1">
            <span className="text-sm text-blue-100 flex items-center gap-2 mb-2"><Lock className="w-4 h-4" /> Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="md:col-span-2 text-sm text-red-300">{error}</p>}

          <div className="md:col-span-2 pt-2">
            <Button type="submit" className="w-full py-4 text-lg flex items-center justify-center gap-2">
              Crear Cuenta <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-center text-blue-100">
          ¿Ya tienes cuenta? <Link to="/login" className="text-white hover:underline">Inicia sesión</Link>
        </p>
      </motion.div>
    </div>
  );
}
