import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { type Editor, type JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";

const lowlight = createLowlight(all);

export default function useNoteEditor(initialContent?: JSONContent) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content:
      initialContent ??
      `<h2>Note Title Goes Here</h2><p>Click the text to edit...</p><p>You can format the text how you want, with <strong>bold</strong> <em>italic</em> <u>underlined</u> words....</p><pre><code>print("Or You could have code blocks")</code></pre><p>And more options above</p><p>All the options can be chosen by clicking them above</p>`,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert outline-none border-none w-full h-full p-4 leading-none! m-0! max-w-none",
      },
    },
  });

  return editor as Editor;
}
