"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import { useEffect, useState, useRef } from 'react'
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { ReactNodeViewRenderer } from "@tiptap/react"
import type { Dispatch, SetStateAction } from "react"
// Import the Emoji button
import EmojiMenuButton from "@/components/emoji-picker/EmojiMenuButton"
// Import the new CodeBlock component
import CodeBlock from "@/components/code-block/CodeBlock"
// lowlight for syntax highlighting
import { createLowlight, common } from "lowlight"
import highlight from "highlight.js"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"
import cssLang from "highlight.js/lib/languages/css"
import html from "highlight.js/lib/languages/xml"
import { Placeholder } from "@tiptap/extensions"

// import { Button } from "primereact/button"

type Props = {
  // initialContent?: string
  providerValue?: { editor: Editor | null }
  setText?: Dispatch<SetStateAction<string | null>>
  text?: string|null
}

export default function CustomEditor({ text, providerValue, setText}: Props) {
  const lowlight = createLowlight(common)
  highlight.registerLanguage("javascript", javascript)
  highlight.registerLanguage("typescript", typescript)
  highlight.registerLanguage("python", python)
  highlight.registerLanguage("css", cssLang)
  highlight.registerLanguage("html", html)
  // register a handful of languages
  lowlight.register("javascript", javascript)
  lowlight.register("typescript", typescript)
  lowlight.register("python", python)
  lowlight.register("css", cssLang)
  lowlight.register("html", html)

  const internalEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing your note...",
      }),
      Image,
      // configure code block lowlight with the new CodeBlock component
      CodeBlockLowlight.configure({ lowlight }).extend({
        addNodeView() {
          return ReactNodeViewRenderer((props: any) => (
            <CodeBlock
              id={props.node.attrs.id || "code-block"}
              language={props.node.attrs.language || "javascript"}
              code={props.node.textContent || ""}
              onUpdate={(code, language) => {
                // Update the node content and language
                props.updateAttributes({ language: language || "javascript" })
                const pos = typeof props.getPos === "function" ? props.getPos() : (props.getPos as any)
                if (typeof pos === "number") {
                  const { state, view } = props.editor
                  const from = pos + 1
                  const to = pos + props.node.nodeSize - 1
                  const tr = state.tr.replaceWith(from, to, state.schema.text(code))
                  view.dispatch(tr)
                }
              }}
              onExit={() => {
                try {
                  props.editor.chain().focus().createParagraphNear().focus('end').run()
                } catch (err) {
                  // ignore
                }
              }}
              onRemove={() => props.deleteNode()}
            />
          ))
        },
      }),
    ],
    content: text || "",
    onUpdate: ({ editor }) => {
      // use getHTML() to include HTML tags in the output
      setText?.(editor.getHTML())
    },
  })

  const editor = providerValue?.editor ?? internalEditor

  const BACKEND = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')

  const uploadFile = async (file?: File) => {
    if (!file) return null
    try {
      const form = new FormData()
      form.append('file', file)
      // Use XMLHttpRequest to track upload progress
      return await new Promise<string | null>((resolve) => {
        setUploading(true)
        setProgress(0)
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${BACKEND}/upload/image`)
        xhr.withCredentials = true
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(pct)
          }
        }
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText)
            setProgress(100)
            setTimeout(() => {
              setUploading(false)
              setProgress(0)
            }, 300)
            resolve(data.url as string)
          } catch (err) {
            setUploading(false)
            resolve(null)
          }
        }
        xhr.onerror = () => {
          setUploading(false)
          resolve(null)
        }
        xhr.send(form)
      })
    } catch (err) {
      console.error('Upload failed', err)
      return null
    }
  }

  const uploadFromUrl = async (url?: string) => {
    if (!url) return null
    try {
      // Show indeterminate/animated progress while backend fetches the remote image
      setUploading(true)
      setProgress(20)
      const intervalId = window.setInterval(() => {
        setProgress((p) => Math.min(90, p + Math.floor(Math.random() * 8) + 3))
      }, 400)
      const res = await fetch(`${BACKEND}/upload/image-from-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url }),
      })
      clearInterval(intervalId)
      const data = await res.json()
      setProgress(100)
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 300)
      return data.url as string
    } catch (err) {
      console.error('Upload from url failed', err)
      return null
    }
  }

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest('.context-menu-container') || target?.closest('.emoji-picker-portal')) {
        return;
      }
      setContextMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-typing effect for empty notes without using a placeholder
  const hasTypedRef = useRef(false);
  const typingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Only run once, and only if the editor starts empty
    if (!editor || hasTypedRef.current || text) return;
    hasTypedRef.current = true;

    const message = "Start typing your note...";
    let i = 0;

    typingIntervalRef.current = window.setInterval(() => {
      if (i < message.length) {
        editor.commands.insertContent(message[i]);
        i++;
      } else {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      }
    }, 50); // Speed of typing

    const handleFocus = () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      // Clear the auto-typed text instantly when they click to start writing
      if (editor.getText() === message.slice(0, i)) {
        editor.commands.clearContent();
      }
      editor.off('focus', handleFocus);
    };

    editor.on('focus', handleFocus);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      editor.off('focus', handleFocus);
    };
  }, [editor, text]);

  useEffect(() => {
    if (!editor) return
    const dom = (editor as any).view?.dom
    if (!dom) return

    const handlePaste = async (e: ClipboardEvent) => {
      try {
        const clipboard = (e.clipboardData || (window as any).clipboardData)
        if (!clipboard) return

        // Handle image files pasted
        for (let i = 0; i < clipboard.items.length; i++) {
          const item = clipboard.items[i]
          if (item.type && item.type.indexOf('image') !== -1) {
            const file = item.getAsFile()
            if (file) {
              e.preventDefault()
              const url = await uploadFile(file)
              if (url) editor.chain().focus().setImage({ src: url }).createParagraphNear().focus('end').run()
              return
            }
          }
        }

        // Handle pasted HTML that might contain <img src="..."> or plain URL
        const html = clipboard.getData('text/html')
        const text = clipboard.getData('text/plain')
        const imgSrcMatch = html && html.match(/<img[^>]+src=["']([^"']+)["']/i)
        const possibleUrl = (imgSrcMatch && imgSrcMatch[1]) || text
        if (possibleUrl) {
          // If it's a data URL, convert to blob and upload
          if (possibleUrl.startsWith('data:image')) {
            e.preventDefault()
            const resp = await fetch(possibleUrl)
            const blob = await resp.blob()
            const file = new File([blob], `pasted.${blob.type.split('/')[1] || 'png'}`, { type: blob.type })
            const url = await uploadFile(file)
            if (url) editor.chain().focus().setImage({ src: url }).createParagraphNear().focus('end').run()
            return
          }

          // If it's an http(s) url, ask backend to fetch+save
          if (/^https?:\/\//i.test(possibleUrl)) {
            e.preventDefault()
            const url = await uploadFromUrl(possibleUrl)
            if (url) editor.chain().focus().setImage({ src: url }).createParagraphNear().focus('end').run()
            return
          }
        }
      } catch (err) {
        console.error('Paste handler error', err)
      }
    }

    dom.addEventListener('paste', handlePaste as unknown as EventListener)
    return () => dom.removeEventListener('paste', handlePaste as unknown as EventListener)
  }, [editor])

  const insertImage = async (file?: File) => {
    if (!editor) return
    if (file) {
      const url = await uploadFile(file)
      if (url) {
        editor.chain().focus().setImage({ src: url }).createParagraphNear().focus('end').run()
        return
      }
      // fallback to embedding the data URL if upload failed
      const reader = new FileReader()
      reader.onload = () => {
        editor.chain().focus().setImage({ src: String(reader.result) }).createParagraphNear().focus('end').run()
      }
      reader.readAsDataURL(file)
    } else {
      const urlInput = window.prompt("Enter image URL")
      
      if (urlInput === null) return // user cancelled
      if (!/^https?:\/\//i.test(urlInput)) {
        alert("Please enter a valid URL")
        return
      }
      const saved = await uploadFromUrl(urlInput)
      if (saved) {
        editor.chain().focus().setImage({ src: saved }).createParagraphNear().focus('end').run()
      } else {
        // fallback to using the original url
        editor.chain().focus().setImage({ src: urlInput }).createParagraphNear().focus('end').run()
      }
    }
  }

  const toolbar = (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 sm:pb-0">
      <button 
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        B
      </button>
      <button 
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        I
      </button>
      <button 
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        S
      </button>
            <button 
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        H
      </button>
      <button 
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        • List
      </button>
      <button 
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        1. List
      </button>
      <button 
        onClick={() => editor?.chain().focus().setHardBreak().run()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
        title="Insert line break (Shift+Enter)"
      >
        ↵
      </button>
      <button 
        onClick={() => editor?.chain().focus().toggleCode().run()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        Inline
      </button>
      <button 
        onClick={() => {
          if (!editor) return;

          if (editor.isActive('codeBlock')) {
            editor.chain().focus().toggleCodeBlock().run();
            return;
          }

          const { state } = editor;
          const { $from, $to, empty } = state.selection;

          if (!empty) {
            const selectedText = state.doc.textBetween($from.pos, $to.pos, '\n');
            editor.chain().focus()
              .deleteSelection()
              .insertContent(selectedText ? {
                type: 'codeBlock',
                attrs: { language: 'javascript' },
                content: [{ type: 'text', text: selectedText }]
              } : {
                type: 'codeBlock',
                attrs: { language: 'javascript' }
              })
              .run();
            return;
          }

          const parent = $from.parent;
          const parentPos = $from.start();
          let lastBreakPos = -1;
          let secondLastBreakPos = -1;

          parent.forEach((node, offset) => {
            if (parentPos + offset < $from.pos) {
              if (node.type.name === 'hardBreak') {
                secondLastBreakPos = lastBreakPos;
                lastBreakPos = parentPos + offset;
              }
            }
          });

          const textAfterLastBreak = state.doc.textBetween(Math.max(lastBreakPos + 1, parentPos), $from.pos, '\n');

          let targetStart = parentPos;
          let targetEnd = $from.pos;

          if (lastBreakPos !== -1 && textAfterLastBreak.trim() === '') {
            targetStart = Math.max(secondLastBreakPos + 1, parentPos);
            targetEnd = lastBreakPos;
          } else {
            targetStart = Math.max(lastBreakPos + 1, parentPos);
            targetEnd = $from.pos;
          }

          const textToExtract = state.doc.textBetween(targetStart, targetEnd, '\n');

          editor.chain().focus()
            .deleteRange({ from: targetStart, to: $from.pos })
            .insertContent(textToExtract ? {
              type: 'codeBlock',
              attrs: { language: 'javascript' },
              content: [{ type: 'text', text: textToExtract }]
            } : {
              type: 'codeBlock',
              attrs: { language: 'javascript' }
            })
            .run();
        }}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        Insert Code Block
      </button>
      <button 
        onClick={() => insertImage()}
        className="bg-gray-100 border border-black/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0 dark:text-white dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        Image
      </button>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => insertImage(e.target.files?.[0])}
        className="hidden"
        id="custom-editor-image-input"
      />
      <label 
        htmlFor="custom-editor-image-input" 
        className="bg-blue-500 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-blue-600  transition text-sm sm:text-base shrink-0 dark:text-white  dark:bg-green-600 dark:hover:bg-blue-700"
      >
        Upload
      </label>
    </div>
  )

  return (
    <>
      <style>{`
  :root {
    --editor-bg: #ffffff;
    --editor-border: #000000;
    --editor-border-left: #000000;
    --editor-border-right: #07080a;
    --code-bg: #0b0b0b;
    --code-color: #e6eef8;
    --code-border: #111111;
    --inline-code-bg: rgba(8, 1, 1, 0.726);
    --inline-code-color: #e6eef8;
    --caret-color: #10b981;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --editor-bg: #111214;
      --editor-border: #3a3d42;
      --editor-border-left: #10b981;
      --editor-border-right: #2a2d32;
      --code-bg: #1a1d22;
      --code-color: #e6eef8;
      --code-border: #2a2d32;
      --inline-code-bg: rgba(255, 255, 255, 0.08);
      --inline-code-color: #a8d8b0;
      --caret-color: #10b981;
    }
  }

  .custom-editor-root {
    border: 1px solid var(--editor-border);
    border-left: 4px solid var(--editor-border-left);
    border-right-color: var(--editor-border-right);
    border-radius: 0.5rem;
    padding: 0.75rem;
    background: var(--editor-bg);
    box-sizing: border-box;
  }

  @media (min-width: 640px) {
    .custom-editor-root {
      padding: 1rem;
      border-radius: 0.75rem;
    }
  }

  @media (min-width: 768px) {
    .custom-editor-root {
      padding: 1.25rem;
      border-radius: 1rem;
    }
  }

  .custom-editor-content pre {
    background: var(--code-bg);
    color: var(--code-color);
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    overflow-y: visible;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
    font-size: 0.875rem;
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.04);
  }

  @media (min-width: 640px) {
    .custom-editor-content pre {
      font-size: 0.95rem;
    }
  }

  .code-block-node {
    margin: 0 0 1rem 0;
  }

  .code-block-textarea {
    width: 100%;
    min-height: 120px;
    border-radius: 0.5rem;
    padding: 0.75rem;
    background: var(--code-bg);
    color: var(--code-color);
    border: 1px solid var(--code-border);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
    font-size: 0.875rem;
  }

  @media (min-width: 640px) {
    .code-block-textarea {
      font-size: 0.95rem;
    }
  }

  .code-block-node .code-highlighter {
    margin: 0;
  }

  .custom-editor-content code {
    background: var(--inline-code-bg);
    color: var(--inline-code-color);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
    font-size: 0.875rem;
  }

  .custom-editor-content .ProseMirror pre {
    white-space: pre;
    margin: 0 0 1rem 0;
  }

  .custom-editor-content .ProseMirror {
    caret-color: var(--caret-color);
    caret-shape: block;
    outline: none;
    -webkit-text-size-adjust: 100%;
    animation: caret-blink 1s steps(1) infinite;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .custom-editor-content .ProseMirror h1 {
    font-size: 2.25em;
    font-weight: 700;
    line-height: 1.2;
    margin: 1em 0 0.5em;
  }

  .custom-editor-content .ProseMirror h2 {
    font-size: 1.75em;
    font-weight: 700;
    line-height: 1.3;
    margin: 1em 0 0.5em;
  }

  .custom-editor-content .ProseMirror h3 {
    font-size: 1.5em;
    font-weight: 700;
    line-height: 1.4;
    margin: 1em 0 0.5em;
  }

  .custom-editor-content .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin: 0.5em 0;
  }

  .custom-editor-content .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin: 0.5em 0;
  }

  .custom-editor-content .ProseMirror li > p {
    margin: 0;
  }

  .custom-editor-content .ProseMirror:focus {
    caret-color: var(--caret-color);
  }

  @keyframes caret-blink {
      0% { caret-color: var(--caret-color);  }
      100% { caret-color: transparent; }}
  }
    
  .custom-editor-content .ProseMirror > * {
    animation: smoothAppear 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  @keyframes smoothAppear {
    0% { opacity: 0; transform: translateY(4px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.8);
  }
  @media (prefers-color-scheme: dark) {
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(71, 85, 105, 0.5);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(100, 116, 139, 0.8);
    }
  }
`}</style>
      <div className="flex items-center min-w-full justify-center px-1 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
       
        <div className="custom-editor-root w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl shadow-lg">
          {toolbar}
          {contextMenu && editor && (
            <div 
              className="context-menu-container fixed z-50 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md p-1" 
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button
                onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setContextMenu(null); }}
                className={`px-2 py-1 text-sm font-medium rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                H1
              </button>
              <button
                onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setContextMenu(null); }}
                className={`px-2 py-1 text-sm font-medium rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                H2
              </button>
              <button
                onClick={() => { editor.chain().focus().toggleBulletList().run(); setContextMenu(null); }}
                className={`px-2 py-1 text-sm font-medium rounded transition-colors ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                Bullet list
              </button>
              <EmojiMenuButton editor={editor} />
            </div>
          )}
          <div 
            className="custom-editor-content custom-scrollbar overflow-y-auto text-black dark:text-white min-h-50 max-h-[70vh] min-w-60vh sm:min-h-[300px] md:min-h-[400px] p-3 sm:p-4 md:p-6"
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY });
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
        {uploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-4 w-80 shadow-lg">
              <h3 className="font-semibold mb-2">Uploading...</h3>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                readOnly
                className="w-full"
              />
              <div className="text-sm mt-2 text-right">{progress}%</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}