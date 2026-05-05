/**
 * Type definitions for the CodeBlock system
 */

export interface CodeBlockData {
  id: string
  language: string
  code: string
  showLineNumbers: boolean
}

export interface CodeBlockProps {
  id: string
  language: string
  code: string
  onUpdate: (code: string, language?: string) => void
  onDelete?: () => void
}

export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "jsx",
  "tsx",
  "json",
  "bash",
  "sql",
  "ruby",
  "php",
  "java",
  "csharp",
  "go",
  "rust",
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
