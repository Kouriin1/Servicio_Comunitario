import { useContentContext } from '../context/ContentContext';

export const useContent = () => {
  const ctx = useContentContext();
  return {
    events: ctx.events,
    works: ctx.works,
    allContent: ctx.allContent,
  };
};
