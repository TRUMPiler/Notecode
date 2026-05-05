# Code Block Component Architecture

## Overview

The code block system has been completely rewritten with a focus on **usability, clarity, and extensibility**. It provides a modern, Notion-like experience with syntax highlighting, language selection, line numbers, and copy-to-clipboard functionality.

## Architecture

### Module Structure

```
src/components/code-block/
├── CodeBlock.tsx              # Main component (edit/preview mode, hooks)
├── CodeBlockToolbar.tsx       # Toolbar (language select, copy, line numbers)
├── codeBlockUtils.ts          # Utilities (syntax highlighting, parsing, clipboard)
├── types.ts                   # TypeScript interfaces and constants
├── code-block.scss            # Comprehensive styling
└── index.ts                   # Barrel export
```

### Key Files

#### 1. **CodeBlock.tsx** (Main Component)
- **Dual-mode rendering**: Edit mode (textarea) + Preview mode (highlighted code)
- **Performance optimized**: Uses `useMemo` for syntax highlighting, `useCallback` for event handlers, `React.memo` for memoization
- **Controlled inputs**: All state managed locally
- **Keyboard handling**: 
  - Single Enter: inserts newline (stays in code block)
  - Double Enter: exits code block, creates paragraph below
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

#### 2. **CodeBlockToolbar.tsx** (Interactive Toolbar)
- **Language selector**: 16+ supported languages (JavaScript, Python, TypeScript, etc.)
- **Copy button**: Copies code to clipboard with visual feedback
- **Line number toggle**: Show/hide line numbers
- **Responsive design**: Adapts to mobile screens

#### 3. **codeBlockUtils.ts** (Utility Functions)
- `highlightCode()`: Syntax highlighting using Highlight.js with fallback to auto-detect
- `escapeHtml()`: XSS protection
- `parseCodeBlocks()`: Detect and parse triple backtick code blocks (```lang ... ```)
- `copyToClipboard()`: Native clipboard API wrapper
- `generateCodeBlockId()`: Unique ID generation for code blocks

#### 4. **types.ts** (Type Safety)
```typescript
interface CodeBlockData {
  id: string
  language: string
  code: string
  showLineNumbers: boolean
}

interface CodeBlockProps {
  id: string
  language: string
  code: string
  onUpdate: (code: string, language?: string) => void
  onDelete?: () => void
}
```

#### 5. **code-block.scss** (Styling)
- Dark theme with syntax highlighting colors
- Smooth transitions and hover effects
- Mobile responsive design
- Custom scrollbar styling
- Line number styling
- Accessible focus states

## Features

### ✅ Implemented

- **Syntax Highlighting**: Highlight.js integration with 16+ languages
- **Edit/Preview Toggle**: Click to edit, blur to save
- **Language Selection**: Dropdown to change language
- **Copy Button**: One-click copy with visual feedback
- **Line Numbers**: Toggle line numbers on/off
- **Double-Enter Exit**: Intuitive keyboard navigation
- **Performance**: Memoized rendering, optimized re-renders
- **Accessibility**: ARIA labels, keyboard support, semantic HTML
- **Responsive Design**: Mobile-friendly layout
- **Error Handling**: Graceful fallback for unsupported languages

### 🚀 Optional Enhancements

1. **Theme Selection**: Add light/dark theme toggle
2. **Diff View**: Show code changes with syntax highlighting
3. **Code Execution**: Integrate sandboxed code execution (e.g., CodePen, RunKit)
4. **Minimap**: Side-by-side minimap for long code blocks
5. **Keyboard Shortcuts**: 
   - `Ctrl/Cmd + Shift + L`: Toggle line numbers
   - `Ctrl/Cmd + K`: Keyboard shortcut panel
6. **Sharing**: Generate shareable code snippets with syntax highlighting
7. **Language Auto-Detection**: Auto-detect language from file extension
8. **Undo/Redo**: Full undo/redo support
9. **Collaborative Editing**: Real-time code editing with Yjs
10. **Code Formatting**: Auto-format with Prettier integration

## Usage

### Basic Usage

```tsx
import CodeBlock from "@/components/code-block/CodeBlock"

export default function Editor() {
  return (
    <CodeBlock
      id="my-code-block"
      language="javascript"
      code="const hello = () => console.log('Hello, World!');"
      onUpdate={(code, language) => {
        console.log("Code updated:", code, language)
      }}
    />
  )
}
```

### In TipTap Editor

The component is automatically integrated into the TipTap editor via a custom node view (see `CustomEditor.tsx`).

```tsx
// Insert code block via toolbar
<select onChange={(e) => editor.chain().focus().setCodeBlock({ language: e.target.value }).run()}>
  <option value="javascript">JavaScript</option>
  <option value="python">Python</option>
  {/* ... */}
</select>
```

### Parsing Code Blocks (Markdown-style)

```tsx
import { parseCodeBlocks } from "@/components/code-block/codeBlockUtils"

const text = `Here's some code:\n\`\`\`javascript\nconst x = 1;\n\`\`\``
const blocks = parseCodeBlocks(text)
// Output: [{ type: "text", content: "Here's some code:" }, { type: "code", language: "javascript", content: "const x = 1;" }]
```

## Performance Optimizations

1. **Memoization**:
   - `highlightedCode` uses `useMemo` to avoid re-highlighting on every render
   - `CodeBlockToolbar` wrapped in `React.memo`
   - `CodeBlock` wrapped in `React.memo`

2. **Event Handler Optimization**:
   - `useCallback` for `handleLanguageChange`, `handleToggleLineNumbers`, `handleBlur`, `handleKeyDown`
   - Prevents unnecessary re-renders of child components

3. **Lazy Rendering**:
   - Only highlight code that's visible
   - Textarea only rendered when editing

4. **Code Splitting**:
   - Highlight.js loaded on-demand
   - Utilities exported separately for tree-shaking

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback to `plaintext` for unsupported languages
- Clipboard API with fallback (optional)

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Shift+Enter)
- Focus visible indicators
- Semantic HTML (`<pre>`, `<code>`, `<button>`, `<select>`)
- Screen reader friendly

## Future Roadmap

1. **Server-side Rendering**: Implement SSR for Highlight.js
2. **Theming System**: Pluggable theme provider
3. **Code Execution**: Sandboxed code runner integration
4. **Collaborative Editing**: Real-time sync with WebSocket
5. **Plugin System**: Custom language highlighters and tools
6. **Performance**: Virtual scrolling for very long code blocks

---

**Component Status**: ✅ Production-Ready

This architecture is modular, performant, and ready for production use. All edge cases are handled gracefully.
