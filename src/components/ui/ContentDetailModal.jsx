import Modal from './Modal';
import { Calendar, MapPin, Clock, User, Building2, FileText, Video, Image, ExternalLink, Download } from 'lucide-react';

const facultyColors = {
  'Ingeniería': 'bg-orange-500',
  'FACES': 'bg-green-500',
  'Derecho': 'bg-red-500',
  'Odontología': 'bg-purple-500',
  'Farmacia': 'bg-blue-500',
  'Todas': 'bg-usm-blue',
};

function MediaViewer({ item }) {
  if (!item.fileType || !item.fileUrl) return null;

  if (item.fileType === 'video') {
    return (
      <div className="rounded-xl overflow-hidden bg-black">
        <video
          src={item.fileUrl}
          controls
          className="w-full max-h-[360px]"
          preload="metadata"
        >
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
    );
  }

  if (item.fileType === 'pdf') {
    return (
      <div className="space-y-2">
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
          <iframe
            src={item.fileUrl}
            title={item.fileName || 'Documento PDF'}
            className="w-full h-[400px]"
          />
        </div>
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={item.fileName}
          className="inline-flex items-center gap-2 text-sm text-usm-blue dark:text-blue-300 hover:underline"
        >
          <Download className="w-4 h-4" /> Descargar PDF
        </a>
      </div>
    );
  }

  if (item.fileType === 'image') {
    return (
      <div className="rounded-xl overflow-hidden">
        <img
          src={item.fileUrl}
          alt={item.title}
          className="w-full max-h-[400px] object-contain bg-slate-100 dark:bg-slate-700"
        />
      </div>
    );
  }

  if (item.fileType === 'link') {
    return (
      <a
        href={item.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
      >
        <div className="w-10 h-10 rounded-lg bg-usm-blue/10 dark:bg-blue-900/30 flex items-center justify-center text-usm-blue dark:text-blue-300">
          <ExternalLink className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-usm-blue dark:text-blue-300 group-hover:underline truncate">
            {item.fileName || item.fileUrl}
          </p>
          <p className="text-xs text-slate-400">Abrir enlace externo</p>
        </div>
      </a>
    );
  }

  return null;
}

function FileTypeBadge({ fileType }) {
  if (!fileType) return null;
  const config = {
    pdf: { icon: <FileText className="w-3.5 h-3.5" />, label: 'PDF', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
    video: { icon: <Video className="w-3.5 h-3.5" />, label: 'Video', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
    image: { icon: <Image className="w-3.5 h-3.5" />, label: 'Imagen', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
    link: { icon: <ExternalLink className="w-3.5 h-3.5" />, label: 'Enlace', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
  };
  const c = config[fileType];
  if (!c) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.color}`}>
      {c.icon} {c.label}
    </span>
  );
}

export default function ContentDetailModal({ isOpen, onClose, item }) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.type}>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-6 rounded-full ${facultyColors[item.faculty] || 'bg-gray-500'}`} />
          <h3 className="text-lg font-bold text-usm-blue dark:text-white leading-tight">{item.title}</h3>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" /> {item.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> {item.faculty}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {item.date}
          </span>
          {item.readTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {item.readTime}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {item.location}
            </span>
          )}
          <FileTypeBadge fileType={item.fileType} />
        </div>

        <MediaViewer item={item} />

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic">
            "{item.excerpt}"
          </p>
        </div>

        {!item.fileUrl && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">
              Esta publicación no tiene archivos adjuntos. El administrador puede agregar PDFs, videos o enlaces desde el panel.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
