import { Extension } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Placeholder } from "@tiptap/extensions";
import { Plugin } from "@tiptap/pm/state";
import { type Editor, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";

// REFERENCES: https://tiptap.dev/docs

const lowlight = createLowlight(all);

const CantRemovePart = Extension.create({
  name: "CantRemovePart",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction(transaction, state) {
          if (!transaction.docChanged) return true;

          let blocked = false;

          transaction.mapping.maps.forEach((map) => {
            map.forEach((oldStart, oldEnd) => {
              state.doc.nodesBetween(oldStart, oldEnd, (node, pos) => {
                if (node.type.name === "horizontalRule") {
                  if (pos >= oldStart && pos + node.nodeSize <= oldEnd) {
                    blocked = true;
                  }
                }

                if (node.type.name === "heading" && node.attrs.level === 2) {
                  const headingStart = pos + 1;
                  const headingEnd = pos + node.nodeSize - 1;
                  const selectionInsideHeading =
                    oldStart >= headingStart && oldEnd <= headingEnd;
                  if (!selectionInsideHeading) {
                    blocked = true;
                  }
                }
              });
            });
          });

          return !blocked;
        },
      }),
    ];
  },
  addKeyboardShortcuts() {
    return {
      // if pressin enter on main title go to the main content
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

      // ctrl a thing, to separate title and content,eg if u on the header title only select that and if on content only that
      "Mod-a": ({ editor }) => {
        const { state } = editor;
        const { $anchor } = state.selection;
        const cursorPos = $anchor.pos;
        const docSize = state.doc.content.size;

        let firstHr: number | null = null;
        let nearestHr: number | null = null;

        state.doc.descendants((node, pos) => {
          if (node.type.name === "horizontalRule" && pos <= 5) {
            if (firstHr === null) firstHr = pos;
            if (pos < cursorPos) nearestHr = pos;
          }
        });

        if (firstHr === null) return false;

        if (cursorPos <= firstHr) {
          editor.commands.setTextSelection({ from: 1, to: firstHr - 1 });
        } else if (nearestHr !== null) {
          editor.commands.setTextSelection({
            from: nearestHr + 2,
            to: docSize,
          });
        }

        return true;
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
