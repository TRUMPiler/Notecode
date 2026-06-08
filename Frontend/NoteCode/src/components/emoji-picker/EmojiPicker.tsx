import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useEmojiRecents } from './useEmojiRecents';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: any) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const CATEGORIES = [
  { id: 'people', icon: '😀', label: 'Smileys & People' },
  { id: 'nature', icon: '🐻', label: 'Animals & Nature' },
  { id: 'foods', icon: '🍔', label: 'Food & Drink' },
  { id: 'activity', icon: '⚽', label: 'Activity' },
  { id: 'places', icon: '🚗', label: 'Travel & Places' },
  { id: 'objects', icon: '💡', label: 'Objects' },
  { id: 'symbols', icon: '🔣', label: 'Symbols' },
  { id: 'flags', icon: '🏳️', label: 'Flags' },
];

export default function EmojiPicker({ isOpen, onClose, onSelect, buttonRef }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { recents, addRecent } = useEmojiRecents();

  const [emojiData, setEmojiData] = useState<any>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [activeCategory, setActiveCategory] = useState('people');
  
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hoveredEmoji, setHoveredEmoji] = useState<any>(null);

  // Lazy load data on open
  useEffect(() => {
    if (isOpen && !emojiData) {
      // @ts-ignore - emoji-mart/data might not have built-in TypeScript types out of the box
      import('@emoji-mart/data').then((module) => {
        setEmojiData(module.default);
      }).catch(err => console.error("Failed to load emoji data", err));
    }
  }, [isOpen, emojiData]);

  // Calculate position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      let top = rect.bottom + window.scrollY + 8;
      let left = rect.left + window.scrollX;

      // Prevent overflow off screen edges
      if (left + 300 > window.innerWidth) left = window.innerWidth - 320;
      if (top + 400 > window.innerHeight + window.scrollY) top = rect.top + window.scrollY - 408;

      setCoords({ top, left });
    }
  }, [isOpen, buttonRef]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && emojiData) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, emojiData]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Handle Escape & Click Outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  // Filter emojis based on search or category
  const emojisToDisplay = useMemo(() => {
    if (!emojiData) return [];
    
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      return Object.values(emojiData.emojis).filter((e: any) =>
        e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
      );
    }

    const cat = emojiData.categories.find((c: any) => c.id === activeCategory);
    if (cat) {
      return cat.emojis.map((id: string) => emojiData.emojis[id]).filter(Boolean);
    }
    return [];
  }, [emojiData, activeCategory, debouncedQuery]);

  const recentEmojis = useMemo(() => {
    if (!emojiData) return [];
    return recents.map(id => emojiData.emojis[id]).filter(Boolean);
  }, [emojiData, recents]);

  const handleSelect = (emoji: any) => {
    addRecent(emoji.id);
    onSelect(emoji);
  };

  if (!isOpen) return null;

  const pickerContent = (
    <div
      ref={pickerRef}
      style={{ top: coords.top, left: coords.left }}
      className="emoji-picker-portal absolute z-[9999] w-[300px] h-[380px] flex flex-col bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
    >
      {!emojiData ? (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search emoji..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
            />
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto p-1 border-b border-gray-100 dark:border-gray-800 custom-scrollbar hide-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                title={cat.label}
                onClick={() => { setActiveCategory(cat.id); setQuery(''); }}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-colors ${activeCategory === cat.id && !debouncedQuery ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                {cat.icon}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            <div className="grid grid-cols-8 gap-1">
              {emojisToDisplay.map((emoji: any) => (
                <button
                  key={emoji.id}
                  onMouseEnter={() => setHoveredEmoji(emoji)}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  onClick={() => handleSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-[1.1rem]"
                >
                  {emoji.skins[0].native}
                </button>
              ))}
            </div>
          </div>

          {/* Recents Row */}
          {recentEmojis.length > 0 && !debouncedQuery && (
            <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1 overflow-x-auto hide-scrollbar">
              {recentEmojis.map((emoji: any) => (
                <button key={`recent-${emoji.id}`} onMouseEnter={() => setHoveredEmoji(emoji)} onMouseLeave={() => setHoveredEmoji(null)} onClick={() => handleSelect(emoji)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-base flex-shrink-0">
                  {emoji.skins[0].native}
                </button>
              ))}
            </div>
          )}

          {/* Preview Bar */}
          <div className="h-12 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] p-2 flex items-center gap-3">
            <div className="text-2xl">{hoveredEmoji ? hoveredEmoji.skins[0].native : '✨'}</div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{hoveredEmoji ? hoveredEmoji.name : 'Hover an emoji'}</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-500 truncate">{hoveredEmoji ? `:${hoveredEmoji.id}:` : 'to preview'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(pickerContent, document.body);
}
