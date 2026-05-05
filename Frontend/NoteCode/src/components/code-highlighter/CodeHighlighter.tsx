import React, { useMemo } from "react"
import hljs from "highlight.js/lib/core"
import "highlight.js/styles/github.css"

// lowlight (AST) for other integrations (kept here for parity)
import { createLowlight, common } from "lowlight"

// Import only the languages you need
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"

// Register languages with highlight.js
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("python", python)

// lowlight instance and registration (optional, useful if you parse AST elsewhere)
const lowlight = createLowlight(common)
lowlight.register("javascript", javascript)
lowlight.register("typescript", typescript)
lowlight.register("python", python)

interface CodeHighlighterProps {
  code: string
  language?: string
  className?: string
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ code, language = "", className = "" }) => {
  const highlighted = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value
      }

      // fallback to auto-detect
      const auto = hljs.highlightAuto(code)
      return auto.value
    } catch (e) {
      return escapeHtml(code)
    }
  }, [code, language])

  return (
    <pre className={`code-highlighter ${className}`} style={{ background: "#0b0b0b", padding: "1rem", borderRadius: 6 }}>
      <code className={`language-${language}` as string} dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  )
}

export default CodeHighlighter
