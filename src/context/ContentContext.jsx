import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ContentContext = createContext(null);

/* ───── Sanitize file name for Supabase Storage keys ──── */
function sanitizeFileName(name) {
  const dot = name.lastIndexOf('.');
  const ext = dot !== -1 ? name.slice(dot) : '';
  const base = dot !== -1 ? name.slice(0, dot) : name;
  return base
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-zA-Z0-9._-]/g, '_')                 // replace special chars
    .replace(/_+/g, '_')                               // collapse underscores
    .replace(/^_|_$/g, '')                              // trim underscores
    + ext.toLowerCase();
}

function getSchoolLabel(faculty) {
  if (!faculty) return 'General';
  const rawName = (faculty.name || '').trim();
  const rawNameLower = rawName.toLowerCase();

  if (faculty.code === 'TODAS' || rawNameLower === 'todas las facultades') {
    return 'Facultad de Derecho';
  }
  if (rawNameLower === 'derecho') {
    return 'Escuela de Derecho';
  }
  if (rawNameLower === 'estudios internacionales') {
    return 'Escuela de Estudios Internacionales';
  }

  return rawName || 'General';
}

function findFacultyBySchoolSelection(faculties, selectedSchool) {
  if (!selectedSchool) return null;
  const normalizedSelection = selectedSchool.trim().toLowerCase();

  return faculties.find((f) => {
    const rawName = (f.name || '').trim().toLowerCase();
    const displayName = getSchoolLabel(f).toLowerCase();

    if (rawName === normalizedSelection || displayName === normalizedSelection) {
      return true;
    }

    // Compatibilidad con etiquetas antiguas/alternas
    if (normalizedSelection === 'facultad de derecho') {
      return f.code === 'TODAS' || rawName === 'todas las facultades';
    }
    if (normalizedSelection === 'escuela de derecho') {
      return rawName === 'derecho';
    }
    if (normalizedSelection === 'escuela de estudios internacionales') {
      return rawName === 'estudios internacionales';
    }

    return false;
  }) || null;
}

function buildUploadValidationMessage(fileName) {
  return `No se pudo subir el archivo "${fileName}". Formatos permitidos: PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), Excel (XLS/XLSX), video (MP4/WebM/OGG/MOV) e imagen (JPG/JPEG/PNG/GIF/WEBP), maximo 100MB.`;
}

/* ───── Transform Supabase row → UI-compatible item ──── */

function transformPublication(pub) {
  const media = pub.media_files?.[0];
  return {
    id: pub.id,
    title: pub.title,
    author: pub.author_name || 'Anónimo',
    author_avatar: pub.profiles?.avatar_url || null,
    school: getSchoolLabel(pub.faculty),
    type: pub.content_type?.name || 'Artículo',
    date: pub.created_at,
    eventDate: pub.event_date || null,
    excerpt: pub.description || '',
    readTime: pub.read_time_min ? `${pub.read_time_min} min` : null,
    location: pub.event_location || null,
    fileUrl: media?.public_url || null,
    fileType: media?.file_type || null,
    fileName: media?.file_name || null,
    linkUrl: pub.external_url || null,
    likes: pub.likes_count || 0,
    comments_count: pub.comments_count || 0,
    views_count: pub.views_count || 0,
    bookmarks_count: pub.bookmarks_count || 0,
    has_liked: pub.likes && pub.likes.length > 0, // Si trae el array con tu user_id, es true
    comments: pub.comments || [],
    _faculty_id: pub.faculty_id,
    _content_type_id: pub.content_type_id,
    _author_id: pub.author_id,
    _creator_id: pub.creator_id,
    // Solo es un perfil clickeable si author_id apunta a un usuario diferente al creador (admin)
    has_linked_author: !!(pub.author_id && pub.author_id !== pub.creator_id),
  };
}

/* ───── Publication select query (reusable) ──────────── */
// Nota: 'likes' viene filtrado por RLS o se filtra en la llamada para saber si el currentUser dio like
const PUB_SELECT = `
  *,
  faculty:faculties(id, name, code, color),
  content_type:content_types(id, name, icon, color),
  media_files(id, file_type, file_name, public_url, thumbnail_url, external_url, storage_path),
  likes(user_id),
  comments(id, content, created_at, is_deleted, user_id, profiles:user_id(display_name, avatar_url)),
  profiles:author_id(avatar_url)
`;

const PAGE_SIZE = 10;

/* ───── Provider ─────────────────────────────────────── */

export function ContentProvider({ children }) {
  const { session } = useAuth();
  const [content, setContent] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [contentTypesList, setContentTypesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const offsetRef = useRef(0);

  // Derived arrays for filter chips
  const schools = [
    'Todas',
    ...Array.from(new Set((faculties || []).map((f) => getSchoolLabel(f)).filter((name) => !!name && name !== 'General' && name !== 'Facultad de Derecho'))),
  ];
  const contentTypes = ['Todos', ...contentTypesList.map((t) => t.name)];

  /* ───── Initial fetches ────────────────────────────── */

  // Catalogs are public — fetch once on mount
  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Content + bookmarks depend on auth state
  useEffect(() => {
    fetchContent();
    if (session) {
      fetchBookmarks();
    } else {
      setSavedIds([]);
    }
  }, [session]);

  /* ───── Fetch functions ────────────────────────────── */

  async function fetchCatalogs() {
    const [{ data: facs }, { data: types }] = await Promise.all([
      supabase.from('faculties').select('*').eq('is_active', true).order('name'),
      supabase.from('content_types').select('*').eq('is_active', true).order('name'),
    ]);
    setFaculties(facs || []);
    setContentTypesList(types || []);
  }

  async function fetchContent() {
    try {
      offsetRef.current = 0;
      const { data, error } = await supabase
        .from('publications')
        .select(PUB_SELECT)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (error) throw error;

      const now = new Date();
      const filteredData = (data || []).filter(pub => {
        if (pub.content_type?.name === 'Evento' && pub.event_date) {
          const expires = new Date(pub.event_date);
          expires.setDate(expires.getDate() + 1);
          return expires >= now;
        }
        return true;
      });

      const items = filteredData.map(transformPublication);
      setContent(items);
      setHasMore(data?.length === PAGE_SIZE);
      offsetRef.current = data?.length || 0;
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const from = offsetRef.current;
      const { data, error } = await supabase
        .from('publications')
        .select(PUB_SELECT)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;

      const now = new Date();
      const filteredData = (data || []).filter(pub => {
        if (pub.content_type?.name === 'Evento' && pub.event_date) {
          const expires = new Date(pub.event_date);
          expires.setDate(expires.getDate() + 1);
          return expires >= now;
        }
        return true;
      });

      const items = filteredData.map(transformPublication);
      setContent((prev) => [...prev, ...items]);
      setHasMore(data?.length === PAGE_SIZE);
      offsetRef.current = from + (data?.length || 0);
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function fetchBookmarks() {
    if (!session?.user) return;
    const { data } = await supabase
      .from('bookmarks')
      .select('publication_id')
      .eq('user_id', session.user.id);
    setSavedIds((data || []).map((b) => b.publication_id));
  }

  /* ───── CRUD ───────────────────────────────────────── */

  const [usersList, setUsersList] = useState([]);

  async function fetchUsers() {
    if (session?.user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, faculty:faculties(name)')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setUsersList(data);
      }
    }
  }

  async function updateUserRole(userId, newRole) {
    const { error } = await supabase.rpc('set_user_role', {
      target_user_id: userId,
      new_role: newRole,
    });
    if (error) throw error;
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  }

  async function banUser(userId) {
    const { error } = await supabase.rpc('ban_user', { target_user_id: userId });
    if (error) throw error;
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_banned: true, role: 'student' } : u));
    // Remove banned user's publications from local state
    setContent(prev => prev.filter(p => p._author_id !== userId && p._creator_id !== userId));
  }

  async function unbanUser(userId) {
    const { error } = await supabase.rpc('unban_user', { target_user_id: userId });
    if (error) throw error;
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, is_banned: false } : u));
  }

  const addContent = async (item) => {
    const faculty = findFacultyBySchoolSelection(faculties, item.school);
    const contentType = contentTypesList.find((t) => t.name === item.type);

    if (item.file && !item.fileType) {
      throw new Error(buildUploadValidationMessage(item.file?.name || 'archivo'));
    }

    // author_id solo se asigna si hay un usuario explícitamente etiquetado
    const finalAuthorId = item.taggedUserId || null;
    const finalAuthorName = item.taggedUserName || item.author || 'Administrador';

    // 1. Create publication
    const { data: pub, error } = await supabase
      .from('publications')
      .insert({
        title: item.title,
        description: item.excerpt,
        author_name: finalAuthorName,
        author_id: finalAuthorId,
        creator_id: session?.user?.id || null, // Track who actually created this
        faculty_id: faculty?.id || null,
        content_type_id: contentType?.id || null,
        external_url: item.linkUrl || null,
        read_time_min: item.type !== 'Evento' ? 5 : null,
        event_date: item.eventDate || null,
        event_location: item.type === 'Evento' ? (item.location || 'Por definir') : null,
        status: 'published',
      })
      .select('id')
      .single();

    if (error) throw error;

    // 1.5 Send Notification if a user was tagged
    if (item.taggedUserId && item.taggedUserId !== session?.user?.id && item.type !== 'Evento') {
      await supabase.from('notifications').insert({
        user_id: item.taggedUserId,
        actor_id: session?.user?.id,
        type: 'mention',
        publication_id: pub.id,
        message: '¡El administrador ha subido una nueva publicación a tu nombre!',
      });
    }

    // 1.6 Global Event Notifications
    if (item.type === 'Evento') {
      const allUsers = usersList.filter(u => u.id !== session?.user?.id);
      if (allUsers.length > 0) {
        const notifs = allUsers.map(u => ({
          user_id: u.id,
          actor_id: session?.user?.id,
          type: 'mention',
          publication_id: pub.id,
          message: `¡Nuevo evento programado: ${item.title}!`,
        }));
        const { error: notifsErr } = await supabase.from('notifications').insert(notifs);
        if (notifsErr) console.error("Error sending global event notifications:", notifsErr);
      }
    }

    // 2. Upload file to Storage + create media_files record
    if (item.file) {
      const safeName = sanitizeFileName(item.file.name);
      const filePath = `${session.user.id}/${pub.id}/${Date.now()}_${safeName}`;

      const uploadOptions = {
        cacheControl: '3600',
        upsert: false,
        ...(item.fileMimeType ? { contentType: item.fileMimeType } : {}),
      };

      const { error: upErr } = await supabase.storage
        .from('publications-media')
        .upload(filePath, item.file, uploadOptions);

      if (upErr) {
        // Rollback: delete the publication that was just created
        await supabase.from('publications').delete().eq('id', pub.id);
        throw new Error(buildUploadValidationMessage(item.file.name));
      }

      const { data: urlData } = supabase.storage
        .from('publications-media')
        .getPublicUrl(filePath);

      const { error: mediaErr } = await supabase.from('media_files').insert({
        publication_id: pub.id,
        file_type: item.fileType,
        file_name: item.file.name,
        file_size_bytes: item.file.size,
        mime_type: item.fileMimeType || item.file.type,
        storage_path: filePath,
        public_url: urlData.publicUrl,
      });

      if (mediaErr) {
        await supabase.storage.from('publications-media').remove([filePath]);
        await supabase.from('publications').delete().eq('id', pub.id);
        throw new Error(buildUploadValidationMessage(item.file.name));
      }
    }

    // 3. Re-fetch to get complete data with joins
    await fetchContent();
    return pub;
  };

  const deleteContent = async (id) => {
    // Delete storage files first
    const { data: mediaFiles } = await supabase
      .from('media_files')
      .select('storage_path')
      .eq('publication_id', id);

    if (mediaFiles?.length) {
      const paths = mediaFiles.map((m) => m.storage_path).filter(Boolean);
      if (paths.length) {
        await supabase.storage.from('publications-media').remove(paths);
      }
    }

    const { error } = await supabase.from('publications').delete().eq('id', id);
    if (error) throw error;

    setContent((prev) => prev.filter((item) => item.id !== id));
    setSavedIds((prev) => prev.filter((sid) => sid !== id));
  };

  const updateContent = async (id, data) => {
    const faculty = findFacultyBySchoolSelection(faculties, data.school);
    const contentType = contentTypesList.find((t) => t.name === data.type);

    if (data.file && !data.fileType) {
      throw new Error(buildUploadValidationMessage(data.file?.name || 'archivo'));
    }

    const { error } = await supabase
      .from('publications')
      .update({
        title: data.title,
        description: data.excerpt,
        faculty_id: faculty?.id,
        content_type_id: contentType?.id,
        external_url: data.linkUrl || null,
      })
      .eq('id', id);

    if (error) throw error;

    // Handle new file upload
    if (data.file) {
      // Keep old media until the new upload is fully persisted.
      const { data: oldMedia } = await supabase
        .from('media_files')
        .select('id, storage_path')
        .eq('publication_id', id);

      const safeName = sanitizeFileName(data.file.name);
      const filePath = `${session.user.id}/${id}/${Date.now()}_${safeName}`;

      const uploadOptions = {
        cacheControl: '3600',
        upsert: false,
        ...(data.fileMimeType ? { contentType: data.fileMimeType } : {}),
      };

      const { error: upErr } = await supabase.storage.from('publications-media').upload(filePath, data.file, uploadOptions);

      if (upErr) {
        throw new Error(buildUploadValidationMessage(data.file.name));
      }

      const { data: urlData } = supabase.storage
        .from('publications-media')
        .getPublicUrl(filePath);

      const { data: insertedMedia, error: mediaErr } = await supabase.from('media_files').insert({
        publication_id: id,
        file_type: data.fileType,
        file_name: data.file.name,
        file_size_bytes: data.file.size,
        mime_type: data.fileMimeType || data.file.type,
        storage_path: filePath,
        public_url: urlData.publicUrl,
      }).select('id').single();

      if (mediaErr) {
        await supabase.storage.from('publications-media').remove([filePath]);
        throw new Error(buildUploadValidationMessage(data.file.name));
      }

      // New media is saved; now remove previous media safely.
      if (oldMedia?.length) {
        const oldPaths = oldMedia.map((m) => m.storage_path).filter(Boolean);
        if (oldPaths.length) {
          await supabase.storage.from('publications-media').remove(oldPaths);
        }
        await supabase
          .from('media_files')
          .delete()
          .eq('publication_id', id)
          .neq('id', insertedMedia.id);
      }
    } else if (data.fileRemoved) {
      const { data: oldMedia } = await supabase
        .from('media_files')
        .select('id, storage_path')
        .eq('publication_id', id);

      if (oldMedia?.length) {
        const paths = oldMedia.map((m) => m.storage_path).filter(Boolean);
        if (paths.length) await supabase.storage.from('publications-media').remove(paths);
        await supabase.from('media_files').delete().eq('publication_id', id);
      }
    }

    await fetchContent();
  };

  const toggleSave = async (id) => {
    if (!session?.user) return;

    const isSaved = savedIds.includes(id);

    if (isSaved) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('publication_id', id)
        .eq('user_id', session.user.id);
      setSavedIds((prev) => prev.filter((sid) => sid !== id));
    } else {
      await supabase
        .from('bookmarks')
        .insert({ publication_id: id, user_id: session.user.id });
      setSavedIds((prev) => [...prev, id]);
    }
  };

  /* ───── Context value ──────────────────────────────── */

  const addComment = async (publicationId, text) => {
    if (!session?.user) return null;
    const { data, error } = await supabase.from('comments').insert({
      publication_id: publicationId,
      user_id: session.user.id,
      content: text,
    }).select('*, profiles:user_id(display_name, avatar_url)').single();
    if (error) {
      console.error(error);
      return null;
    }
    // Update local state without refetching all
    setContent((prev) => prev.map((item) => {
      if (item.id === publicationId) {
        return { ...item, comments: [...(item.comments || []), data], comments_count: item.comments_count + 1 };
      }
      return item;
    }));
    return data;
  };

  const deleteComment = async (commentId, publicationId) => {
    // Si somos Admin hacemos borrado suave (is_deleted = true) o hard
    // Optemos por Hard Delete para limpiar la UI:
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (!error) {
      setContent((prev) => prev.map((item) => {
        if (item.id === publicationId) {
          return { ...item, comments: item.comments.filter(c => c.id !== commentId), comments_count: Math.max(0, item.comments_count - 1) };
        }
        return item;
      }));
    }
  };

  const toggleLike = async (publicationId, currentLikedState) => {
    if (!session?.user) return;

    // Optimistic update
    setContent((prev) => prev.map(p => {
      if (p.id === publicationId) {
        const adj = currentLikedState ? -1 : 1;
        return { ...p, has_liked: !currentLikedState, likes: Math.max(0, (p.likes || 0) + adj) };
      }
      return p;
    }));

    if (currentLikedState) {
      await supabase.from('likes').delete().eq('publication_id', publicationId).eq('user_id', session.user.id);
    } else {
      await supabase.from('likes').insert({ publication_id: publicationId, user_id: session.user.id });
    }
  };

  const getPublicationLikes = async (publicationId) => {
    const { data } = await supabase.from('likes').select('profiles:user_id(id, display_name, email, avatar_url)').eq('publication_id', publicationId);
    return data ? data.map(d => d.profiles) : [];
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        savedIds,
        addContent,
        deleteContent,
        updateContent,
        toggleSave,
        addComment,
        deleteComment,
        toggleLike,
        getPublicationLikes,
        allContent: content,
        events: content.filter((i) => i.type === 'Evento'),
        works: content.filter((i) => ['Tesis', 'Trabajos de grado', 'Artículo', 'Artículos científicos', 'Artículos académicos', 'Ensayos'].includes(i.type)),
        faculties,
        contentTypesList,
        schools,
        contentTypes,
        usersList,
        fetchUsers,
        updateUserRole,
        banUser,
        unbanUser,
        loading,
        hasMore,
        loadingMore,
        loadMore,
        refreshContent: fetchContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export const useContentContext = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContentContext must be used within ContentProvider');
  return ctx;
};
