// // import React, { useEffect, useRef } from 'react';
// // import { EditorContent, useEditor } from '@tiptap/react';
// // import StarterKit from '@tiptap/starter-kit';
// // import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
// // import './styles.css';
// // import { Image } from '@tiptap/extension-image';
// // import "highlight.js/styles/docco.css";
// // import TextAlign from '@tiptap/extension-text-align';
// // import { all, createLowlight } from 'lowlight';
// // import { Editor } from '@tiptap/core'; // Import the Editor type

// // const lowlight = createLowlight(all);

// // const Tiptap: React.FC = () => {
// //   const editor = useEditor({
// //     extensions: [
// //       StarterKit,
// //       Image,
// //       CodeBlockLowlight.configure({
// //         lowlight,
// //         languageClassPrefix: 'language-',
// //       }),
// //       TextAlign.configure({
// //         types: ['heading', 'paragraph'],
// //         alignments: ['left', 'right'],
// //       }),
// //     ],
// //     content: `
// //       <p>Type triple backticks followed by a language (optional), then Enter to create a code block.</p> <p>You can also paste images here!</p> <pre><code class="language-javascript">for (var i=1; i <= 20; i++)
// // {
// //   if (i % 15 == 0)
// //     console.log("FizzBuzz");
// //   else if (i % 3 == 0)
// //     console.log("Fizz");
// //   else if (i % 5 == 0)
// //     console.log("Buzz");
// //   else
// //     console.log(i);
// // }</code></pre>
// //     `,
// //     keys: {
// //       Tab: ({ editor }: { editor: Editor }) => {
// //         if (!editor.isActive('codeBlock')) {
// //           editor.commands.insertContent({
// //             type: 'text',
// //             text: '  ', // Insert two spaces for indentation
// //           });
// //           return true; // Prevent default tab behavior (focus change)
// //         }
// //         return false; // Let the default tab behavior in code blocks remain
// //       },
// //     },
// //   });

// //   const editorContentRef = useRef<HTMLDivElement>(null);

// //   useEffect(() => {
// //     if (editor && editorContentRef.current) {
// //       const handlePaste = async (event: ClipboardEvent) => {
// //         const items = (event.clipboardData || (event as any).dataTransfer).items;
// //         let imagePasted = false; // Flag to track if an image was already pasted

// //         for (let i = 0; i < items.length; i++) {
// //           if (items[i].type.startsWith('image/') && !imagePasted) {
// //             imagePasted = true;
// //             event.preventDefault();
// //             event.stopPropagation(); // Add stopPropagation to prevent further handling

// //             const file = items[i].getAsFile();
// //             if (file) {
// //               const reader = new FileReader();
// //               reader.onload = (upload: ProgressEvent<FileReader>) => {
// //                 if (editor) {
// //                   editor.commands.insertContent({
// //                     type: 'image',
// //                     attrs: {
// //                       src: upload.target?.result as string,
// //                       alt: 'pasted image',
// //                     },
// //                   });
// //                 }
// //               };
// //               reader.readAsDataURL(file);
// //             }
// //             break; // Exit the loop after handling the first image
// //           }
// //         }
// //       };

// //       editorContentRef.current.addEventListener('paste', handlePaste);

// //       return () => {
// //         if (editorContentRef.current) {
// //           editorContentRef.current.removeEventListener('paste', handlePaste);
// //         }
// //       };
// //     }
// //   }, [editor]);

// //   return (
// //     <div className="editor-container">
// //       {editor ? (
// //         <EditorContent editor={editor as Editor} ref={editorContentRef} />
// //       ) : (
// //         <p>Loading editor...</p>
// //       )}
// //     </div>
// //   );
// // };

// // export default Tiptap;

// import React, { useEffect, useRef } from 'react';
// import { EditorContent, useEditor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
// import './styles.css';
// import { Image } from '@tiptap/extension-image';
// import "highlight.js/styles/docco.css";
// import TextAlign from '@tiptap/extension-text-align';
// import { all, createLowlight } from 'lowlight';
// import { Editor } from '@tiptap/core'; // Import the Editor type

// // Import your custom extension
// import CustomKeymapExtension from './CustomKeyMapExtension'; // Adjust path if needed

// const lowlight = createLowlight(all);

// const Tiptap: React.FC = () => {
//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Image,
//       CodeBlockLowlight.configure({
//         lowlight,
//         languageClassPrefix: 'language-',
//       }),
//       TextAlign.configure({
//         types: ['heading', 'paragraph'],
//         alignments: ['left', 'right'],
//       }),
//       CustomKeymapExtension, // Add your custom extension here
//     ],
//     content: `
//       <p>Type triple backticks followed by a language (optional), then Enter to create a code block.</p> <p>You can also paste images here!</p> <pre><code class="language-javascript">for (var i=1; i <= 20; i++)
// {
//   if (i % 15 == 0)
//     console.log("FizzBuzz");
//   else if (i % 3 == 0)
//     console.log("Fizz");
//   else if (i % 5 == 0)
//     console.log("Buzz");
//   else
//     console.log(i);
// }</code></pre>
//     `,
//     // The 'keys' property is removed from here as it's now handled by CustomKeymapExtension
//   });

//   const editorContentRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (editor && editorContentRef.current) {
//       const handlePaste = async (event: ClipboardEvent) => {
//         const items = (event.clipboardData || (event as any).dataTransfer).items;
//         let imagePasted = false;

//         for (let i = 0; i < items.length; i++) {
//           if (items[i].type.startsWith('image/') && !imagePasted) {
//             imagePasted = true;
//             event.preventDefault();
//             event.stopPropagation();

//             const file = items[i].getAsFile();
//             if (file) {
//               const reader = new FileReader();
//               reader.onload = (upload: ProgressEvent<FileReader>) => {
//                 if (editor) {
//                   const result = upload.target?.result;
//                   if (typeof result === 'string') {
//                     editor.commands.insertContent({
//                       type: 'image',
//                       attrs: {
//                         src: result,
//                         alt: 'pasted image',
//                       },
//                     });
//                   }
//                 }
//               };
//               reader.readAsDataURL(file);
//             }
//             break;
//           }
//         }
//       };

//       const currentEditorContent = editorContentRef.current;
//       currentEditorContent.addEventListener('paste', handlePaste);

//       return () => {
//         currentEditorContent.removeEventListener('paste', handlePaste);
//       };
//     }
//   }, [editor]);

//   return (
//     <div className="editor-container">
//       {editor ? (
//         <EditorContent editor={editor} ref={editorContentRef} />
//       ) : (
//         <p>Loading editor...</p>
//       )}
//     </div>
//   );
// };

// export default Tiptap;
import React, { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import "./styles.css";
import { Image } from "@tiptap/extension-image";
import "highlight.js/styles/docco.css";
import TextAlign from "@tiptap/extension-text-align";
import { all, createLowlight } from "lowlight";

const lowlight = createLowlight(all);

interface TiptapProps {
  setCode: (code: string) => void;
}

const Tiptap: React.FC<TiptapProps> = ({ setCode }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      CodeBlockLowlight.configure({
        lowlight,
        languageClassPrefix: "language-",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "right"],
      }),
    ],
    content: `
    <p>Instead of this write a proper description</p>
    `,
    onUpdate: ({ editor }) => {
      setCode(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      setCode(editor.getHTML());
    },
  });

  return (
    <div className="editor-container text-left">
      {editor ? <EditorContent editor={editor} /> : <p>Loading editor...</p>}
    </div>
  );
};

export default Tiptap;
