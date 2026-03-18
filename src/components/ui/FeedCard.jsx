import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  ExternalLink,
  Heart,
  MessageCircle,
  Trash2,
  FileText,
  Link2,
  Send,
  ChevronDown,
  ChevronUp,
  Smile,
  Eye,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContentContext } from '../../context/ContentContext';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Justo ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  return `Hace ${Math.floor(diff / 86400)}d`;
}

const SCHOOL_COLORS = {
  Derecho: { badge: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300', dot: 'bg-rose-400' },
  'Estudios Internacionales': { badge: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300', dot: 'bg-sky-400' },
  Todas: { badge: 'bg-slate-50 text-slate-500 dark:bg-slate-700/50 dark:text-slate-300', dot: 'bg-slate-400' },
};

const TYPE_COLORS = {
  Tesis: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-800/30',
  Artículo: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-800/30',
  Evento: 'bg-violet-50 text-violet-600 ring-1 ring-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-800/30',
  Resumen: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800/30',
};

// ─── Media Previews ──────────────────────────────────────────────────────────

function MediaPreview({ item, onClick }) {
  if (!item.fileType || !item.fileUrl) return null;

  if (item.fileType === 'image') {
    return (
      <motion.div
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.3 }}
        className="relative -mx-6 mt-4 mb-1 cursor-pointer group overflow-hidden"
        onClick={onClick}
      >
        <img
          src={item.fileUrl}
          alt={item.title}
          className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700 shadow-lg">
            <Eye className="w-3.5 h-3.5" /> Ver
          </span>
        </div>
      </motion.div>
    );
  }

  if (item.fileType === 'video') {
    return (
      <motion.div
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.3 }}
        className="relative -mx-6 mt-4 mb-1 aspect-video cursor-pointer group overflow-hidden"
        onClick={onClick}
      >
        <video src={item.fileUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent group-hover:from-black/50 transition-colors duration-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-black/20"
          >
            <svg className="w-7 h-7 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
            Video
          </span>
        </div>
      </motion.div>
    );
  }

  if (item.fileType === 'pdf' || item.fileType === 'document') {
    const isPdf = item.fileType === 'pdf';
    
    let docColor = isPdf ? 'red' : 'blue';
    let docTitle = isPdf ? 'Documento PDF' : 'Documento Adjunto';
    let docDesc = isPdf ? 'Archivo PDF' : 'Archivo de Office';
    
    if (!isPdf && item.fileName) {
      const ext = item.fileName.split('.').pop().toLowerCase();
      if (['xls', 'xlsx'].includes(ext)) {
        docColor = 'emerald';
        docTitle = item.fileName;
        docDesc = 'Hoja de Cálculo (Excel)';
      } else if (['ppt', 'pptx'].includes(ext)) {
        docColor = 'orange';
        docTitle = item.fileName;
        docDesc = 'Presentación (PowerPoint)';
      } else if (['doc', 'docx'].includes(ext)) {
        docColor = 'blue';
        docTitle = item.fileName;
        docDesc = 'Documento de Word';
      }
    }

    const colorMap = {
      red: { bg: 'from-red-500 to-rose-600 shadow-red-500/20 group-hover:shadow-red-500/30', text: 'text-red-500', groupHoverText: 'group-hover:text-red-700' },
      blue: { bg: 'from-blue-500 to-indigo-600 shadow-blue-500/20 group-hover:shadow-blue-500/30', text: 'text-blue-500', groupHoverText: 'group-hover:text-blue-700' },
      emerald: { bg: 'from-emerald-500 to-teal-600 shadow-emerald-500/20 group-hover:shadow-emerald-500/30', text: 'text-emerald-500', groupHoverText: 'group-hover:text-emerald-700' },
      orange: { bg: 'from-orange-500 to-amber-600 shadow-orange-500/20 group-hover:shadow-orange-500/30', text: 'text-orange-500', groupHoverText: 'group-hover:text-amber-700' },
    };
    
    const c = colorMap[docColor] || colorMap.blue;

    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="mt-4 mb-1 rounded-2xl overflow-hidden cursor-pointer group"
        onClick={onClick}
      >
        <div className="relative bg-gradient-to-br from-slate-50 via-slate-50/50 to-slate-100/30 dark:from-slate-800/10 dark:via-slate-800/50 dark:to-slate-800/30 border border-slate-200/60 dark:border-slate-700/50 p-5 flex items-center gap-4 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-600 group-hover:shadow-soft">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.bg} flex items-center justify-center shadow-lg transition-shadow`}>
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
              <Download className={`w-3 h-3 ${c.text}`} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-0.5 truncate">
              {item.fileName || docTitle}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
              {item.fileSize ? `${(item.fileSize / 1024).toFixed(0)} KB · ` : ''}{docDesc}
            </p>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${c.text} ${c.groupHoverText} transition-colors`}>
              <Eye className="w-3.5 h-3.5" /> Previsualizar documento
            </span>
          </div>
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center ${c.text}`}>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
}

function LinkPreview({ item }) {
  if (!item.linkUrl) return null;
  return (
    <motion.a
      href={item.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 mt-4 mb-1 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700/50 transition-all group hover:shadow-soft"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
        <ExternalLink className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">{item.linkUrl}</p>
        <p className="text-xs text-slate-400 mt-0.5">Abrir enlace externo</p>
      </div>
      <Link2 className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
    </motion.a>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'md', avatarUrl }) {
  if (avatarUrl) {
    const sizeClass = size === 'sm' ? 'w-7 h-7' : 'w-11 h-11';
    return <img src={avatarUrl} alt={name || 'Avatar'} className={`${sizeClass} rounded-full object-cover shrink-0 ring-2 ring-white dark:ring-slate-800`} />;
  }
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'U';
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-11 h-11 text-sm';
  const gradients = ['from-blue-500 to-cyan-400', 'from-violet-500 to-purple-400', 'from-emerald-500 to-teal-400', 'from-orange-500 to-amber-400', 'from-rose-500 to-pink-400'];
  const idx = (name?.charCodeAt(0) ?? 0) % gradients.length;
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${gradients[idx]} text-white flex items-center justify-center font-bold shrink-0 ring-2 ring-white dark:ring-slate-800`}>
      {initials}
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({ comment, isAdmin, onDelete, publicationId }) {
  const authorName = comment.profiles?.display_name || 'Usuario';
  const time = timeAgo(comment.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 group relative"
    >
      <Avatar name={authorName} size="sm" avatarUrl={comment.profiles?.avatar_url} />
      <div className="flex-1 bg-white/80 dark:bg-slate-800/80 rounded-2xl px-3.5 py-2.5 border border-slate-100/80 dark:border-slate-700/50">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-white">{authorName}</span>
            <span className="text-[10px] text-slate-400">{time}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => onDelete(comment.id, publicationId)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
              title="Borrar comentario"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{comment.content}</p>
      </div>
    </motion.div>
  );
}

// ─── Main FeedCard ────────────────────────────────────────────────────────────

export default function FeedCard({ item, onToggleSave, isSaved = false, onViewDetail }) {
  const { toggleLike, addComment, deleteComment } = useContentContext();
  const { user } = useAuth();

  const schoolStyle = SCHOOL_COLORS[item.school] || SCHOOL_COLORS['Todas'];
  const typeColor = TYPE_COLORS[item.type] || 'bg-slate-50 text-slate-500';

  // State derived directly from the loaded item
  const [likeAnim, setLikeAnim] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likersList, setLikersList] = useState([]);
  const [isLoadingLikers, setIsLoadingLikers] = useState(false);

  const { getPublicationLikes } = useContentContext();

  // Load likers when admin requests it
  useEffect(() => {
    if (showLikesModal && user?.role === 'admin') {
      setIsLoadingLikers(true);
      getPublicationLikes(item.id).then((users) => {
        setLikersList(users);
        setIsLoadingLikers(false);
      });
    }
  }, [showLikesModal, item.id]);

  const liked = item.has_liked;
  const likeCount = item.likes ?? 0;

  const handleLike = async () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 400);
    await toggleLike(item.id, liked);
  };

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const comments = item.comments || [];

  const handleAddComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    await addComment(item.id, text);
    setCommentText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-800/90 rounded-3xl shadow-soft hover:shadow-soft-lg border border-slate-100/80 dark:border-slate-700/50 overflow-hidden transition-shadow duration-500"
    >
      <div className="px-6 pt-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {item.has_linked_author ? (
              <Link to={`/u/${item._author_id}`} onClick={(e) => e.stopPropagation()}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Avatar name={item.author} avatarUrl={item.author_avatar} />
                </motion.div>
              </Link>
            ) : (
              <Avatar name={item.author} avatarUrl={item.author_avatar} />
            )}
            <div>
              {item.has_linked_author ? (
                <Link
                  to={`/u/${item._author_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {item.author}
                </Link>
              ) : (
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
                  {item.author}
                </h3>
              )}
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${schoolStyle.dot}`} />
                <span>{item.school}</span>
                <span className="text-slate-300">·</span>
                <span>{timeAgo(item.date)}</span>
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${typeColor}`}>
            {item.type}
          </span>
        </div>

        {/* Content */}
        <div className="mb-2">
          <h2
            className="text-lg font-bold text-slate-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug"
            onClick={() => onViewDetail?.()}
          >
            {item.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-[1.7]">
            {item.excerpt}
            <button
              onClick={() => onViewDetail?.()}
              className="text-blue-500 dark:text-blue-400 text-sm font-semibold ml-1.5 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Leer más
            </button>
          </p>
          <MediaPreview item={item} onClick={() => onViewDetail?.()} />
          <LinkPreview item={item} />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100/80 dark:border-slate-700/40">
          <div className="flex items-center gap-0.5">
            {/* Like */}
            <motion.button
              onClick={handleLike}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.85 }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${liked
                ? 'text-rose-500 bg-rose-50/80 dark:bg-rose-900/15'
                : 'text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50/80 dark:hover:bg-rose-900/10'
                }`}
            >
              <motion.div animate={likeAnim ? { scale: [1, 1.4, 0.9, 1.15, 1] } : {}} transition={{ duration: 0.4 }}>
                <Heart className="w-[18px] h-[18px]" fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.75} />
              </motion.div>
              <button
                className={`text-xs tabular-nums transition-colors ${user?.role === 'admin' && likeCount > 0 ? 'hover:underline cursor-pointer' : 'cursor-default'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (user?.role === 'admin' && likeCount > 0) setShowLikesModal(true);
                }}
              >
                {likeCount}
              </button>
            </motion.button>

            {/* Comment toggle */}
            <motion.button
              onClick={() => setShowComments((p) => !p)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium transition-all ${showComments
                ? 'text-blue-500 bg-blue-50/80 dark:bg-blue-900/15'
                : 'text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50/80 dark:hover:bg-blue-900/10'
                }`}
            >
              <MessageCircle className="w-[18px] h-[18px]" fill={showComments ? 'currentColor' : 'none'} strokeWidth={showComments ? 0 : 1.75} />
              <span className="text-xs tabular-nums">{comments.length}</span>
              {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => onToggleSave?.(item.id)}
            className={`p-2.5 rounded-xl transition-all ${isSaved ? 'text-amber-500 bg-amber-50/80 dark:bg-amber-900/15' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50/80 dark:hover:bg-amber-900/10'}`}
            title={isSaved ? 'Guardado' : 'Guardar'}
          >
            <Bookmark className="w-[18px] h-[18px]" fill={isSaved ? 'currentColor' : 'none'} strokeWidth={isSaved ? 0 : 1.75} />
          </motion.button>
        </div>
      </div>

      {/* Comments Panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            key="comments"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-4 border-t border-slate-100/80 dark:border-slate-700/40 bg-gradient-to-b from-slate-50/60 to-white/0 dark:from-slate-900/30 dark:to-transparent">
              <div className="space-y-3">
                {comments.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Sé el primero en comentar.</p>
                )}
                <AnimatePresence initial={false}>
                  {comments.map((c) => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      isAdmin={user?.role === 'admin'}
                      onDelete={deleteComment}
                      publicationId={item.id}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div className="flex items-center gap-2.5 mt-4">
                <Avatar name="Tú" size="sm" avatarUrl={user?.avatar_url} />
                <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-600/50 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-300 dark:focus-within:border-blue-600 transition-all">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none"
                  />
                  <Smile className="w-4 h-4 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-md shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Likers Modal */}
      <AnimatePresence>
        {showLikesModal && user?.role === 'admin' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLikesModal(false)}
              className="fixed inset-0 bg-slate-900/30 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-soft-lg z-50 overflow-hidden text-left border border-slate-200/80 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700/50">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />
                  Me gusta
                </h3>
                <button
                  onClick={() => setShowLikesModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
              </div>
              <div className="p-2 max-h-[60vh] overflow-y-auto">
                {isLoadingLikers ? (
                  <p className="text-center text-sm text-slate-400 py-6">Cargando...</p>
                ) : likersList.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-6">Aún no hay likes.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {likersList.map(liker => (
                      <div key={liker.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                        <Avatar name={liker.display_name} size="md" avatarUrl={liker.avatar_url} />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{liker.display_name}</p>
                          <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{liker.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
