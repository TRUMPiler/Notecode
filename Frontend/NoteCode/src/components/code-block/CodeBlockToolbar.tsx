"use client"

import React, { useState } from "react"
import { copyToClipboard } from "./codeBlockUtils"
import { SUPPORTED_LANGUAGES } from "./types"
import "./code-block.scss"

interface CodeBlockToolbarProps {
  language: string
  code: string
  showLineNumbers: boolean
  onLanguageChange: (language: string) => void
  onToggleLineNumbers: () => void
  onRun?: () => void
  isRunning?: boolean
  onRemove?: () => void
}

const CodeBlockToolbar: React.FC<CodeBlockToolbarProps> = ({
  language,
  code,
  showLineNumbers,
  onLanguageChange,
  onToggleLineNumbers,
  onRun,
  isRunning,
  onRemove,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="code-block-toolbar" contentEditable={false}>
      <select
        className="code-block-language-select"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        aria-label="Select programming language"
        onMouseDown={(e) => e.stopPropagation()}
        contentEditable={false}
      >
        <option value="plaintext">Plain Text</option>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>

      <div className="code-block-toolbar-actions">
        {(language === 'python' || language === 'java' || language === 'javascript' || language === 'c') && (
          <button
            type="button"
            className={`code-block-button code-block-run ${isRunning ? 'running' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRun}
            title="Run code (Python / Java / JavaScript / C)"
            aria-label="Run code"
            disabled={isRunning}
            contentEditable={false}
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        )}
        <button
          type="button"
          className="code-block-button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggleLineNumbers}
          title={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
          aria-pressed={showLineNumbers}
          contentEditable={false}
        >
          {showLineNumbers ? "123" : "№"}
        </button>

        <button
          type="button"
          className="code-block-button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCopy}
          title="Copy code to clipboard"
          aria-label="Copy code"
          contentEditable={false}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
        {onRemove && (
          <button
            type="button"
            className="code-block-button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRemove}
            title="Remove code block"
            aria-label="Remove code block"
            contentEditable={false}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default React.memo(CodeBlockToolbar)
