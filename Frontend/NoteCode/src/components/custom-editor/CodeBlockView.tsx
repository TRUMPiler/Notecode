"use client"

import React, { useEffect, useState, useRef } from "react"
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react"
import type { Node as ProseMirrorNode } from "prosemirror-model"
import CodeHighlighter from "../code-highlighter/CodeHighlighter"

const CodeBlockView: React.FC<ReactNodeViewProps> = ({ node, updateAttributes, editor, getPos }) => {
  const language = (node.attrs && node.attrs.language) || ""
  const initialText = node.textContent || ""
  const [text, setText] = useState(initialText)
  const [editing, setEditing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setText(node.textContent || "")
  }, [node])

  useEffect(() => {
    if (editing && textareaRef.current) textareaRef.current.focus()
  }, [editing])

  const replaceNodeText = (newText: string) => {
    // getPos may be a function that returns number | undefined
    const pos = typeof getPos === "function" ? getPos() : (getPos as any)
    if (typeof pos !== "number") return
    const { state, view } = editor
    const from = pos + 1
    const to = pos + node.nodeSize - 1
    const tr = state.tr.replaceWith(from, to, state.schema.text(newText))
    view.dispatch(tr)
  }

  const onBlur = () => {
    setEditing(false)
    replaceNodeText(text)
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const textarea = e.currentTarget
      const { selectionStart, value } = textarea

      // Check if we have double Enter (two consecutive newlines before cursor)
      const beforeCursor = value.substring(0, selectionStart)
      const lastTwoChars = beforeCursor.slice(-2)

      if (lastTwoChars === "\n\n") {
        // Double Enter: exit code block, remove the extra newline, and insert a paragraph below
        e.preventDefault()
        const newText = text.slice(0, -1) // Remove the second newline
        replaceNodeText(newText)

        // Insert a paragraph after the code block
        const pos = typeof getPos === "function" ? getPos() : (getPos as any)
        if (typeof pos === "number") {
          const { state, view } = editor
          const blockSize = node.nodeSize
          const insertPos = pos + blockSize
          const tr = state.tr.insert(insertPos, state.schema.nodes.paragraph.create())
          view.dispatch(tr)
          // Move cursor to the new paragraph
          view.setSelection(view.state.selection.constructor.near(view.state.doc.resolve(insertPos + 1)))
        }
      }
      // Single Enter is handled normally (default textarea behavior)
    }
  }

  return (
    <NodeViewWrapper className="code-block-node">
      {editing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="code-block-textarea"
          spellCheck={false}
        />
      ) : (
        <div onDoubleClick={() => setEditing(true)}>
          <CodeHighlighter code={text} language={language} />
        </div>
      )}
    </NodeViewWrapper>
  )
}

export default ReactNodeViewRenderer(CodeBlockView)
