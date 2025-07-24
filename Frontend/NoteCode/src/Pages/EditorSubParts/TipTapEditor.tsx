
import React, { useState, useRef } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import MenuBar from './Menubar';
import CodeBlockComponent from './CodeBlockComponent';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

// Import languages from highlight.js
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';

// Register languages for syntax highlighting
lowlight.registerLanguage('javascript', javascript);
lowlight.registerLanguage('typescript', typescript);
lowlight.registerLanguage('python', python);
lowlight.registerLanguage('java', java);
lowlight.registerLanguage('cpp', cpp);
lowlight.registerLanguage('css', css);
lowlight.registerLanguage('html', xml);
lowlight.registerLanguage('sql', sql);

const TipTapEditor: React.FC = () => {
  const [content, setContent] = useState<string>('<p>Welcome to CodeNote! Start typing...</p>');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({ lowlight }),
      Image.configure({
        allowBase64: true,
        inline: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[500px] rounded-b-md border border-t-0 border-border p-4 focus:outline-none prose dark:prose-invert max-w-none',
        spellcheck: 'false',
      },
    },
  });

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large", {
          description: "Please select an image less than 5MB"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const result = readerEvent.target?.result as string;
        if (result && editor) {
          editor.commands.insertContent(`<img src="${result}" />`);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <MenuBar editor={editor} onImageUpload={handleImageUpload} />
      <EditorContent editor={editor} />
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default TipTapEditor;