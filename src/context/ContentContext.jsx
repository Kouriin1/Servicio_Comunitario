import { createContext, useContext, useState } from 'react';
import { mockData } from '../mockData';

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [content, setContent] = useState(mockData);
  const [savedIds, setSavedIds] = useState(['usm-001', 'usm-004']);

  const addContent = (item) => {
    const newItem = {
      ...item,
      id: `usm-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setContent((prev) => [newItem, ...prev]);
    return newItem;
  };

  const deleteContent = (id) => {
    setContent((prev) => prev.filter((item) => item.id !== id));
    setSavedIds((prev) => prev.filter((sid) => sid !== id));
  };

  const updateContent = (id, data) => {
    setContent((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const toggleSave = (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const getEvents = () => content.filter((item) => item.type === 'Evento');
  const getWorks = () => content.filter((item) => item.type === 'Tesis' || item.type === 'Artículo');

  return (
    <ContentContext.Provider
      value={{
        content,
        savedIds,
        addContent,
        deleteContent,
        updateContent,
        toggleSave,
        events: getEvents(),
        works: getWorks(),
        allContent: content,
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
