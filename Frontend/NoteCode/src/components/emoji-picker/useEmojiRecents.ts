import { useState, useEffect } from 'react';

const STORAGE_KEY = 'notecode:emoji_recents';
const MAX_RECENTS = 8;

export function useEmojiRecents() {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecents(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse emoji recents', e);
    }
  }, []);

  const addRecent = (id: string) => {
    setRecents(prev => {
      const next = [id, ...prev.filter(r => r !== id)].slice(0, MAX_RECENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { recents, addRecent };
}
