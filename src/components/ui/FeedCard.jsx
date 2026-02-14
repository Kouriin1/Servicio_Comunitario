import { motion } from 'framer-motion';
import { Bookmark, ExternalLink, Heart, FileText, Video, Image, Link2, Play } from 'lucide-react';
import Card from '../ui/Card';

function MediaPreview({ item, onClick }) {
  if (!item.fileType || !item.fileUrl) return null;

  if (item.fileType === 'image') {
    return (
      <div className="relative -mx-6 -mt-6 mb-4 cursor-pointer overflow-hidden" onClick={onClick}>
        <img
          src={item.fileUrl}
          alt={item.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
    );
  }

  if (item.fileType === 'video') {
    return (
      <div className="relative -mx-6 -mt-6 mb-4 cursor-pointer overflow-hidden bg-slate-900" onClick={onClick}>
        <video
          src={item.fileUrl}
          className="w-full h-44 object-cover opacity-70"
          preload="metadata"
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-white/80 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-usm-blue ml-1" />
          </div>
        </div>
      </div>
    );
  }

  if (item.fileType === 'pdf') {
    return (
      <div
        className="relative -mx-6 -mt-6 mb-4 cursor-pointer overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 h-32 flex items-center justify-center"
        onClick={onClick}
      >
        <div className="text-center">
          <FileText className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-1" />
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 truncate max-w-[200px] px-4">{item.fileName || 'Documento PDF'}</p>
        </div>
      </div>
    );
  }

  if (item.fileType === 'link') {
    return (
      <div
        className="relative -mx-6 -mt-6 mb-4 cursor-pointer overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/10 h-28 flex items-center justify-center"
        onClick={onClick}
      >
        <div className="text-center">
          <Link2 className="w-8 h-8 text-usm-blue dark:text-blue-400 mx-auto mb-1" />
          <p className="text-xs font-semibold text-usm-blue dark:text-blue-300 truncate max-w-[200px] px-4">Enlace externo</p>
        </div>
      </div>
    );
  }

  return null;
}

export default function FeedCard({ item, onToggleSave, isSaved = false, onViewDetail }) {
  const getFacultyColor = (faculty) => {
    const colors = {
      'Ingeniería': 'bg-orange-500',
      'FACES': 'bg-green-500',
      'Derecho': 'bg-red-500',
      'Odontología': 'bg-purple-500',
      'Farmacia': 'bg-blue-500',
      'Todas': 'bg-usm-blue'
    };
    return colors[faculty] || 'bg-gray-500';
  };

  const hasMedia = item.fileType && item.fileUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="break-inside-avoid mb-6"
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-800 dark:border-slate-700 group">
        <MediaPreview item={item} onClick={() => onViewDetail?.()} />

        <div
          className="flex items-center gap-3 mb-4 cursor-pointer"
          onClick={() => onViewDetail?.()}
        >
          <div className={`w-2 h-8 rounded-full ${getFacultyColor(item.faculty)}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-slate-500">{item.type}</span>
              {item.fileType && !hasMedia && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  {item.fileType === 'pdf' && <FileText className="w-3 h-3" />}
                  {item.fileType === 'video' && <Video className="w-3 h-3" />}
                  {item.fileType === 'image' && <Image className="w-3 h-3" />}
                  {item.fileType === 'link' && <Link2 className="w-3 h-3" />}
                  <span className="text-[9px] uppercase font-bold">{item.fileType}</span>
                </span>
              )}
            </div>
            <h3 className="font-bold text-usm-blue dark:text-white leading-tight group-hover:text-usm-blue-bright transition-colors">{item.title}</h3>
          </div>
        </div>

        <p
          className="text-gray-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 italic cursor-pointer"
          onClick={() => onViewDetail?.()}
        >
          "{item.excerpt}"
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-usm-blue flex items-center justify-center text-white text-xs font-bold">
              {item.author[0]}
            </div>
            <span className="text-xs font-semibold text-usm-blue dark:text-blue-300">{item.author}</span>
          </div>

          <div className="flex gap-3 text-gray-400 dark:text-slate-500">
            <button className="hover:text-usm-yellow transition-colors"><Heart className="w-4 h-4" /></button>
            <button onClick={() => onToggleSave?.(item.id)} className={`transition-colors ${isSaved ? 'text-usm-blue-bright' : 'hover:text-usm-blue-bright'}`}><Bookmark className="w-4 h-4" /></button>
            <button onClick={() => onViewDetail?.()} className="hover:text-usm-blue-bright transition-colors"><ExternalLink className="w-4 h-4" /></button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
