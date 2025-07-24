// You can put this in a separate file, e.g., CustomKeymapExtension.ts
import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/core'; // Ensure Editor type is imported

const CustomKeymapExtension = Extension.create({
  name: 'customKeymapExtension',

  addKeyboardShortcuts() {
    return {
      'Tab': ({ editor }: { editor: Editor }) => {
        // Check if the cursor is NOT inside a codeBlock
        if (!editor.isActive('codeBlock')) {
          // Attempt to insert two spaces
          // The insertContent command returns true if successful, false otherwise.
          // By calling it and then returning true, we ensure that
          // even if insertContent somehow failed but we still want to
          // prevent the default Tab behavior (like changing focus), we can.
          editor.commands.insertContent({
            type: 'text',
            text: '  ', // Insert two spaces for indentation
          });
          return true; // Indicate the key was handled, preventing default Tab behavior
        }
        // If inside a code block, return false to allow default Tab behavior
        // or behavior defined by the CodeBlockLowlight extension.
        return false;
      },
      // You can add other custom shortcuts here
      // 'Mod-Enter': () => this.editor.commands.setHardBreak(),
    };
  },
});

export default CustomKeymapExtension;