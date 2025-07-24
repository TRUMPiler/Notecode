import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Code,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';


type MenuBarProps = {
  editor: Editor | null;
  onImageUpload: () => void;
};

const MenuBar: React.FC<MenuBarProps> = ({ editor, onImageUpload }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    onImageUpload();
  };

  return (
    <div className="border border-border bg-background rounded-t-md p-2 flex flex-wrap gap-1 items-center">
      <Select
        value={
          editor.isActive('heading', { level: 1 })
            ? 'h1'
            : editor.isActive('heading', { level: 2 })
            ? 'h2'
            : editor.isActive('heading', { level: 3 })
            ? 'h3'
            : 'paragraph'
        }
        onValueChange={(value) => {
          if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run();
          } else if (value === 'h1') {
            editor.chain().focus().setHeading({ level: 1 }).run();
          } else if (value === 'h2') {
            editor.chain().focus().setHeading({ level: 2 }).run();
          } else if (value === 'h3') {
            editor.chain().focus().setHeading({ level: 3 }).run();
          }
        }}
      >
        <SelectTrigger className="w-28 h-8">
          <SelectValue placeholder="Paragraph" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paragraph">Paragraph</SelectItem>
          <SelectItem value="h1">Heading 1</SelectItem>
          <SelectItem value="h2">Heading 2</SelectItem>
          <SelectItem value="h3">Heading 3</SelectItem>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-8 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Toggle underline"
      >
        <Underline className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-8 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        aria-label="Align left"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        aria-label="Align center"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        aria-label="Align right"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="h-8 mx-1" />

      <Toggle
        size="sm"
        pressed={editor.isActive('codeBlock')}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Insert code block"
      >
        <Code className="h-4 w-4" />
      </Toggle>

      <Button onClick={addImage} variant="ghost" size="sm">
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MenuBar;