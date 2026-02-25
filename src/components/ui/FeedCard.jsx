import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Trash2,
  FileText,
  Link2,
  Send,
  ChevronDown,
  ChevronUp,
  Smile,
  MoreHorizontal,
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
  Derecho: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', dot: 'bg-red-400' },
  'Estudios Internacionales': { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-400' },
  Todas: { badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
};

const TYPE_COLORS = {
  Tesis: 'bg-usm-blue/10 text-usm-blue dark:bg-blue-900/30 dark:text-blue-300',
  Artículo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Evento: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

// ─── Media Previews ──────────────────────────────────────────────────────────

function MediaPreview({ item, onClick }) {
  if (!item.fileType || !item.fileUrl) return null;
  const base = 'relative mt-3 mb-3 rounded-xl overflow-hidden cursor-pointer group bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700';

  if (item.fileType === 'image') {
    return (
      <div className={base} onClick={onClick}>
        <img src={item.fileUrl} alt={item.title} className="w-full max-h-[400px] object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  if (item.fileType === 'video') {
    return (
      <div className={`${base} aspect-video`} onClick={onClick}>
        <video src={item.fileUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (item.fileType === 'pdf') {
    return (
      <div className={`${base} h-32 flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors`} onClick={onClick}>
        <div className="bg-red-100 text-red-600 p-3 rounded-lg">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <p className="font-bold text-slate-700 dark:text-white mb-1">Documento PDF</p>
          <p className="text-xs text-slate-500">Click para previsualizar</p>
        </div>
      </div>
    );
  }
  return null;
}

function LinkPreview({ item }) {
  if (!item.linkUrl) return null;
  return (
    <a
      href={item.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 mt-3 mb-3 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
    >
      <div className="w-10 h-10 rounded-lg bg-usm-blue/10 dark:bg-blue-900/30 flex items-center justify-center text-usm-blue dark:text-blue-300 shrink-0">
        <ExternalLink className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-usm-blue dark:text-blue-300 group-hover:underline truncate">{item.linkUrl}</p>
        <p className="text-xs text-slate-400">Abrir enlace externo</p>
      </div>
      <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
    </a>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'md', avatarUrl }) {
  if (avatarUrl) {
    const sizeClass = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
    return <img src={avatarUrl} alt={name || 'Avatar'} className={`${sizeClass} rounded-full object-cover shrink-0 border bg-white`} />;
  }
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'U';
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-10 h-10 text-sm';
  const gradients = ['from-blue-500 to-cyan-400', 'from-purple-500 to-pink-400', 'from-green-500 to-emerald-400', 'from-orange-500 to-amber-400', 'from-red-500 to-rose-400'];
  const idx = (name?.charCodeAt(0) ?? 0) % gradients.length;
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${gradients[idx]} text-white flex items-center justify-center font-bold shrink-0`}>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 group relative"
    >
      <Avatar name={authorName} size="sm" avatarUrl={comment.profiles?.avatar_url} />
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-700">
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
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{comment.content}</p>
      </div>
    </motion.div>
  );
}

// ─── Main FeedCard ────────────────────────────────────────────────────────────

export default function FeedCard({ item, onToggleSave, isSaved = false, onViewDetail }) {
  const { toggleLike, addComment, deleteComment } = useContentContext();
  const { user } = useAuth();

  const schoolStyle = SCHOOL_COLORS[item.school] || SCHOOL_COLORS['Todas'];
  const typeColor = TYPE_COLORS[item.type] || 'bg-slate-100 text-slate-600';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {item.has_linked_author ? (
              <Link to={`/u/${item._author_id}`} onClick={(e) => e.stopPropagation()}>
                <Avatar name={item.author} avatarUrl={item.author_avatar} />
              </Link>
            ) : (
              <Avatar name={item.author} avatarUrl={item.author_avatar} />
            )}
            <div>
              {item.has_linked_author ? (
                <Link
                  to={`/u/${item._author_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-bold text-slate-900 dark:text-white leading-tight hover:text-usm-blue dark:hover:text-blue-400 transition-colors"
                >
                  {item.author}
                </Link>
              ) : (
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {item.author}
                </h3>
              )}
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${schoolStyle.dot}`} />
                <span>{item.school}</span>
                <span>·</span>
                <span>{timeAgo(item.date)}</span>
              </p>
            </div>
          </div>
          <button className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-widest mb-2.5 ${typeColor}`}>
            {item.type}
          </span>
          <h2
            className="text-base font-bold text-slate-900 dark:text-white mb-2 cursor-pointer hover:text-usm-blue dark:hover:text-blue-400 transition-colors leading-snug"
            onClick={() => onViewDetail?.()}
          >
            {item.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {item.excerpt}
            <button
              onClick={() => onViewDetail?.()}
              className="text-usm-blue dark:text-blue-400 text-xs font-bold ml-1 hover:underline"
            >
              Leer más
            </button>
          </p>
          <MediaPreview item={item} onClick={() => onViewDetail?.()} />
          <LinkPreview item={item} />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1">
            {/* Like */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium">
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.8 }}
                className={`flex items-center transition-all ${liked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-red-500'
                  }`}
              >
                <motion.div animate={likeAnim ? { scale: [1, 1.5, 0.9, 1.1, 1] } : {}} transition={{ duration: 0.4 }}>
                  <Heart className="w-[18px] h-[18px] transition-all" fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.75} />
                </motion.div>
              </motion.button>

              <button
                className={`text-xs tabular-nums transition-colors ${user?.role === 'admin' ? 'hover:underline cursor-pointer text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400 cursor-default'}`}
                onClick={() => {
                  if (user?.role === 'admin' && likeCount > 0) {
                    setShowLikesModal(true);
                  }
                }}
              >
                {likeCount}
              </button>
            </div>

            {/* Comment toggle */}
            <button
              onClick={() => setShowComments((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${showComments
                ? 'text-usm-blue bg-blue-50 dark:bg-blue-900/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-usm-blue hover:bg-blue-50 dark:hover:bg-blue-900/10'
                }`}
            >
              <MessageCircle className="w-[18px] h-[18px]" fill={showComments ? 'currentColor' : 'none'} strokeWidth={showComments ? 0 : 1.75} />
              <span className="text-xs tabular-nums">{comments.length}</span>
              {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Share */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all">
              <Share2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 rounded-xl text-slate-400 hover:text-usm-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors" title="Descargar">
              <Download className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => onToggleSave?.(item.id)}
              className={`p-2 rounded-xl transition-all ${isSaved ? 'text-usm-yellow bg-yellow-50 dark:bg-yellow-900/20' : 'text-slate-400 hover:text-usm-yellow hover:bg-yellow-50 dark:hover:bg-yellow-900/10'}`}
              title={isSaved ? 'Guardado' : 'Guardar'}
            >
              <Bookmark className="w-[18px] h-[18px]" fill={isSaved ? 'currentColor' : 'none'} strokeWidth={isSaved ? 0 : 1.75} />
            </motion.button>
          </div>
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
            <div className="px-5 pb-5 pt-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40">
              <div className="space-y-3">
                {comments.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-3">Sé el primero en comentar.</p>
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
              <div className="flex items-center gap-2 mt-4">
                <Avatar name="Tú" size="sm" avatarUrl={user?.avatar_url} />
                <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-usm-blue/50 transition-all">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none"
                  />
                  <Smile className="w-4 h-4 text-slate-300 hover:text-yellow-500 cursor-pointer transition-colors" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="w-8 h-8 rounded-full bg-usm-blue text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
              className="fixed inset-0 bg-slate-900/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-left border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                  Me gusta
                </h3>
                <button
                  onClick={() => setShowLikesModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
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
