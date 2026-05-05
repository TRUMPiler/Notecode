"use client"

import React from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react"

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

import "./custom-editor.scss"

type Props = {
  initialContent?: string
  providerValue?: { editor: Editor | null }
}

export default function CustomEditor({ initialContent = "", providerValue }: Props) {
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
            />
          ))
        },
      }),
    ],
    content: initialContent || "<p>Start typing...</p>",
  })

  const editor = providerValue?.editor ?? internalEditor

  const insertImage = async (file?: File) => {
    if (!editor) return
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        editor.chain().focus().setImage({ src: String(reader.result) }).run()
      }
      reader.readAsDataURL(file)
    } else {
      const url = prompt("Image URL")
      if (url) editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const toolbar = (
    <div className="custom-editor-toolbar">
      <button onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
      <button onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
      <button onClick={() => editor?.chain().focus().toggleStrike().run()}>S</button>
      <button onClick={() => editor?.chain().focus().toggleCode().run()}>Inline</button>
      <select
        className="code-lang-javascript"
        onChange={(e) => {
          const lang = e.target.value
          if (!editor) return
          // set an empty code block with the selected language
          editor.chain().focus().setCodeBlock({ language: lang }).run()
        }}
        defaultValue=""
      >
        <option value="" disabled>
          Insert code block...
        </option>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
      </select>
      <button onClick={() => insertImage()}>Image</button>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => insertImage(e.target.files?.[0])}
        style={{ display: "none" }}
        id="custom-editor-image-input"
      />
      <label htmlFor="custom-editor-image-input" className="file-label">Upload</label>
    </div>
  )

  return (
    <div className="custom-editor-root">
      {toolbar}
      <div className="custom-editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
