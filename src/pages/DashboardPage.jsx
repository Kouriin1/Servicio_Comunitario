import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  BookOpen,
  Settings,
  Plus,
  Bell,
  LogOut,
  BookmarkCheck,
  Menu,
  X,
  Shield,
  GraduationCap,
  FileText,
  BookOpenCheck,
  Hash,
  TrendingUp,
  Users,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useContentContext } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { schools, contentTypes } from '../mockData';
import FeedCard from '../components/ui/FeedCard';
import ContentDetailModal from '../components/ui/ContentDetailModal';
import { FeedCardSkeleton } from '../components/ui/Skeleton';

const mockNotifications = [
  { id: 1, text: 'Nueva tesis publicada en Derecho', time: 'Hace 5 min', unread: true },
  { id: 2, text: 'Evento de Estudios Internacionales actualizado', time: 'Hace 1 hora', unread: true },
  { id: 3, text: 'Tu contenido guardado fue editado', time: 'Hace 3 horas', unread: false },
];

const menuItems = [
  { key: 'feed', icon: LayoutDashboard, label: 'Feed Principal', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { key: 'biblioteca', icon: BookOpen, label: 'Mi Biblioteca', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  { key: 'config', icon: Settings, label: 'Configuración', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-700' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { allContent, savedIds, toggleSave } = useContentContext();
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('feed');
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleMenuClick = (key) => {
    setActiveMenu(key);
    setMobileMenuOpen(false);
    if (key === 'feed') {
      setSavedOnly(false);
      setTypeFilter('Todos');
    }
    if (key === 'config') {
      navigate('/configuracion');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredData = allContent.filter((item) => {
    const dashboardSavedOnly = activeMenu === 'biblioteca' ? true : savedOnly;

    const matchSchool = schoolFilter === 'Todas' || item.school === schoolFilter;
    const matchType = typeFilter === 'Todos' || item.type === typeFilter;
    const matchSearch = `${item.title} ${item.author}`.toLowerCase().includes(query.toLowerCase());
    const matchSaved = !dashboardSavedOnly || savedIds.includes(item.id);

    return matchSchool && matchType && matchSearch && matchSaved;
  });

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-usm-blue to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
          <img src="/src/assets/loguito.png" className="h-5" alt="USM RED" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-usm-blue to-blue-400 bg-clip-text text-transparent">USM RED</span>
          <p className="text-[10px] text-slate-400 font-medium -mt-0.5 tracking-wide">Red Académica Digital</p>
        </div>
      </div>

      {/* User mini card */}
      <div className="mb-5 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/60 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-usm-blue to-blue-400 text-white flex items-center justify-center font-bold text-sm shadow shrink-0">
            {user?.initials || 'US'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name || 'Usuario'}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              {user?.role === 'admin'
                ? <><Shield className="w-3 h-3 text-usm-blue" /> Administrador</>
                : <><GraduationCap className="w-3 h-3 text-emerald-500" /> Estudiante</>}
            </p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] px-2 mb-2">Menú</p>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium group ${
                isActive
                  ? 'bg-usm-blue text-white shadow-md shadow-usm-blue/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isActive ? 'bg-white/20' : `${item.bg} ${item.color}`
              }`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-sm">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-5">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-4" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/15 rounded-xl transition-all font-medium group"
        >
          <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4" />
          </span>
          <span className="text-sm">Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  const totalPublications = allContent.length;
  const totalTheses = allContent.filter(i => i.type === 'Tesis').length;
  const totalArticles = allContent.filter(i => i.type === 'Artículo').length;
  const totalEvents = allContent.filter(i => i.type === 'Evento').length;
  const totalSaved = savedIds.length;

  const RightSidebar = () => {
    const total = totalTheses + totalArticles + totalEvents || 1;
    const statsItems = [
      { label: 'Tesis', count: totalTheses, color: 'bg-usm-blue', text: 'text-usm-blue', dot: 'bg-blue-500' },
      { label: 'Artículos', count: totalArticles, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
      { label: 'Eventos', count: totalEvents, color: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
    ];
    const trendingTags = ['#Derecho', '#EstudiosInternacionales', '#Tesis2026', '#ActoDeGrado', '#DerechoPenal'];
    const suggested = [
      { name: 'Dr. Alberto Rivas', role: 'Docente · Derecho' },
      { name: 'Laura Medina', role: 'Estudiante · Estudios Internacionales' },
    ];
    return (
    <div className="space-y-5">
      {/* User Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="h-24 bg-gradient-to-135 from-usm-blue via-blue-500 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,transparent_60%)]" />
          <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span className="text-[10px] text-white font-bold">USM RED</span>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-7 mb-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-usm-blue to-blue-400 text-white flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white dark:border-slate-800">
              {user?.initials || 'US'}
            </div>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-usm-blue dark:text-blue-300 font-bold px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800">
              {user?.role === 'admin' ? 'Admin' : 'Est.'}
            </span>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">{user?.name || 'Usuario'}</h3>
          <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
            {user?.role === 'admin'
              ? <><Shield className="w-3 h-3 text-usm-blue" /> Administrador</>              : <><GraduationCap className="w-3 h-3 text-emerald-500" /> Estudiante · USM</>}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-900/30">
              <p className="text-xl font-extrabold text-usm-blue">{totalPublications}</p>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Publicaciones</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100/50 dark:from-yellow-900/20 dark:to-amber-900/10 rounded-xl p-3 text-center border border-yellow-100 dark:border-yellow-900/30">
              <p className="text-xl font-extrabold text-usm-yellow">{totalSaved}</p>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Guardados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Stats with progress bars */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
          <BookOpenCheck className="w-4 h-4 text-usm-blue" /> Contenido Disponible
        </h3>
        <div className="space-y-3.5">
          {statsItems.map((s) => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{s.label}</span>
                </div>
                <span className={`text-xs font-bold ${s.text}`}>{s.count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((s.count / total) * 100)}%` }}
                  transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${s.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-purple-500" /> Temas Populares
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-usm-blue/10 hover:text-usm-blue hover:border-usm-blue/30 transition-all"
            >
              <Hash className="w-3 h-3" />{tag.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-emerald-500" /> Personas Sugeridas
        </h3>
        <div className="space-y-3">
          {suggested.map((p) => {
            const initials = p.name.split(' ').slice(0,2).map(w=>w[0]).join('');
            const grads = ['from-purple-500 to-pink-400','from-emerald-500 to-teal-400'];
            const gi = p.name.charCodeAt(0) % grads.length;
            return (
              <div key={p.name} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grads[gi]} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p.role}</p>
                </div>
                <button className="text-xs font-bold text-usm-blue border border-usm-blue/30 px-2 py-0.5 rounded-full hover:bg-usm-blue hover:text-white transition-all shrink-0">
                  Seguir
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      {user?.role === 'admin' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-green-500" /> Acceso Rápido
          </h3>
          <Link
            to="/admin"
            className="flex items-center gap-3 p-3 rounded-xl bg-usm-blue/5 dark:bg-blue-900/20 hover:bg-usm-blue/10 dark:hover:bg-blue-900/30 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-usm-blue/10 flex items-center justify-center text-usm-blue">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-usm-blue group-hover:underline">Panel Administrador</p>
              <p className="text-xs text-slate-400">Crear y gestionar contenido</p>
            </div>
          </Link>
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex">
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 p-6 flex flex-col z-50 md:hidden shadow-lg"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate-600 dark:text-slate-300 hover:text-usm-blue"
              >
                <X className="w-6 h-6" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido Principal Grid 3 Columnas */}
      <div className="max-w-[1600px] mx-auto w-full flex gap-6 p-4 md:p-6 lg:p-8">

        {/* Columna Izquierda (Navegación Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-6 h-fit">
          <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 min-h-[80vh] flex flex-col backdrop-blur-sm">
            {sidebarContent}
          </div>
        </aside>

        {/* Columna Central (Feed) */}
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 dark:bg-slate-900/95 backdrop-blur-md pb-4 pt-2 mb-4">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-600 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="relative flex-grow max-w-2xl">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar publicaciones, personas o hashtags..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm focus:ring-2 focus:ring-usm-blue-bright transition-all dark:text-white dark:placeholder-slate-400 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300 hover:text-usm-blue border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-16 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <h4 className="font-bold text-usm-blue dark:text-white">Notificaciones</h4>
                      </div>
                      {mockNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-slate-50 dark:border-slate-700 last:border-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${n.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                        >
                          <p className="text-sm text-slate-700 dark:text-slate-200">{n.text}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Link to="/profile">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-usm-blue to-blue-500 text-white flex items-center justify-center font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
                    {user?.initials || 'US'}
                  </div>
                </Link>
              </div>
            </div>

            {/* Filtros Scrollable */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
              <button
                onClick={() => setSavedOnly((prev) => !prev)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors shrink-0 flex items-center gap-2 ${savedOnly
                  ? 'bg-usm-yellow text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-usm-yellow'
                  }`}
              >
                <BookmarkCheck className="w-4 h-4" /> Guardados
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
              {schools.map((s) => (
                <button
                  key={s}
                  onClick={() => setSchoolFilter(s)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shrink-0 border ${schoolFilter === s
                    ? 'bg-usm-blue text-white border-usm-blue shadow-md shadow-blue-900/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </header>

          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <FeedCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredData.map((item) => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    onToggleSave={toggleSave}
                    isSaved={savedIds.includes(item.id)}
                    onViewDetail={() => setSelectedItem(item)}
                  />
                ))}
              </AnimatePresence>
              {!loading && filteredData.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No hay resultados</h3>
                  <p className="text-slate-500">Intenta con otros filtros o términos de búsqueda.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Columna Derecha (Discovery) */}
        <aside className="hidden xl:block w-80 shrink-0 sticky top-6 h-fit">
          <RightSidebar />
        </aside>

      </div>

      {/* Botón Flotante Admin */}
      {user?.role === 'admin' && (
        <Link to="/admin" className="fixed bottom-8 right-8 z-50">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-usm-blue text-white rounded-full shadow-2xl shadow-usm-blue/40 flex items-center justify-center border-4 border-white dark:border-slate-900"
          >
            <Plus className="w-8 h-8" />
          </motion.button>
        </Link>
      )}

      <ContentDetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}
