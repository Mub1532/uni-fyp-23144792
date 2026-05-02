import { Extension } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Placeholder } from "@tiptap/extensions";
import { type Editor, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";

// REFERENCES: https://tiptap.dev/docs

const lowlight = createLowlight(all);

const CantRemovePart = Extension.create({
  name: "CantRemovePart",
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $anchor } = editor.state.selection;
        if ($anchor.parent.type.name === "heading" && $anchor.start() === 1) {
          let afterHr: number | null = null;
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === "horizontalRule" && afterHr === null) {
              afterHr = pos + node.nodeSize;
            }
          });
          if (afterHr !== null) {
            const node = editor.state.doc.nodeAt(afterHr);
            const endOfNode = afterHr + (node?.nodeSize ?? 1) - 1;
            editor.commands.focus(endOfNode);
            return true;
          }
        }
        return false;
      },

      Tab: ({ editor }) => {
        const { $anchor } = editor.state.selection;
        if ($anchor.parent.type.name === "heading") {
          let afterHr: number | null = null;
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name === "horizontalRule" && afterHr === null) {
              afterHr = pos + node.nodeSize;
            }
          });
          if (afterHr !== null) {
            const node = editor.state.doc.nodeAt(afterHr);
            const endOfNode = afterHr + (node?.nodeSize ?? 1) - 1;
            editor.commands.focus(endOfNode);
            return true;
          }
        }
        return false;
      },
    };
  },
});

const PlaceholderPart = Placeholder.configure({
  showOnlyCurrent: false,
  placeholder: ({ node }) => {
    if (node.type.name === "heading") return "Title Goes Here...";
    return "Click here to edit, or keyboard shortcuts work also";
  },
});

export default function useNoteEditor(initialContent?: JSONContent) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      CantRemovePart,
      PlaceholderPart,
    ],
    content: initialContent ?? `<h2></h2><hr /><p>`,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert outline-none border-none w-full h-full p-4 leading-none! m-0! max-w-none",
      },
    },
    autofocus: true,
  });

  return editor as Editor;
}
