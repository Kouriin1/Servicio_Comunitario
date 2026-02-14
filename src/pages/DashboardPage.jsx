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
      <div className="flex items-center gap-3 mb-12">
        <img src="/src/assets/loguito.png" className="h-10" />
        <span className="text-white font-bold tracking-tighter">USM RED</span>
      </div>

      <nav className="flex-grow space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleMenuClick(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeMenu === item.key
                ? 'bg-white text-usm-blue font-bold'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all mt-auto"
      >
        <LogOut /> Cerrar Sesión
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-usm-blue p-6 fixed h-full z-40">
        {sidebarContent}
      </aside>

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
              className="fixed left-0 top-0 bottom-0 w-64 bg-usm-blue p-6 flex flex-col z-50 md:hidden"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido Principal */}
      <main className="flex-grow md:ml-64 p-4 md:p-8">
        {/* Header Superior */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar tesis, artículos o autores..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-usm-blue-bright transition-all dark:text-white dark:placeholder-slate-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 self-end md:self-auto">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-gray-500 dark:text-slate-300 hover:text-usm-blue"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                      <h4 className="font-bold text-usm-blue dark:text-white">Notificaciones</h4>
                    </div>
                    {mockNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-slate-50 dark:border-slate-700 last:border-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          n.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <p className="text-sm text-slate-700 dark:text-slate-200">{n.text}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-4 rounded-xl shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-usm-blue text-white flex items-center justify-center font-bold">
                {user?.initials || 'JD'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-usm-blue dark:text-white">{user?.name || 'Usuario'}</p>
                <p className="text-[10px] text-gray-400">{user?.faculty || 'Sin facultad'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setSavedOnly((prev) => !prev)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              savedOnly
                ? 'bg-usm-blue text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4" /> Solo guardados ({savedIds.length})
            </span>
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Resultados: {filteredData.length}</span>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center gap-2 px-3 py-2 bg-usm-blue text-white rounded-lg text-sm shrink-0">
            <Filter className="w-4 h-4" /> Filtros:
          </div>
          {faculties.map((f) => (
            <button
              key={f}
              onClick={() => setFacultyFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${
                facultyFilter === f
                  ? 'bg-usm-blue text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${
                typeFilter === type
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-usm-blue dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Masonry Feed */}
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <FeedCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
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
          </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
            No hay resultados con los filtros actuales.
          </div>
        )}

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
      </main>

      <ContentDetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </div>
  );
}
