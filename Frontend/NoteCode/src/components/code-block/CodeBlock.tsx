"use client"

import React, { useState, useCallback, useMemo, useRef } from "react"
import { NodeViewWrapper } from "@tiptap/react"
import { highlightCode } from "./codeBlockUtils"
import CodeBlockToolbar from "./CodeBlockToolbar"
import "./code-block.scss"

interface CodeBlockProps {
  id?: string
  language?: string
  code?: string
  onUpdate: (code: string, language?: string) => void
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  id = "code-block",
  language = "javascript",
  code = "",
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(code === "")
  const [content, setContent] = useState(code)
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Memoize highlighted HTML to avoid unnecessary recalculations
  const highlightedCode = useMemo(() => highlightCode(content, currentLanguage), [content, currentLanguage])

  // Handle language change and update parent
  const handleLanguageChange = useCallback((newLanguage: string) => {
    setCurrentLanguage(newLanguage)
    onUpdate(content, newLanguage)
  }, [content, onUpdate])

  // Toggle line numbers
  const handleToggleLineNumbers = useCallback(() => {
    setShowLineNumbers((prev) => !prev)
  }, [])

  // Exit editing mode and save changes
  const handleBlur = useCallback(() => {
    onUpdate(content, currentLanguage)
    setIsEditing(false)
  }, [content, currentLanguage, onUpdate])

  // Handle Enter key: single Enter inserts newline, double Enter exits
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const textarea = e.currentTarget
      const { selectionStart, value } = textarea
      const beforeCursor = value.substring(0, selectionStart)

      // Check for double Enter (two newlines in a row)
      if (beforeCursor.endsWith("\n\n")) {
        e.preventDefault()
        // Remove the extra newline and exit edit mode
        const newContent = content.slice(0, -1)
        setContent(newContent)
        onUpdate(newContent, currentLanguage)
        setIsEditing(false)
      }
    }
  }, [content, currentLanguage, onUpdate])

  // Focus textarea when entering edit mode
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [isEditing])

  return (
    <NodeViewWrapper className="code-block" data-language={currentLanguage} data-id={id}>
      <CodeBlockToolbar
        language={currentLanguage}
        code={content}
        showLineNumbers={showLineNumbers}
        onLanguageChange={handleLanguageChange}
        onToggleLineNumbers={handleToggleLineNumbers}
      />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="code-block-textarea"
          placeholder="Paste or write your code here... (double Enter to exit)"
          spellCheck={false}
          aria-label={`Edit ${currentLanguage} code`}
        />
      ) : (
        <div
          className={`code-block-preview ${showLineNumbers ? "with-line-numbers" : ""}`}
          onClick={() => setIsEditing(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsEditing(true)
            }
          }}
          aria-label={`Code block in ${currentLanguage}. Click to edit.`}
        >
          <pre>
            {showLineNumbers && (
              <div className="code-block-line-numbers">
                {content.split("\n").map((_, i) => (
                  <div key={i} className="line-number">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <code
              className={`language-${currentLanguage}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      )}
    </NodeViewWrapper>
  )
}

export default React.memo(CodeBlock)
