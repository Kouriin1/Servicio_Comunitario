import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  BookOpen,
  Calendar,
  Settings,
  Plus,
  Bell,
  LogOut,
  Filter,
  BookmarkCheck,
  Menu,
  X,
  TrendingUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Users
} from 'lucide-react';
import { useContentContext } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { faculties, contentTypes } from '../mockData';
import FeedCard from '../components/ui/FeedCard';
import ContentDetailModal from '../components/ui/ContentDetailModal';
import { FeedCardSkeleton } from '../components/ui/Skeleton';

const mockNotifications = [
  { id: 1, text: 'Nueva tesis publicada en Ingeniería', time: 'Hace 5 min', unread: true },
  { id: 2, text: 'Evento de Odontología actualizado', time: 'Hace 1 hora', unread: true },
  { id: 3, text: 'Tu contenido guardado fue editado', time: 'Hace 3 horas', unread: false },
];

const menuItems = [
  { key: 'feed', icon: <LayoutDashboard />, label: 'Feed Principal' },
  { key: 'biblioteca', icon: <BookOpen />, label: 'Mi Biblioteca' },
  { key: 'eventos', icon: <Calendar />, label: 'Eventos' },
  { key: 'config', icon: <Settings />, label: 'Configuración' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { allContent, savedIds, toggleSave } = useContentContext();
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('feed');
  const [facultyFilter, setFacultyFilter] = useState('Todas');
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
    const dashboardTypeFilter = activeMenu === 'eventos' ? 'Evento' : typeFilter;
    const dashboardSavedOnly = activeMenu === 'biblioteca' ? true : savedOnly;

    const matchFaculty = facultyFilter === 'Todas' || item.faculty === facultyFilter;
    const matchType = dashboardTypeFilter === 'Todos' || item.type === dashboardTypeFilter;
    const matchSearch = `${item.title} ${item.author}`.toLowerCase().includes(query.toLowerCase());
    const matchSaved = !dashboardSavedOnly || savedIds.includes(item.id);

    return matchFaculty && matchType && matchSearch && matchSaved;
  });

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 mb-8 px-2">
        <img src="/src/assets/loguito.png" className="h-8" />
        <span className="text-xl font-bold tracking-tighter text-slate-800 dark:text-white">USM RED</span>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleMenuClick(item.key)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${activeMenu === item.key
                ? 'bg-usm-blue text-white shadow-md shadow-usm-blue/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-usm-blue dark:hover:text-white'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-medium"
        >
          <LogOut /> Cerrar Sesión
        </button>
      </div>
    </>
  );

  const RightSidebar = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-usm-yellow" /> Tendencias
        </h3>
        <div className="flex flex-wrap gap-2">
          {['#InteligenciaArtificial', '#DerechoPenal', '#OdontologiaDigital', '#ReactJS', '#PsicologiaPositiva'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium cursor-pointer hover:bg-usm-blue hover:text-white transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-usm-blue-bright" /> Próximos Eventos
        </h3>
        <div className="space-y-4">
          {[
            { title: 'Feria de Tesis 2026', date: '20 Feb', color: 'bg-purple-100 text-purple-600' },
            { title: 'Conferencia de Derecho', date: '25 Feb', color: 'bg-blue-100 text-blue-600' },
            { title: 'Taller de React Avanzado', date: '02 Mar', color: 'bg-orange-100 text-orange-600' }
          ].map((evt, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${evt.color}`}>
                <span className="text-xs font-bold uppercase">{evt.date.split(' ')[1]}</span>
                <span className="text-lg font-bold leading-none">{evt.date.split(' ')[0]}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight hover:text-usm-blue cursor-pointer transition-colors">
                {evt.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" /> Investigadores
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">Dr. Investigador {i + 1}</p>
                <p className="text-xs text-slate-500 truncate">Facultad de Ingeniería</p>
              </div>
              <button className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-usm-blue-bright transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 min-h-[80vh] flex flex-col">
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
              {['Todas', ...faculties].map((f) => (
                <button
                  key={f}
                  onClick={() => setFacultyFilter(f)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shrink-0 border ${facultyFilter === f
                      ? 'bg-usm-blue text-white border-usm-blue shadow-md shadow-blue-900/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  {f}
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
