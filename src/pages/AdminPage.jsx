import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FilePlus2, ListFilter, Pencil, Trash2, Eye, ArrowLeft, Check,
  Upload, FileText, Video, Image, Link2, X,
} from 'lucide-react';
import { useContentContext } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { faculties, contentTypes } from '../mockData';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContentDetailModal from '../components/ui/ContentDetailModal';

const emptyForm = {
  title: '', excerpt: '', type: 'Tesis', faculty: 'Ingeniería', author: '',
  fileUrl: null, fileType: null, fileName: null, linkUrl: null,
};

const ACCEPTED_FILES = {
  pdf: '.pdf',
  video: '.mp4,.webm,.ogg,.mov',
  image: '.jpg,.jpeg,.png,.gif,.webp',
};
const ALL_ACCEPTED = Object.values(ACCEPTED_FILES).join(',');

function getFileType(file) {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.startsWith('image/')) return 'image';
  return 'link';
}

function FileTypeIcon({ fileType, className = 'w-4 h-4' }) {
  if (fileType === 'pdf') return <FileText className={className} />;
  if (fileType === 'video') return <Video className={className} />;
  if (fileType === 'image') return <Image className={className} />;
  if (fileType === 'link') return <Link2 className={className} />;
  return null;
}

export default function AdminPage() {
  const { allContent, addContent, deleteContent, updateContent } = useContentContext();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState('Todos');
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const publications = selectedType === 'Todos'
    ? allContent
    : allContent.filter((item) => item.type === selectedType);

  const handleFileSelect = (file, isEdit = false) => {
    if (!file) return;
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      showToast('El archivo excede el límite de 100MB', 'error');
      return;
    }
    const fileType = getFileType(file);
    const fileUrl = URL.createObjectURL(file);
    if (isEdit && editingItem) {
      setEditingItem({ ...editingItem, fileUrl, fileType, fileName: file.name });
    } else {
      setForm({ ...form, fileUrl, fileType, fileName: file.name });
    }
    showToast(`${file.name} adjuntado`, 'success');
  };

  const handleRemoveFile = (isEdit = false) => {
    if (isEdit && editingItem) {
      if (editingItem.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(editingItem.fileUrl);
      setEditingItem({ ...editingItem, fileUrl: null, fileType: null, fileName: null });
    } else {
      if (form.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(form.fileUrl);
      setForm({ ...form, fileUrl: null, fileType: null, fileName: null });
    }
  };

  const handleLinkUrl = (url, isEdit = false) => {
    if (isEdit && editingItem) {
      setEditingItem({ ...editingItem, linkUrl: url });
    } else {
      setForm({ ...form, linkUrl: url });
    }
  };

  const handleRemoveLink = (isEdit = false) => {
    if (isEdit && editingItem) {
      setEditingItem({ ...editingItem, linkUrl: null });
    } else {
      setForm({ ...form, linkUrl: null });
    }
  };

  const handlePublish = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim()) {
      showToast('Completa título y descripción', 'error');
      return;
    }
    addContent({
      ...form,
      author: form.author.trim() || user?.name || 'Administrador',
      readTime: form.type !== 'Evento' ? '5 min' : undefined,
      location: form.type === 'Evento' ? 'Por definir' : undefined,
    });
    showToast('Publicación creada exitosamente', 'success');
    setForm(emptyForm);
  };

  const handleEdit = (event) => {
    event.preventDefault();
    if (!editingItem) return;
    updateContent(editingItem.id, {
      title: editingItem.title,
      excerpt: editingItem.excerpt,
      type: editingItem.type,
      faculty: editingItem.faculty,
      fileUrl: editingItem.fileUrl,
      fileType: editingItem.fileType,
      fileName: editingItem.fileName,
      linkUrl: editingItem.linkUrl,
    });
    showToast('Publicación actualizada', 'success');
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    deleteContent(id);
    showToast('Publicación eliminada', 'info');
  };

  const FileUploadArea = ({ currentFile, onFileSelect, onRemove, inputRef, isEdit = false }) => (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Adjuntar archivo (opcional)
      </label>

      {currentFile?.fileName ? (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
          <div className="w-10 h-10 rounded-lg bg-usm-blue/10 dark:bg-blue-900/30 flex items-center justify-center text-usm-blue dark:text-blue-300">
            <FileTypeIcon fileType={currentFile.fileType} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{currentFile.fileName}</p>
            <p className="text-xs text-slate-400 uppercase">{currentFile.fileType}</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(isEdit)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-usm-blue dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Click para subir archivo
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, Video (MP4, WebM), Imagen (JPG, PNG) - Max 100MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ALL_ACCEPTED}
            className="hidden"
            onChange={(e) => {
              onFileSelect(e.target.files[0], isEdit);
              e.target.value = '';
            }}
          />
        </>
      )}
    </div>
  );

  const LinkInputArea = ({ currentLink, onLinkUrl, onRemoveLink, isEdit = false }) => (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Enlace externo (opcional)
      </label>
      <div className="flex gap-2">
        <input
          type="url"
          value={currentLink || ''}
          onChange={(e) => onLinkUrl(e.target.value, isEdit)}
          placeholder="https://ejemplo.com/recurso"
          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm dark:bg-slate-700 dark:text-white"
        />
        {currentLink && (
          <button
            type="button"
            onClick={() => onRemoveLink(isEdit)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="bg-usm-blue rounded-2xl p-6 md:p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Panel Administrador</h1>
              <p className="text-blue-100">Gestiona publicaciones, categorías y contenido académico.</p>
            </div>
            <Link
              to="/dashboard"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Formulario de publicación */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4 text-usm-blue dark:text-blue-300">
              <FilePlus2 className="w-5 h-5" />
              <h2 className="text-xl font-bold">Publicar nuevo contenido</h2>
            </div>

            <form className="space-y-4" onSubmit={handlePublish}>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
                placeholder="Título"
                required
              />
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
                placeholder="Autor (opcional)"
              />
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
                placeholder="Descripción"
                required
              />

              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
              >
                {contentTypes.filter((t) => t !== 'Todos').map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
              >
                {faculties.filter((f) => f !== 'Todas').map((faculty) => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>

              <FileUploadArea
                currentFile={form}
                onFileSelect={handleFileSelect}
                onRemove={handleRemoveFile}
                inputRef={fileInputRef}
              />

              <LinkInputArea
                currentLink={form.linkUrl}
                onLinkUrl={handleLinkUrl}
                onRemoveLink={handleRemoveLink}
              />

              <Button type="submit" className="w-full flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Guardar publicación
              </Button>
            </form>
          </motion.article>

          {/* Lista de publicaciones */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-usm-blue dark:text-white">
                Publicaciones existentes ({publications.length})
              </h2>
              <div className="flex items-center gap-3">
                <ListFilter className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm dark:bg-slate-700 dark:text-white"
                >
                  {contentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 max-h-[540px] overflow-auto pr-1">
              {publications.map((item) => (
                <article
                  key={item.id}
                  className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.type} · {item.faculty}</p>
                      {item.fileType && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-usm-blue dark:text-blue-300 text-[10px] font-bold uppercase">
                          <FileTypeIcon fileType={item.fileType} className="w-3 h-3" />
                          {item.fileType}
                        </span>
                      )}
                      {item.linkUrl && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 text-[10px] font-bold uppercase">
                          <Link2 className="w-3 h-3" />
                          enlace
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-usm-blue dark:text-white leading-tight">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.author}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewItem(item)}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setEditingItem({ ...item }); setShowEditModal(true); }}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
              {publications.length === 0 && (
                <p className="text-center text-slate-400 py-8">No hay publicaciones de este tipo.</p>
              )}
            </div>
          </motion.article>
        </section>

        {/* Mobile back link */}
        <div className="md:hidden text-center">
          <Link to="/dashboard" className="text-usm-blue dark:text-blue-300 text-sm hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </Link>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar publicación">
        {editingItem && (
          <form className="space-y-4" onSubmit={handleEdit}>
            <input
              value={editingItem.title}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
              placeholder="Título"
            />
            <textarea
              rows={3}
              value={editingItem.excerpt}
              onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
              placeholder="Descripción"
            />
            <select
              value={editingItem.type}
              onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
            >
              {contentTypes.filter((t) => t !== 'Todos').map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={editingItem.faculty}
              onChange={(e) => setEditingItem({ ...editingItem, faculty: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
            >
              {faculties.filter((f) => f !== 'Todas').map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <FileUploadArea
              currentFile={editingItem}
              onFileSelect={handleFileSelect}
              onRemove={handleRemoveFile}
              inputRef={editFileInputRef}
              isEdit
            />

            <LinkInputArea
              currentLink={editingItem.linkUrl}
              onLinkUrl={handleLinkUrl}
              onRemoveLink={handleRemoveLink}
              isEdit
            />

            <Button type="submit" className="w-full">Guardar cambios</Button>
          </form>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Eliminar publicación"
        message={`¿Estás seguro de eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
      />

      {/* View Detail */}
      <ContentDetailModal
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        item={viewItem}
      />
    </div>
  );
}
