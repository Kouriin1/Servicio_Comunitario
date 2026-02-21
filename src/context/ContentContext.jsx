import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ContentContext = createContext(null);

/* ───── Transform Supabase row → UI-compatible item ──── */

function transformPublication(pub) {
  const media = pub.media_files?.[0];
  return {
    id: pub.id,
    title: pub.title,
    author: pub.author_name || 'Anónimo',
    school: pub.faculty?.name || 'General',
    type: pub.content_type?.name || 'Artículo',
    date: pub.created_at,
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
    _faculty_id: pub.faculty_id,
    _content_type_id: pub.content_type_id,
    _author_id: pub.author_id,
  };
}

/* ───── Publication select query (reusable) ──────────── */

const PUB_SELECT = `
  *,
  faculty:faculties(id, name, code, color),
  content_type:content_types(id, name, icon, color),
  media_files(id, file_type, file_name, public_url, thumbnail_url, external_url, storage_path)
`;

/* ───── Provider ─────────────────────────────────────── */

export function ContentProvider({ children }) {
  const { session } = useAuth();
  const [content, setContent] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [contentTypesList, setContentTypesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derived arrays for filter chips (compatible with old mockData exports)
  const schools = ['Todas', ...faculties.filter((f) => f.code !== 'TODAS').map((f) => f.name)];
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
      const { data, error } = await supabase
        .from('publications')
        .select(PUB_SELECT)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent((data || []).map(transformPublication));
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
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

  const addContent = async (item) => {
    const faculty = faculties.find((f) => f.name === item.school);
    const contentType = contentTypesList.find((t) => t.name === item.type);

    // 1. Create publication
    const { data: pub, error } = await supabase
      .from('publications')
      .insert({
        title: item.title,
        description: item.excerpt,
        author_name: item.author || 'Administrador',
        author_id: session?.user?.id || null,
        faculty_id: faculty?.id || null,
        content_type_id: contentType?.id || null,
        external_url: item.linkUrl || null,
        read_time_min: item.type !== 'Evento' ? 5 : null,
        event_location: item.type === 'Evento' ? (item.location || 'Por definir') : null,
        status: 'published',
      })
      .select('id')
      .single();

    if (error) throw error;

    // 2. Upload file to Storage + create media_files record
    if (item.file) {
      const filePath = `${session.user.id}/${pub.id}/${Date.now()}_${item.file.name}`;
      const { error: upErr } = await supabase.storage
        .from('publications-media')
        .upload(filePath, item.file, { cacheControl: '3600', upsert: false });

      if (!upErr) {
        const { data: urlData } = supabase.storage
          .from('publications-media')
          .getPublicUrl(filePath);

        await supabase.from('media_files').insert({
          publication_id: pub.id,
          file_type: item.fileType,
          file_name: item.file.name,
          file_size_bytes: item.file.size,
          mime_type: item.file.type,
          storage_path: filePath,
          public_url: urlData.publicUrl,
        });
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
    const faculty = faculties.find((f) => f.name === data.school);
    const contentType = contentTypesList.find((t) => t.name === data.type);

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
      // Remove old media
      const { data: oldMedia } = await supabase
        .from('media_files')
        .select('id, storage_path')
        .eq('publication_id', id);

      if (oldMedia?.length) {
        const paths = oldMedia.map((m) => m.storage_path).filter(Boolean);
        if (paths.length) await supabase.storage.from('publications-media').remove(paths);
        await supabase.from('media_files').delete().eq('publication_id', id);
      }

      const filePath = `${session.user.id}/${id}/${Date.now()}_${data.file.name}`;
      await supabase.storage.from('publications-media').upload(filePath, data.file);

      const { data: urlData } = supabase.storage
        .from('publications-media')
        .getPublicUrl(filePath);

      await supabase.from('media_files').insert({
        publication_id: id,
        file_type: data.fileType,
        file_name: data.file.name,
        file_size_bytes: data.file.size,
        mime_type: data.file.type,
        storage_path: filePath,
        public_url: urlData.publicUrl,
      });
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

  return (
    <ContentContext.Provider
      value={{
        content,
        savedIds,
        addContent,
        deleteContent,
        updateContent,
        toggleSave,
        allContent: content,
        events: content.filter((i) => i.type === 'Evento'),
        works: content.filter((i) => i.type === 'Tesis' || i.type === 'Artículo'),
        faculties,
        contentTypesList,
        schools,
        contentTypes,
        loading,
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
