# NoteCode — Emoji Picker Feature Prompt

## Context
I am building **NoteCode**, a rich-text note-taking app for developers and students. The editor is built with **TipTap** (React). I need you to build a fully working emoji picker feature that integrates into the editor via TipTap's FloatingMenu extension.

---

## Stack
- React (functional components + hooks)
- TipTap editor with `@tiptap/react` and `@tiptap/starter-kit`
- `@emoji-mart/data` for the emoji dataset
- Tailwind CSS for styling (or plain CSS modules if Tailwind is unavailable)
- No external picker library (e.g. do NOT use `emoji-mart` the UI component — only use `@emoji-mart/data` for data)

---

## Feature Requirements

### 1. FloatingMenu trigger
- Use TipTap's `<FloatingMenu>` extension
- The menu should appear **only on empty paragraphs** (default TipTap behaviour)
- The floating menu contains **only one button**: an emoji icon button labelled "Emoji"
- When clicked, the button opens the emoji picker popover

### 2. Emoji picker popover
The picker is a custom-built React component (not emoji-mart's built-in UI). It must include:

**Search bar**
- Auto-focused when picker opens
- Filters emoji in real time as the user types
- Searches against emoji `name` and `shortcode` fields from the dataset
- Debounced at 300ms to avoid excessive filtering on fast typing

**Category tabs**
- Display emoji categories as icon buttons in a horizontal row
- Categories: Smileys, People, Animals, Food, Travel, Objects, Symbols, Flags
- Clicking a tab filters the grid to that category
- Active tab is visually highlighted
- Searching overrides the active category and shows results across all categories

**Emoji grid**
- 8 columns, fixed size
- Each emoji renders as a button (32x32px hit area)
- Hover state: subtle background highlight
- On hover: show a preview bar at the bottom of the picker with the emoji, its full name, and shortcode (e.g. `:heart_eyes:`)

**Recents row**
- Shown at the bottom of the picker above the preview bar
- Displays the last 8 used emojis
- Persisted to `localStorage` under the key `notecode:emoji_recents`
- Updated every time an emoji is selected

### 3. Inserting into the editor
- On emoji click: insert the unicode character at the current cursor position using:
  ```js
  editor.chain().focus().insertContent(emoji.native).run()
  ```
- After insertion: close the picker
- The paragraph is no longer empty after insertion, so TipTap's FloatingMenu auto-hides — no manual cleanup needed

### 4. Picker dismissal
- Clicking outside the picker closes it
- Pressing `Escape` closes it
- After closing, focus returns to the editor automatically

### 5. Lazy loading emoji data
- Do NOT import `@emoji-mart/data` at the top level
- Use a dynamic `import()` inside a `useEffect` or on first open so the ~200KB dataset loads only when the picker is first opened

---

## Component Structure
Build the feature as the following component tree:

```
<TipTapEditor>
  └── <FloatingMenu>
        └── <EmojiMenuButton onOpen={openPicker} isOpen={isPickerOpen} />
              └── <EmojiPicker (portal)>
                    ├── <SearchBar />
                    ├── <CategoryTabs />
                    ├── <EmojiGrid />
                    ├── <RecentsRow />
                    └── <PreviewBar />
```

- `EmojiPicker` must render via `ReactDOM.createPortal` into `document.body` so it escapes the editor DOM and avoids z-index or style conflicts
- Pass the `editor` instance down as a prop or via a React context

---

## Data Shape (from @emoji-mart/data)
Each emoji object in the dataset looks like:
```json
{
  "id": "heart_eyes",
  "name": "Smiling Face with Heart-Eyes",
  "keywords": ["love", "affection", "valentines"],
  "skins": [{ "unified": "1f60d", "native": "😍" }],
  "version": 1
}
```
Use `emoji.skins[0].native` to render the unicode character.

---

## Behaviour Details

| Interaction | Expected behaviour |
|---|---|
| Cursor on empty line | FloatingMenu appears with emoji button |
| Click emoji button | Picker opens, search input auto-focused |
| Type in search | Grid filters across all categories in real time |
| Click category tab | Grid shows that category; clears search |
| Hover emoji | Preview bar updates with name + shortcode |
| Click emoji | Inserts into editor, picker closes, recents updated |
| Press Escape | Picker closes, focus returns to editor |
| Click outside picker | Picker closes, focus returns to editor |
| Re-open picker | Recents row shows last 8 used emojis |

---

## Styling Notes
- The picker is 300px wide
- Picker has a soft border (`1px solid #e5e7eb`) and rounded corners (`12px`)
- Background is white (light mode) / `#1e1e1e` (dark mode)
- Emoji grid buttons are 36x36px with `border-radius: 6px`
- Active category tab has a subtle filled background
- Preview bar is always visible at the bottom even when no emoji is hovered (show a placeholder hint like "Hover an emoji to preview")
- Support both light and dark mode via CSS variables or a `data-theme` attribute

---

## What NOT to do
- Do NOT use the `emoji-mart` React component directly — build the UI from scratch using only `@emoji-mart/data` for data
- Do NOT load the emoji dataset on page load — lazy load it
- Do NOT use `position: fixed` for the popover — use a portal with `position: absolute` anchored to the button
- Do NOT forget to clean up the `keydown` and `mousedown` event listeners on unmount
- Do NOT insert an emoji as HTML — always use `.insertContent(emoji.native)` which inserts plain unicode

---

## Deliverables
1. `EmojiPicker.jsx` — the full picker component
2. `EmojiMenuButton.jsx` — the floating menu button that triggers the picker
3. `useEmojiRecents.js` — a custom hook for reading/writing recents from localStorage
4. `FloatingMenuWrapper.jsx` — wraps TipTap's FloatingMenu and renders the EmojiMenuButton inside it
5. Brief inline comments on non-obvious logic (debounce, portal mounting, lazy load)