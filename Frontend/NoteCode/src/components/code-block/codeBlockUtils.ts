/**
 * Utility functions for code block operations
 */

import hljs from "highlight.js"

/**
 * Highlight code with the given language
 * Falls back to auto-detect if language is not supported
 */
export function highlightCode(code: string, language: string): string {
  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value
    }
    // Fallback to auto-detect
    return hljs.highlightAuto(code).value
  } catch (error) {
    console.warn(`Syntax highlighting failed for ${language}:`, error)
    return escapeHtml(code)
  }
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return str.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Detect code blocks using triple backticks (```) and convert them
 * Returns an array of code block objects and text between them
 */
export function parseCodeBlocks(text: string): Array<{ type: "text" | "code"; content: string; language?: string }> {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  const results: Array<{ type: "text" | "code"; content: string; language?: string }> = []
  let lastIndex = 0

  let match
  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      results.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      })
    }

    // Add code block
    results.push({
      type: "code",
      language: match[1] || "plaintext",
      content: match[2].trim(),
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    results.push({
      type: "text",
      content: text.substring(lastIndex),
    })
  }

  // If no code blocks found, return the original text
  if (results.length === 0) {
    return [{ type: "text", content: text }]
  }

  return results
}

/**
 * Generate a unique ID for code blocks
 */
export function generateCodeBlockId(): string {
  return `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}
