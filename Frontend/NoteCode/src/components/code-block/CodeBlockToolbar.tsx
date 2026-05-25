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
}

const CodeBlockToolbar: React.FC<CodeBlockToolbarProps> = ({
  language,
  code,
  showLineNumbers,
  onLanguageChange,
  onToggleLineNumbers,
  onRun,
  isRunning,
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
    <div className="code-block-toolbar">
      <select
        className="code-block-language-select"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        aria-label="Select programming language"
      >
        <option value="plaintext">Plain Text</option>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>

      <div className="code-block-toolbar-actions">
        {(language === 'python' || language === 'java') && (
          <button
            className={`code-block-button code-block-run ${isRunning ? 'running' : ''}`}
            onClick={onRun}
            title="Run code (Python / Java)"
            aria-label="Run code"
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
        )}
        <button
          className="code-block-button"
          onClick={onToggleLineNumbers}
          title={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
          aria-pressed={showLineNumbers}
        >
          {showLineNumbers ? "123" : "№"}
        </button>

        <button
          className="code-block-button"
          onClick={handleCopy}
          title="Copy code to clipboard"
          aria-label="Copy code"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  )
}

export default React.memo(CodeBlockToolbar)
