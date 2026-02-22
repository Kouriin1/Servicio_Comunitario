import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FilePlus2, ListFilter, Pencil, Trash2, Eye, ArrowLeft, Check,
  Upload, FileText, Video, Image, Link2, X, Users, Search
} from 'lucide-react';
import { useContentContext } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContentDetailModal from '../components/ui/ContentDetailModal';

const emptyForm = {
  title: '', excerpt: '', type: 'Tesis', school: 'Derecho', author: '', taggedUserId: null, taggedUserName: null,
  file: null, fileUrl: null, fileType: null, fileName: null, linkUrl: null,
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
  const { allContent, addContent, deleteContent, updateContent, faculties, contentTypesList, contentTypes, usersList, fetchUsers } = useContentContext();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState('Todos');
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [authorSearch, setAuthorSearch] = useState('');
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const authorDropdownRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
        setShowAuthorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const publications = selectedType === 'Todos'
    ? allContent
    : allContent.filter((item) => item.type === selectedType);

  const filteredUsers = useMemo(() => {
    if (!authorSearch) return usersList.slice(0, 5); // Show first 5 by default if empty search
    const lowerSearch = authorSearch.toLowerCase();
    return usersList.filter(user =>
      user.display_name?.toLowerCase().includes(lowerSearch) ||
      user.email.toLowerCase().includes(lowerSearch)
    ).slice(0, 10);
  }, [usersList, authorSearch]);

  const selectAuthor = (u) => {
    setForm({ ...form, author: u.display_name, taggedUserId: u.id, taggedUserName: u.display_name });
    setAuthorSearch(u.display_name);
    setShowAuthorDropdown(false);
  };


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
      setEditingItem({ ...editingItem, file, fileUrl, fileType, fileName: file.name });
    } else {
      setForm({ ...form, file, fileUrl, fileType, fileName: file.name });
    }
    showToast(`${file.name} adjuntado`, 'success');
  };

  const handleRemoveFile = (isEdit = false) => {
    if (isEdit && editingItem) {
      if (editingItem.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(editingItem.fileUrl);
      setEditingItem({ ...editingItem, file: null, fileUrl: null, fileType: null, fileName: null, fileRemoved: true });
    } else {
      if (form.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(form.fileUrl);
      setForm({ ...form, file: null, fileUrl: null, fileType: null, fileName: null });
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

  const handlePublish = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim()) {
      showToast('Completa título y descripción', 'error');
      return;
    }

    if (form.title.trim().length < 5) {
      showToast('El título debe tener al menos 5 letras', 'error');
      return;
    }

    try {
      await addContent({
        ...form,
        author: form.author.trim() || user?.name || 'Administrador',
        taggedUserId: form.taggedUserId,
        taggedUserName: form.taggedUserName,
        readTime: form.type !== 'Evento' ? '5 min' : undefined,
        location: form.type === 'Evento' ? 'Por definir' : undefined,
      });
      showToast('Publicación creada exitosamente', 'success');
      setForm(emptyForm);
      setAuthorSearch('');
    } catch (err) {
      showToast(err.message || 'Error al crear publicación', 'error');
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    if (!editingItem) return;

    if (editingItem.title.trim().length < 5) {
      showToast('El título debe tener al menos 5 letras', 'error');
      return;
    }

    try {
      await updateContent(editingItem.id, {
        title: editingItem.title,
        excerpt: editingItem.excerpt,
        type: editingItem.type,
        school: editingItem.school,
        file: editingItem.file || null,
        fileUrl: editingItem.fileUrl,
        fileType: editingItem.fileType,
        fileName: editingItem.fileName,
        fileRemoved: editingItem.fileRemoved || false,
        linkUrl: editingItem.linkUrl,
      });
      showToast('Publicación actualizada', 'success');
      setShowEditModal(false);
      setEditingItem(null);
    } catch (err) {
      showToast(err.message || 'Error al actualizar', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContent(id);
      showToast('Publicación eliminada', 'info');
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-3 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <header className="bg-usm-blue rounded-2xl p-4 sm:p-6 md:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Panel Administrador</h1>
              <p className="text-blue-100 text-sm sm:text-base">Gestiona publicaciones, categorías y contenido académico.</p>
            </div>
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
            </Link>
          </div>
        </header>

        {/* Generic Tabs Navigation */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 pb-px">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'content'
              ? 'border-usm-blue text-usm-blue dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            Contenido
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'users'
              ? 'border-usm-blue text-usm-blue dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            Usuarios
          </button>
        </div>

        {activeTab === 'content' ? (
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Formulario de publicación */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6"
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

                {/* Custom Autocomplete Author Input */}
                <div className="relative" ref={authorDropdownRef}>
                  <input
                    type="text"
                    value={authorSearch}
                    onChange={(e) => {
                      setAuthorSearch(e.target.value);
                      setForm({ ...form, author: e.target.value, taggedUserId: null, taggedUserName: null });
                      setShowAuthorDropdown(true);
                    }}
                    onFocus={() => setShowAuthorDropdown(true)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
                    placeholder="Autor (busca un usuario o escribe un nombre externo)"
                  />
                  {showAuthorDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <div
                            key={u.id}
                            className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                            onClick={() => selectAuthor(u)}
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-white">{u.display_name || 'Usuario'}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-usm-blue px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                              {u.role === 'student' ? 'Usuario' : u.role}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-500">
                          {authorSearch ? 'Se guardará como autor externo.' : 'Empieza a escribir para buscar.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
                  {contentTypesList.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>

                <select
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.name}>{f.name}</option>
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
              className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6"
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
                        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.type} · {item.school}</p>
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
        ) : (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6 text-usm-blue dark:text-blue-300">
              <Users className="w-5 h-5" />
              <h2 className="text-xl font-bold">Directorio de Usuarios Registrados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">Usuario</th>
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">Correo</th>
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">Escuela</th>
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400 text-center">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-white">{u.display_name || 'Sin nombre'}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{u.faculty?.name || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-usm-blue/10 text-usm-blue dark:bg-blue-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                          {u.role === 'student' ? 'Usuario' : u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">No hay usuarios cargados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mobile back link */}
        <div className="sm:hidden text-center">
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
              {contentTypesList.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
            <select
              value={editingItem.school}
              onChange={(e) => setEditingItem({ ...editingItem, school: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.name}>{f.name}</option>
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
