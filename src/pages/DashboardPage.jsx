import { useState, useEffect, useRef } from 'react';
import loguitoImg from '../assets/loguito.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
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
import { supabase } from '../lib/supabase';
import FeedCard from '../components/ui/FeedCard';
import ContentDetailModal from '../components/ui/ContentDetailModal';
import { FeedCardSkeleton } from '../components/ui/Skeleton';

const menuItems = [
  { key: 'feed', icon: LayoutDashboard, label: 'Feed Principal', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { key: 'config', icon: Settings, label: 'Configuración', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-700' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { allContent, savedIds, toggleSave, schools, hasMore, loadingMore, loadMore } = useContentContext();
  const { user, logout, session } = useAuth();
  const [activeMenu, setActiveMenu] = useState('feed');
  const [schoolFilter, setSchoolFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const sentinelRef = useRef(null);
  const postRefs = useRef({});

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Infinite scroll — dispara loadMore cuando el sentinel entra en pantalla
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  // Fetch notifications from Supabase
  useEffect(() => {
    if (!session?.user) return;
    async function fetchNotifications() {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setNotifications(data || []);
    }
    fetchNotifications();
  }, [session]);

  const handleNotificationClick = async (n) => {
    // Mark as read
    if (!n.is_read) {
      supabase.from('notifications').update({ is_read: true }).eq('id', n.id).then();
      setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
    }
    setShowNotifications(false);

    if (!n.publication_id) return;

    // Reset filters so the post is visible
    setSchoolFilter('Todas');
    setTypeFilter('Todos');
    setQuery('');
    setSavedOnly(false);

    // Check if post is already in the feed
    const existing = allContent.find(p => p.id === n.publication_id);
    if (existing) {
      // Small delay for filters to apply
      setTimeout(() => {
        const el = postRefs.current[n.publication_id];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedId(n.publication_id);
          setTimeout(() => setHighlightedId(null), 2500);
        }
      }, 100);
      return;
    }

    // Post not in feed — fetch it directly
    setNotifLoading(true);
    try {
      const { data } = await supabase
        .from('publications')
        .select(`
          *,
          faculty:faculties(id, name, code, color),
          content_type:content_types(id, name, icon, color),
          media_files(id, file_type, file_name, public_url, thumbnail_url, external_url, storage_path),
          likes(user_id),
          comments(id, content, created_at, is_deleted, user_id, profiles:user_id(display_name, avatar_url)),
          profiles:author_id(avatar_url)
        `)
        .eq('id', n.publication_id)
        .single();

      if (data) {
        // Open in detail modal as fallback
        const media = data.media_files?.[0];
        setSelectedItem({
          id: data.id,
          title: data.title,
          author: data.author_name || 'Anónimo',
          school: data.faculty?.name || 'General',
          type: data.content_type?.name || 'Artículo',
          date: data.created_at,
          excerpt: data.description || '',
          readTime: data.read_time_min ? `${data.read_time_min} min` : null,
          location: data.event_location || null,
          fileUrl: media?.public_url || null,
          fileType: media?.file_type || null,
          fileName: media?.file_name || null,
          linkUrl: data.external_url || null,
        });
      }
    } catch {
      // silently fail
    } finally {
      setNotifLoading(false);
    }
  };

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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredData = allContent.filter((item) => {
    const dashboardSavedOnly = savedOnly;

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
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/25">
          <img src={loguitoImg} className="h-5" alt="USM RED" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">USM RED</span>
          <p className="text-[10px] text-slate-400 font-medium -mt-0.5 tracking-wide">Red Académica Digital</p>
        </div>
      </div>

      {/* User mini card */}
      <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-slate-700/40 dark:to-slate-800/40 border border-blue-100/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 shrink-0 overflow-hidden ring-2 ring-white dark:ring-slate-800">
            {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : user?.initials || 'US'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name || 'Usuario'}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              {user?.role === 'admin'
                ? <><Shield className="w-3 h-3 text-usm-blue" /> Administrador</>
                : <><GraduationCap className="w-3 h-3 text-emerald-500" /> Usuario</>}
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all font-medium group ${isActive
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-700/50'
                }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-white/20' : `${item.bg} ${item.color}`
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
    return (
      <div className="space-y-5">
        {/* User Profile Card */}
        <div className="bg-white/90 dark:bg-slate-800/80 rounded-3xl shadow-soft border border-white/60 dark:border-slate-700/50 overflow-hidden backdrop-blur-sm">
          <div className="h-28 bg-gradient-to-135 from-blue-500 via-indigo-500 to-violet-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,transparent_60%)]" />
            <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span className="text-[10px] text-white font-bold">USM RED</span>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-7 mb-3">
              <div className="w-15 h-15 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-xl shadow-blue-500/25 border-4 border-white dark:border-slate-800 overflow-hidden shrink-0">
                {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : user?.initials || 'US'}
              </div>
              <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-usm-blue dark:text-blue-300 font-bold px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                {user?.role === 'admin' ? 'Admin' : 'Usu.'}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white">{user?.name || 'Usuario'}</h3>
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
              {user?.role === 'admin'
                ? <><Shield className="w-3 h-3 text-usm-blue" /> Administrador</> : <><GraduationCap className="w-3 h-3 text-emerald-500" /> Usuario · USM</>}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/40 dark:from-blue-900/15 dark:to-blue-900/5 rounded-2xl p-3.5 text-center border border-blue-100/50 dark:border-blue-900/20">
                <p className="text-xl font-extrabold text-blue-600">{totalPublications}</p>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Publicaciones</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/40 dark:from-amber-900/15 dark:to-amber-900/5 rounded-2xl p-3.5 text-center border border-amber-100/50 dark:border-amber-900/20">
                <p className="text-xl font-extrabold text-amber-500">{totalSaved}</p>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Guardados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Stats with progress bars */}
        <div className="bg-white/90 dark:bg-slate-800/80 rounded-3xl p-5 shadow-soft border border-white/60 dark:border-slate-700/50 backdrop-blur-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <BookOpenCheck className="w-4 h-4 text-blue-500" /> Contenido Disponible
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
        <div className="bg-white/90 dark:bg-slate-800/80 rounded-3xl p-5 shadow-soft border border-white/60 dark:border-slate-700/50 backdrop-blur-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-violet-500" /> Temas Populares
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-50/80 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-600/50 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200/60 dark:hover:bg-blue-900/10 dark:hover:text-blue-400 transition-all"
              >
                <Hash className="w-3 h-3" />{tag.slice(1)}
              </button>
            ))}
          </div>
        </div>



        {/* Quick Links */}
        {user?.role === 'admin' && (
          <div className="bg-white/90 dark:bg-slate-800/80 rounded-3xl p-5 shadow-soft border border-white/60 dark:border-slate-700/50 backdrop-blur-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-emerald-500" /> Acceso Rápido
            </h3>
            <Link
              to="/admin"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/15 hover:bg-blue-50 dark:hover:bg-blue-900/25 transition-all group border border-blue-100/40 dark:border-blue-900/20"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">Panel Administrador</p>
                <p className="text-xs text-slate-400">Crear y gestionar contenido</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-usm-bg dark:bg-[#0c1222] flex">
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
              className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 p-6 flex flex-col z-50 md:hidden shadow-soft-lg border-r border-slate-200/60 dark:border-slate-700/50"
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
<div className="max-w-[1600px] mx-auto w-full flex gap-5 sm:gap-6 p-3 sm:p-4 md:p-6 lg:p-8">

        {/* Columna Izquierda (Navegación Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-6 h-fit">
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 shadow-soft border border-slate-200/60 dark:border-slate-700/50 min-h-[80vh] flex flex-col">
            {sidebarContent}
          </div>
        </aside>

        {/* Columna Central (Feed) */}
        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-usm-bg/80 dark:bg-[#0c1222]/80 backdrop-blur-xl pb-3 sm:pb-4 pt-3 mb-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2.5 bg-white/90 dark:bg-slate-800/80 rounded-2xl shadow-soft text-slate-600 dark:text-slate-300 shrink-0 border border-white/60 dark:border-slate-700/50 backdrop-blur-sm"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="relative flex-grow max-w-2xl">
                  <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 sm:w-[18px] h-4 sm:h-[18px]" />
                  <input
                    type="text"
                    placeholder="Buscar publicaciones..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full pl-11 sm:pl-13 pr-4 sm:pr-5 py-3 sm:py-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 shadow-soft focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 dark:focus:border-blue-600 transition-all dark:text-white dark:placeholder-slate-500 text-sm backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative p-3 bg-white/90 dark:bg-slate-800/80 rounded-2xl shadow-soft text-slate-500 dark:text-slate-400 hover:text-blue-500 border border-slate-200/60 dark:border-slate-700/50 transition-all hover:shadow-soft-lg backdrop-blur-sm"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
                  )}
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-16 w-72 sm:w-80 bg-white/95 dark:bg-slate-800/95 rounded-3xl shadow-soft-lg border border-white/60 dark:border-slate-700/50 overflow-hidden z-50 max-h-[70vh] overflow-y-auto backdrop-blur-xl"
                    >
                      <div className="p-4 border-b border-slate-100/80 dark:border-slate-700/50">
                        <h4 className="font-bold text-slate-800 dark:text-white">Notificaciones</h4>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-400">
                          No hay notificaciones
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 border-b border-slate-50 dark:border-slate-700 last:border-none hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                              }`}
                          >
                            <p className="text-sm text-slate-700 dark:text-slate-200">{n.message || `Nueva ${n.type}`}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-slate-400">{new Date(n.created_at).toLocaleDateString('es-VE')}</p>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                            </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Link to="/profile">
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 cursor-pointer overflow-hidden ring-2 ring-white dark:ring-slate-800">
                    {user?.avatar_url ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : user?.initials || 'US'}
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Filtros Scrollable */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
              <motion.button
                onClick={() => setSavedOnly((prev) => !prev)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shrink-0 flex items-center gap-2 ${savedOnly
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md shadow-amber-400/25'
                  : 'bg-white/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50 hover:border-amber-300 shadow-soft backdrop-blur-sm'
                  }`}
              >
                <BookmarkCheck className="w-4 h-4" /> Guardados
              </motion.button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
              {schools.map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setSchoolFilter(s)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shrink-0 border ${schoolFilter === s
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                    : 'bg-white/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700/50 shadow-soft backdrop-blur-sm'
                    }`}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </header>

          {notifLoading && (
            <div className="flex items-center justify-center gap-3 py-8">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Buscando publicación...</span>
            </div>
          )}

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
                  <div
                    key={item.id}
                    ref={el => { postRefs.current[item.id] = el; }}
                    className={`transition-all duration-700 rounded-3xl ${highlightedId === item.id ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                  >
                    <FeedCard
                      item={item}
                      onToggleSave={toggleSave}
                      isSaved={savedIds.includes(item.id)}
                      onViewDetail={() => setSelectedItem(item)}
                    />
                  </div>
                ))}
              </AnimatePresence>
              {!loading && filteredData.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100/80 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">No hay resultados</h3>
                  <p className="text-slate-500">Intenta con otros filtros o términos de búsqueda.</p>
                </div>
              )}

              {/* Sentinel de infinite scroll */}
              <div ref={sentinelRef} className="py-4 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="w-5 h-5 border-2 border-usm-blue border-t-transparent rounded-full animate-spin" />
                    Cargando más...
                  </div>
                )}
                {!hasMore && filteredData.length > 0 && (
                  <p className="text-xs text-slate-400">Ya viste todo el contenido disponible.</p>
                )}
              </div>
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
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl shadow-blue-500/30 flex items-center justify-center border-4 border-white dark:border-slate-900"
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
