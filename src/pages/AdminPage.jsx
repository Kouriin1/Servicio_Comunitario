import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FilePlus2, ListFilter, Pencil, Trash2, Eye, ArrowLeft, Check,
  Upload, FileText, Video, Image, Link2, X, Users, Search, Loader2, ShieldCheck, ShieldOff, Ban, UserCheck, Mail, Send
} from 'lucide-react';
import { useContentContext } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ContentDetailModal from '../components/ui/ContentDetailModal';

const emptyForm = {
  title: '', excerpt: '', type: 'Trabajos de grado', school: '', author: '', taggedUserId: null, taggedUserName: null, eventDate: '',
  file: null, fileUrl: null, fileType: null, fileMimeType: null, fileName: null, linkUrl: null,
};

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

const EXTENSION_TO_FILE_TYPE = {
  pdf: 'pdf',
  doc: 'document',
  docx: 'document',
  ppt: 'document',
  pptx: 'document',
  xls: 'document',
  xlsx: 'document',
  mp4: 'video',
  webm: 'video',
  ogg: 'video',
  mov: 'video',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
};

const EXTENSION_TO_MIME = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

const MIME_TO_FILE_TYPE = Object.entries(EXTENSION_TO_MIME).reduce((acc, [ext, mime]) => {
  acc[mime] = EXTENSION_TO_FILE_TYPE[ext];
  return acc;
}, {});

const ALLOWED_MIME_TYPES = new Set(Object.values(EXTENSION_TO_MIME));
const ALL_ACCEPTED = [...new Set([...Object.keys(EXTENSION_TO_FILE_TYPE).map((ext) => `.${ext}`), 'video/*', 'image/*'])].join(',');

const SUPER_ADMIN_EMAIL = 'usmjorguer1123@gmail.com';

function getFacultyLabel(faculty) {
  const name = (faculty?.name || '').trim();
  const lowerName = name.toLowerCase();

  if (faculty?.code === 'TODAS' || lowerName === 'todas las facultades') return 'Facultad de Derecho';
  if (lowerName === 'derecho') return 'Escuela de Derecho';
  if (lowerName === 'estudios internacionales') return 'Escuela de Estudios Internacionales';

  return name;
}

function getFileExtension(fileName = '') {
  const normalized = fileName.trim().toLowerCase();
  const dot = normalized.lastIndexOf('.');
  return dot >= 0 ? normalized.slice(dot + 1) : '';
}

function resolveFileMetadata(file) {
  const extension = getFileExtension(file?.name || '');
  const typeFromMime = MIME_TO_FILE_TYPE[file?.type] || null;
  const typeFromExtension = EXTENSION_TO_FILE_TYPE[extension] || null;
  const fileType = typeFromMime || typeFromExtension;

  const mimeType = ALLOWED_MIME_TYPES.has(file?.type)
    ? file.type
    : EXTENSION_TO_MIME[extension] || file?.type || null;

  return { fileType, mimeType };
}

function validateSelectedFile(file) {
  if (!file) {
    return { isValid: false, message: 'No se selecciono ningun archivo.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, message: 'El archivo excede el limite de 100MB.' };
  }

  const { fileType, mimeType } = resolveFileMetadata(file);
  if (!fileType || !mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      isValid: false,
      message: 'Formato no permitido. Usa PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), Excel (XLS/XLSX), video (MP4/WebM/OGG/MOV) o imagen (JPG/JPEG/PNG/GIF/WEBP).',
    };
  }

  return { isValid: true, fileType, mimeType };
}

function FileTypeIcon({ fileType, className = 'w-4 h-4' }) {
  if (fileType === 'pdf') return <FileText className={className} />;
  if (fileType === 'document') return <FileText className={className} />;
  if (fileType === 'video') return <Video className={className} />;
  if (fileType === 'image') return <Image className={className} />;
  if (fileType === 'link') return <Link2 className={className} />;
  return null;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { allContent, addContent, deleteContent, updateContent, contentTypesList, contentTypes, faculties, usersList, fetchUsers, updateUserRole, banUser, unbanUser } = useContentContext();
  const { user, sendInvite } = useAuth();
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
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const authorDropdownRef = useRef(null);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  const [adminSearch, setAdminSearch] = useState('');
  const [togglingRole, setTogglingRole] = useState(null);
  const [togglingBan, setTogglingBan] = useState(null);
  const [banConfirm, setBanConfirm] = useState(null);

  const [inviteForm, setInviteForm] = useState({ email: '', firstName: '', lastName: '', facultyId: '' });
  const [sendingInvite, setSendingInvite] = useState(false);
  const inviteFaculties = useMemo(() => faculties.filter((f) => f.code !== 'TODAS'), [faculties]);

  const handleSendInvite = async (event) => {
    event.preventDefault();
    const email = inviteForm.email.trim().toLowerCase();
    if (!email) {
      showToast('El correo es requerido', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Formato de correo inválido', 'error');
      return;
    }

    setSendingInvite(true);
    try {
      await sendInvite({
        email,
        firstName: inviteForm.firstName.trim(),
        lastName: inviteForm.lastName.trim(),
        facultyId: inviteForm.facultyId || null,
      });
      showToast(`Invitación enviada a ${email}`, 'success');
      setInviteForm({ email: '', firstName: '', lastName: '', facultyId: '' });
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('ya tiene una cuenta activa')) {
        showToast('Este correo ya está registrado en USM RED.', 'error');
      } else if (msg.includes('invitación pendiente')) {
        showToast('Ya existe una invitación pendiente para este correo.', 'info');
      } else {
        showToast(msg || 'Error al enviar la invitación', 'error');
      }
    } finally {
      setSendingInvite(false);
    }
  };

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

    const validation = validateSelectedFile(file);
    if (!validation.isValid) {
      showToast(validation.message, 'error');
      return;
    }

    const { fileType, mimeType } = validation;
    const fileUrl = URL.createObjectURL(file);

    if (isEdit && editingItem) {
      setEditingItem({ ...editingItem, file, fileUrl, fileType, fileMimeType: mimeType, fileName: file.name, fileRemoved: false });
    } else {
      setForm({ ...form, file, fileUrl, fileType, fileMimeType: mimeType, fileName: file.name });
    }
    showToast(`Archivo listo para publicar: ${file.name}`, 'success');
  };

  const handleRemoveFile = (isEdit = false) => {
    if (isEdit && editingItem) {
      if (editingItem.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(editingItem.fileUrl);
      setEditingItem({ ...editingItem, file: null, fileUrl: null, fileType: null, fileMimeType: null, fileName: null, fileRemoved: true });
    } else {
      if (form.fileUrl?.startsWith('blob:')) URL.revokeObjectURL(form.fileUrl);
      setForm({ ...form, file: null, fileUrl: null, fileType: null, fileMimeType: null, fileName: null });
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

    setSubmitting(true);
    try {
      await addContent({
        ...form,
        author: form.author.trim() || user?.name || 'Administrador',
        taggedUserId: form.taggedUserId,
        taggedUserName: form.taggedUserName,
        eventDate: form.type === 'Evento' ? form.eventDate : undefined,
        readTime: form.type !== 'Evento' ? '5 min' : undefined,
        location: form.type === 'Evento' ? 'Por definir' : undefined,
      });
      showToast('Publicación creada exitosamente', 'success');
      setForm(emptyForm);
      setAuthorSearch('');
    } catch (err) {
      showToast(err.message || 'Error al crear publicación', 'error');
    } finally {
      setSubmitting(false);
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
        fileMimeType: editingItem.fileMimeType,
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

  const handleBan = async (u) => {
    setTogglingBan(u.id);
    try {
      await banUser(u.id);
      showToast(`${u.display_name || 'Usuario'} ha sido baneado y su contenido eliminado`, 'success');
    } catch {
      showToast('Error al banear usuario', 'error');
    } finally {
      setTogglingBan(null);
      setBanConfirm(null);
    }
  };

  const handleUnban = async (u) => {
    setTogglingBan(u.id);
    try {
      await unbanUser(u.id);
      showToast(`${u.display_name || 'Usuario'} ha sido desbaneado`, 'success');
    } catch {
      showToast('Error al desbanear usuario', 'error');
    } finally {
      setTogglingBan(null);
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
            <p className="text-xs text-slate-400 mt-1">PDF, Word, PowerPoint, Excel, video (MP4/WebM/OGG/MOV) e imagen (JPG/JPEG/PNG/GIF/WEBP) - Max 100MB</p>
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-3 sm:p-6 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 overflow-hidden">
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
        <div className="flex overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 border-b border-slate-200 dark:border-slate-700 pb-px">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'content'
              ? 'border-usm-blue text-usm-blue dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            Contenido
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'users'
              ? 'border-usm-blue text-usm-blue dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'invites'
              ? 'border-usm-blue text-usm-blue dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            Invitaciones
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'admins'
                ? 'border-usm-blue text-usm-blue dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
            >
              Administradores
            </button>
          )}
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

                {form.type === 'Evento' && (
                  <input
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
                    required
                  />
                )}

                <select
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Seleccionar escuela</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={getFacultyLabel(f)}>{getFacultyLabel(f)}</option>
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

                <Button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {submitting ? 'Guardando...' : 'Guardar publicación'}
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
        ) : activeTab === 'admins' && isSuperAdmin ? (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-usm-blue dark:text-blue-300">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="text-xl font-bold">Gestionar Administradores</h2>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 break-words">
              Solo tú (<span className="font-medium break-all">{SUPER_ADMIN_EMAIL}</span>) puedes asignar o remover administradores. Los administradores asignados tendrán acceso completo al panel excepto esta sección.
            </p>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">Usuario</th>
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">Correo</th>
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">Escuela</th>
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400 text-center">Estado</th>
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400 text-center">Rol</th>
                    <th className="py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList
                    .filter(u => {
                      if (!adminSearch) return true;
                      const q = adminSearch.toLowerCase();
                      return (u.display_name || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                    })
                    .map(u => {
                      const isSuper = u.email === SUPER_ADMIN_EMAIL;
                      const isAdmin = u.role === 'admin';
                      const isBanned = !!u.is_banned;
                      return (
                        <tr key={u.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 ${isBanned ? 'opacity-60' : ''}`}>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-800 dark:text-white">{u.display_name || 'Sin nombre'}</p>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{u.email}</td>
                          <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{u.faculty?.name || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            {isBanned ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Baneado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isAdmin ? 'bg-usm-blue/10 text-usm-blue dark:bg-blue-900/30 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                              {isSuper ? 'Super Admin' : isAdmin ? 'Admin' : 'Usuario'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isSuper ? (
                              <span className="text-xs text-slate-400">—</span>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                {!isBanned && (
                                  <button
                                    disabled={togglingRole === u.id}
                                    onClick={async () => {
                                      setTogglingRole(u.id);
                                      try {
                                        await updateUserRole(u.id, isAdmin ? 'student' : 'admin');
                                        showToast(isAdmin ? `${u.display_name || 'Usuario'} ya no es administrador` : `${u.display_name || 'Usuario'} ahora es administrador`, 'success');
                                      } catch {
                                        showToast('Error al cambiar el rol', 'error');
                                      } finally {
                                        setTogglingRole(null);
                                      }
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isAdmin
                                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                      }`}
                                  >
                                    {togglingRole === u.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : isAdmin ? (
                                      <><ShieldOff className="w-3.5 h-3.5" /> Quitar Admin</>
                                    ) : (
                                      <><ShieldCheck className="w-3.5 h-3.5" /> Hacer Admin</>
                                    )}
                                  </button>
                                )}
                                <button
                                  disabled={togglingBan === u.id}
                                  onClick={() => isBanned ? handleUnban(u) : setBanConfirm(u)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isBanned
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                                    }`}
                                >
                                  {togglingBan === u.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : isBanned ? (
                                    <><UserCheck className="w-3.5 h-3.5" /> Desbanear</>
                                  ) : (
                                    <><Ban className="w-3.5 h-3.5" /> Banear</>
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">No hay usuarios cargados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {usersList
                .filter(u => {
                  if (!adminSearch) return true;
                  const q = adminSearch.toLowerCase();
                  return (u.display_name || '').toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                })
                .map(u => {
                  const isSuper = u.email === SUPER_ADMIN_EMAIL;
                  const isAdmin = u.role === 'admin';
                  const isBanned = !!u.is_banned;
                  return (
                    <div key={u.id} className={`border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 ${isBanned ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 dark:text-white truncate">{u.display_name || 'Sin nombre'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{u.faculty?.name || 'Sin escuela'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {isBanned ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              Baneado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              Activo
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isAdmin ? 'bg-usm-blue/10 text-usm-blue dark:bg-blue-900/30 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                            {isSuper ? 'Super Admin' : isAdmin ? 'Admin' : 'Usuario'}
                          </span>
                        </div>
                      </div>
                      {!isSuper && (
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                          {!isBanned && (
                            <button
                              disabled={togglingRole === u.id}
                              onClick={async () => {
                                setTogglingRole(u.id);
                                try {
                                  await updateUserRole(u.id, isAdmin ? 'student' : 'admin');
                                  showToast(isAdmin ? `${u.display_name || 'Usuario'} ya no es administrador` : `${u.display_name || 'Usuario'} ahora es administrador`, 'success');
                                } catch {
                                  showToast('Error al cambiar el rol', 'error');
                                } finally {
                                  setTogglingRole(null);
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isAdmin
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                }`}
                            >
                              {togglingRole === u.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isAdmin ? (
                                <><ShieldOff className="w-3.5 h-3.5" /> Quitar Admin</>
                              ) : (
                                <><ShieldCheck className="w-3.5 h-3.5" /> Hacer Admin</>
                              )}
                            </button>
                          )}
                          <button
                            disabled={togglingBan === u.id}
                            onClick={() => isBanned ? handleUnban(u) : setBanConfirm(u)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isBanned
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                              }`}
                          >
                            {togglingBan === u.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isBanned ? (
                              <><UserCheck className="w-3.5 h-3.5" /> Desbanear</>
                            ) : (
                              <><Ban className="w-3.5 h-3.5" /> Banear</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              {usersList.length === 0 && (
                <p className="py-8 text-center text-slate-400">No hay usuarios cargados.</p>
              )}
            </div>
          </section>
        ) : activeTab === 'invites' ? (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 text-usm-blue dark:text-blue-300">
              <Mail className="w-5 h-5" />
              <h2 className="text-xl font-bold">Invitar usuarios externos</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Envía una invitación por correo a cualquier persona. El invitado recibirá un enlace para activar su cuenta y definir su contraseña, sin importar el dominio de su correo.
            </p>

            <form onSubmit={handleSendInvite} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Correo del invitado <span className="text-red-500">*</span></span>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Nombre</span>
                <input
                  type="text"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
                  placeholder="Opcional"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Apellido</span>
                <input
                  type="text"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 dark:bg-slate-700 dark:text-white"
                  placeholder="Opcional"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Escuela</span>
                <select
                  value={inviteForm.facultyId}
                  onChange={(e) => setInviteForm({ ...inviteForm, facultyId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Sin escuela asignada</option>
                  {inviteFaculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </label>

              <div className="md:col-span-2 pt-2">
                <Button type="submit" disabled={sendingInvite} className="flex items-center justify-center gap-2">
                  {sendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sendingInvite ? 'Enviando...' : 'Enviar invitación'}
                </Button>
              </div>
            </form>
          </section>
        ) : (
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6 text-usm-blue dark:text-blue-300">
              <Users className="w-5 h-5" />
              <h2 className="text-xl font-bold">Directorio de Usuarios Registrados</h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                    <tr key={u.id} onClick={() => navigate(`/u/${u.id}`)} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 cursor-pointer">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-white hover:text-usm-blue transition-colors">{u.display_name || 'Sin nombre'}</p>
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

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {usersList.map(u => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/u/${u.id}`)}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 dark:text-white truncate hover:text-usm-blue transition-colors">{u.display_name || 'Sin nombre'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{u.faculty?.name || 'Sin escuela'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${u.role === 'admin' ? 'bg-usm-blue/10 text-usm-blue dark:bg-blue-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                    {u.role === 'student' ? 'Usuario' : u.role}
                  </span>
                </div>
              ))}
              {usersList.length === 0 && (
                <p className="py-8 text-center text-slate-400">No hay usuarios cargados.</p>
              )}
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
              <option value="">Seleccionar escuela</option>
              {faculties.map((f) => (
                <option key={f.id} value={getFacultyLabel(f)}>{getFacultyLabel(f)}</option>
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

      {/* Ban Confirm */}
      <ConfirmDialog
        isOpen={!!banConfirm}
        onClose={() => setBanConfirm(null)}
        onConfirm={() => handleBan(banConfirm)}
        title="Banear usuario"
        message={`¿Estás seguro de banear a "${banConfirm?.display_name || banConfirm?.email}"? Se eliminarán TODAS sus publicaciones, comentarios, likes y contenido asociado. Esta acción NO se puede revertir para el contenido.`}
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
