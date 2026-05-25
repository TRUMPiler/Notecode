"use client"

// import React from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import { useEffect, useState } from 'react'
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { ReactNodeViewRenderer } from "@tiptap/react"
import type { Dispatch, SetStateAction } from "react"

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
import HardBreak from "@tiptap/extension-hard-break"
// import { Button } from "primereact/button"

type Props = {
  initialContent?: string
  providerValue?: { editor: Editor | null }
  setText?: Dispatch<SetStateAction<string | null>>
  text?: string|null
}

export default function CustomEditor({ initialContent = "", providerValue, setText}: Props) {
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
      StarterKit.configure({
        hardBreak: false,
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => this.editor.commands.setHardBreak(),
          }
        },
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
            />
          ))
        },
      }),
    ],
    content: initialContent || "<p>Start typing...</p>",
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
        className="bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0"
      >
        B
      </button>
      <button 
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className="bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0"
      >
        I
      </button>
      <button 
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className="bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0"
      >
        S
      </button>
      <button 
        onClick={() => editor?.chain().focus().setHardBreak().run()}
        className="bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0"
        title="Insert line break (Shift+Enter)"
      >
        ↵
      </button>
      <button 
        onClick={() => editor?.chain().focus().toggleCode().run()}
        className="bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0"
      >
        Inline
      </button>
      <button 
        onClick={() => {
          if (!editor) return
          editor.chain().focus().setCodeBlock({ language: 'javascript' }).run()
        }}
        className="bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0"
      >
        Insert Code Block
      </button>
      <button 
        onClick={() => insertImage()}
        className="bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-gray-200 transition text-sm sm:text-base shrink-0"
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
        className="bg-blue-500 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded cursor-pointer hover:bg-blue-600 transition text-sm sm:text-base shrink-0"
      >
        Upload
      </label>
    </div>
  )

  return (
    <>
      <style>{`
        .custom-editor-root {
          border: 1px solid #000000;
          border-left: 4px solid #000000;
          border-right-color: #07080a;
          border-radius: 0.5rem;
          padding: 0.75rem;
          background: white;
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
          background: #0b0b0b;
          color: #e6eef8;
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
          background: #0b0b0b;
          color: #e6eef8;
          border: 1px solid #111;
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
          background: rgba(8, 1, 1, 0.726);
          color: #e6eef8;
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
          caret-color: #10b981;
          outline: none;
          -webkit-text-size-adjust: 100%;
          animation: caret-blink 1s steps(1) infinite;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .custom-editor-content .ProseMirror:focus {
          caret-color: #10b981;
        }

        @keyframes caret-blink {
          50% {
            caret-color: transparent;
          }
          100% {
            caret-color: #10b981;
          }
        }
      `}</style>
      <div className="flex items-center justify-center px-1 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
       
        <div className="custom-editor-root w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl shadow-lg">
          {toolbar}
          <div className="custom-editor-content min-h-50 min-w-60vh sm:min-h-[300px] md:min-h-[400px] p-3 sm:p-4 md:p-6">
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
