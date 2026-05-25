"use client"

import React, { useState, useCallback, useMemo, useRef } from "react"
import axios from 'axios'
import { NodeViewWrapper } from "@tiptap/react"
import { highlightCode } from "./codeBlockUtils"
import CodeBlockToolbar from "./CodeBlockToolbar"
import "./code-block.scss"

interface CodeBlockProps {
  id?: string
  language?: string
  code?: string
  onUpdate: (code: string, language?: string) => void
  onExit?: () => void
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  id = "code-block",
  language = "javascript",
  code = "",
  onUpdate,
  onExit,
}) => {
  const [isEditing, setIsEditing] = useState(code === "")
  const [content, setContent] = useState(code)
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showOutput, setShowOutput] = useState(false)
  const [outputStdout, setOutputStdout] = useState("")
  const [outputStderr, setOutputStderr] = useState("")
  const [exitCode, setExitCode] = useState<number | null>(null)
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastTabTimeRef = useRef<number | null>(null)

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

  // Handle Run button click
  const BACKEND = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')
  const CODE_RUNNER = ( 'http://localhost:5000').replace(/\/$/, '')

  const handleRun = useCallback(async () => {
    setShowOutput(true)
    setOutputStdout("")
    setOutputStderr("")
    setExitCode(null)
    setDurationSeconds(null)
    setIsRunning(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 30000)
    try {
      const res = await axios.post(
        `${CODE_RUNNER}/execute`,
        { code: content, language: currentLanguage, stdin: '' },
        { timeout: 30000 }
      )
      const data = res.data
      // prefer structured fields
      const stdout = data?.stdout ?? data?.output ?? ''
      const stderr = data?.stderr ?? data?.error ?? ''
      const code = typeof data?.exit_code === 'number' ? data.exit_code : (typeof data?.exitCode === 'number' ? data.exitCode : null)
      const dur = data?._meta?.duration_seconds ?? data?.duration_seconds ?? data?._meta?.durationSeconds ?? null
      setOutputStdout(String(stdout ?? ''))
      setOutputStderr(String(stderr ?? ''))
      setExitCode(code)
      setDurationSeconds(dur)
      console.log('Execution result:', data)
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
        setOutputStderr('Execution timed out after 30 seconds')
      } else if (axios.isAxiosError(err) && err.response) {
        // server returned error body
        const data = err.response.data
        const stderr = data?.stderr ?? data?.error ?? data?.message ?? JSON.stringify(data)
        setOutputStderr(String(stderr))
        const code = typeof data?.exit_code === 'number' ? data.exit_code : null
        setExitCode(code)
      } else {
        setOutputStderr('Execution failed: ' + (err?.message || String(err)))
      }
    } finally {
      clearTimeout(timeout)
      setIsRunning(false)
    }
  }, [BACKEND, content, currentLanguage])

  // Exit editing mode and save changes
  const handleBlur = useCallback(() => {
    onUpdate(content, currentLanguage)
    setIsEditing(false)
  }, [content, currentLanguage, onUpdate])

  // Handle Enter key: single Enter inserts newline, double Enter exits
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Enter double press to exit (existing behaviour)
    if (e.key === "Enter") {
      const textarea = e.currentTarget
      const { selectionStart, value } = textarea
      const beforeCursor = value.substring(0, selectionStart)

      if (beforeCursor.endsWith("\n\n")) {
        e.preventDefault()
        const newContent = content.slice(0, -1)
        setContent(newContent)
        onUpdate(newContent, currentLanguage)
        setIsEditing(false)
      }
    }

    // Tab handling: single Tab => indent / format; double Tab (two tabs within threshold) => exit code block
    if (e.key === 'Tab') {
      e.preventDefault()
      const now = Date.now()
      const threshold = 400
      const last = (lastTabTimeRef.current || 0)
      if (now - last <= threshold) {
        // double tab: exit editing and notify parent to create paragraph
        lastTabTimeRef.current = null
        onUpdate(content, currentLanguage)
        setIsEditing(false)
        onExit && onExit()
        return
      }
      // single tab: indent selection or insert tab
      lastTabTimeRef.current = now
      const textarea = e.currentTarget
      const { selectionStart, selectionEnd, value } = textarea
      const tabChar = '\t'
      if (selectionStart !== selectionEnd) {
        const startLine = value.lastIndexOf('\n', selectionStart - 1) + 1
        const endLineIdx = value.indexOf('\n', selectionEnd)
        const selEnd = endLineIdx === -1 ? value.length : endLineIdx
        const before = value.substring(0, startLine)
        const selected = value.substring(startLine, selEnd)
        const after = value.substring(selEnd)
        const indented = selected.split('\n').map(line => tabChar + line).join('\n')
        const newContent = before + indented + after
        setContent(newContent)
        onUpdate(newContent, currentLanguage)
        // restore selection roughly
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = selectionStart + 1
            textareaRef.current.selectionEnd = selectionEnd + selected.split('\n').length
          }
        })
      } else {
        const newValue = value.substring(0, selectionStart) + tabChar + value.substring(selectionEnd)
        setContent(newValue)
        onUpdate(newValue, currentLanguage)
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            const pos = selectionStart + tabChar.length
            textareaRef.current.selectionStart = pos
            textareaRef.current.selectionEnd = pos
          }
        })
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
        onRun={handleRun}
        isRunning={isRunning}
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
      {showOutput && (
        <div className="code-block-output">
          <div className="code-block-output-header">
            <span>Output</span>
            <button
              onClick={() => setShowOutput(false)}
              className="code-block-close-btn"
              title="Close output"
            >
              ✕
            </button>
          </div>
          <div className="code-block-output-content">
            {outputStdout ? (
              <>
                <div className="code-block-output-section">
                  <div className="code-block-output-label">stdout</div>
                  <pre><code>{outputStdout}</code></pre>
                </div>
              </>
            ) : null}
            {outputStderr ? (
              <div className="code-block-output-section">
                <div className="code-block-output-label">stderr</div>
                <pre className="stderr"><code>{outputStderr}</code></pre>
              </div>
            ) : null}
            {(exitCode !== null || durationSeconds !== null) && (
              <div className="code-block-output-meta">
                {exitCode !== null && <span>Exit: {exitCode}</span>}
                {durationSeconds !== null && <span className="ml-2">Duration: {Number(durationSeconds).toFixed(2)}s</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}

export default React.memo(CodeBlock)
