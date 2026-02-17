import { motion } from 'framer-motion';
import {
  Bookmark,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Download,
  MoreHorizontal,
  FileText,
  Video,
  Image as ImageIcon,
  Link2,
  Calendar
} from 'lucide-react';
import Card from '../ui/Card';

function MediaPreview({ item, onClick }) {
  if (!item.fileType || !item.fileUrl) return null;

  const containerClass = "relative mt-3 mb-3 rounded-xl overflow-hidden cursor-pointer group bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700";

  if (item.fileType === 'image') {
    return (
      <div className={containerClass} onClick={onClick}>
        <img
          src={item.fileUrl}
          alt={item.title}
          className="w-full max-h-[400px] object-cover"
        />
      </div>
    );
  }

  if (item.fileType === 'video') {
    return (
      <div className={`${containerClass} aspect-video flex items-center justify-center`} onClick={onClick}>
        <Video className="w-12 h-12 text-slate-400" />
      </div>
    );
  }

  if (item.fileType === 'pdf') {
    return (
      <div className={`${containerClass} h-32 flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors`} onClick={onClick}>
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

export default function FeedCard({ item, onToggleSave, isSaved = false, onViewDetail }) {
  const getFacultyColor = (faculty) => {
    const colors = {
      'Ingeniería': 'bg-orange-100 text-orange-700',
      'FACES': 'bg-green-100 text-green-700',
      'Derecho': 'bg-red-100 text-red-700',
      'Odontología': 'bg-purple-100 text-purple-700',
      'Farmacia': 'bg-blue-100 text-blue-700',
      'Todas': 'bg-gray-100 text-gray-700'
    };
    return colors[faculty] || 'bg-gray-100 text-gray-700';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5"
    >
      {/* Header: Author Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
            {item.author?.[0] || 'U'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {item.author}
              <span className="text-slate-400 font-normal mx-1">•</span>
              <span className="text-usm-blue dark:text-blue-400 hover:underline cursor-pointer">Seguir</span>
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span>{item.faculty}</span>
              <span>•</span>
              <span>Hace 2h</span>
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content Body */}
      <div className="mb-4">
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mb-2 ${getFacultyColor(item.faculty)}`}>
          {item.type}
        </span>
        <h2
          className="text-lg font-bold text-slate-900 dark:text-white mb-2 cursor-pointer hover:text-usm-blue dark:hover:text-blue-400 transition-colors"
          onClick={() => onViewDetail?.()}
        >
          {item.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
          {item.excerpt}
          <span className="text-usm-blue text-xs font-bold cursor-pointer ml-1 hover:underline">Leer más</span>
        </p>

        <MediaPreview item={item} onClick={() => onViewDetail?.()} />
      </div>

      {/* Footer: Social Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors group">
            <Heart className="w-5 h-5 group-hover:fill-red-500" />
            <span className="text-xs font-medium">24</span>
          </button>
          <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-usm-blue transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">5</span>
          </button>
          <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-green-500 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-usm-blue transition-colors" title="Descargar">
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => onToggleSave?.(item.id)}
            className={`transition-colors ${isSaved ? 'text-usm-yellow fill-usm-yellow' : 'text-slate-400 hover:text-usm-yellow'}`}
            title="Guardar"
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
