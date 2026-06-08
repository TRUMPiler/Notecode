import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import EmojiPicker from './EmojiPicker';

interface EmojiMenuButtonProps {
  editor: Editor;
}

export default function EmojiMenuButton({ editor }: EmojiMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (emoji: any) => {
    editor.chain().focus().insertContent(emoji.skins?.[0]?.native).run();
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-sm font-medium rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-1"
      >
        <span>😀</span>
        <span>Emoji</span>
      </button>
      
      <EmojiPicker isOpen={isOpen} onClose={() => setIsOpen(false)} onSelect={handleSelect} buttonRef={buttonRef} />
    </>
  );
}
