import Modal from './Modal';
import { Calendar, MapPin, Clock, User, Building2, FileText, Video, Image, ExternalLink, Download } from 'lucide-react';

const schoolColors = {
  'Facultad de Derecho': 'bg-indigo-500',
  'Todas las Facultades': 'bg-indigo-500',
  'Escuela de Derecho': 'bg-rose-500',
  'Escuela de Estudios Internacionales': 'bg-blue-500',
  'Derecho': 'bg-rose-500',
  'Estudios Internacionales': 'bg-blue-500',
  'Todas': 'bg-indigo-500',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function MediaViewer({ item }) {
  const hasFile = item.fileType && item.fileUrl;
  const hasLink = !!item.linkUrl;

  if (!hasFile && !hasLink) return null;

  return (
    <div className="space-y-3">
      {hasFile && item.fileType === 'video' && (
        <div className="rounded-2xl overflow-hidden bg-black shadow-soft">
          <video
            src={item.fileUrl}
            controls
            className="w-full max-h-[480px]"
            preload="metadata"
          >
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      )}

      {hasFile && item.fileType === 'pdf' && (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 shadow-soft">
            <iframe
              src={item.fileUrl}
              title={item.fileName || 'Documento PDF'}
              className="w-full h-[70vh] min-h-[500px]"
            />
          </div>
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={item.fileName}
            className="inline-flex items-center gap-2 text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </a>
        </div>
      )}

      {hasFile && item.fileType === 'document' && (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 shadow-soft">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.fileUrl)}`}
              title={item.fileName || 'Documento de Office'}
              className="w-full h-[70vh] min-h-[500px]"
              frameBorder="0"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center text-sm text-slate-500 dark:text-slate-400">
            <span>Si la previsualización no carga, puedes descargarlo:</span>
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={item.fileName}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-sm shadow-blue-500/20"
            >
              <Download className="w-5 h-5" /> Descargar archivo original
            </a>
          </div>
        </div>
      )}

      {hasFile && item.fileType === 'image' && (
        <div className="rounded-2xl overflow-hidden shadow-soft">
          <img
            src={item.fileUrl}
            alt={item.title}
            className="w-full max-h-[500px] object-contain bg-slate-100 dark:bg-slate-700"
          />
        </div>
      )}

      {hasLink && (
        <a
          href={item.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100/80 dark:border-slate-600/50 bg-slate-50/80 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all group shadow-soft"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-500 dark:text-blue-400 group-hover:underline truncate">
              {item.linkUrl}
            </p>
            <p className="text-xs text-slate-400">Abrir enlace externo</p>
          </div>
        </a>
      )}
    </div>
  );
}

function FileTypeBadge({ fileType }) {
  if (!fileType) return null;
  const config = {
    pdf: { icon: <FileText className="w-3.5 h-3.5" />, label: 'PDF', color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
    document: { icon: <FileText className="w-3.5 h-3.5" />, label: 'Documento', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
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
        {/* Título */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-6 rounded-full ${schoolColors[item.school] || 'bg-gray-500'}`} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{item.title}</h3>
        </div>

        {/* Descripción primero */}
        <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-2xl p-5">
          <p className="text-slate-700 dark:text-slate-200 text-[15px] leading-[1.8]">
            {item.excerpt}
          </p>
        </div>

        {/* Media */}
        <MediaViewer item={item} />

        {/* Detalles / Metadatos después */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/50">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" /> {item.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> {item.school}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {formatDate(item.date)}
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
          {item.linkUrl && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <ExternalLink className="w-3.5 h-3.5" /> Enlace
            </span>
          )}
        </div>

        {!item.fileUrl && !item.linkUrl && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">
              Esta publicación no tiene archivos adjuntos. El administrador puede agregar PDFs, videos, imágenes o enlaces desde el panel.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
