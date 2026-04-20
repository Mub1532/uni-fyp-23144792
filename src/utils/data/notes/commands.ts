import type { Editor, JSONContent } from "@tiptap/react";

export const formatCommands = {
  title: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  subtitle: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  bold: (e) => e.chain().focus().toggleBold().run(),
  italic: (e) => e.chain().focus().toggleItalic().run(),
  underline: (e) => e.chain().focus().toggleUnderline().run(),
  bulletPoint: (e) => e.chain().focus().toggleBulletList().run(),
  numberedBullets: (e) => e.chain().focus().toggleOrderedList().run(),
  quotes: (e) => e.chain().focus().toggleBlockquote().run(),
  codeBlock: (e) => e.chain().focus().toggleCodeBlock().run(),
  divider: (e) =>
    e.chain().focus().liftListItem("listItem").setHorizontalRule().run(),
  link: (e) => {
    const selectedText = window.getSelection()?.toString() ?? "";
    const existingHref = e.getAttributes("link").href;
    const url = prompt("URL", existingHref || selectedText);
    if (url === null) return;
    if (url === "") {
      e.chain().focus().unsetLink().run();
      return;
    }
    e.chain()
      .focus()
      .setLink({ href: url, title: url ?? "Url Goes Here" })
      .run();
  },
  saveNote: (note: JSONContent, noteID: string) => saveNote(note, noteID),
} satisfies Record<
  string,
  (editor: Editor, selectedText: string, ...params: any) => void
>;

export async function saveNote(note: JSONContent, noteID: string) {
  console.log(note);
  const noteSaved = await fetch(`/api/notes/save`, {
    method: "POST",
    body: JSON.stringify({
      noteID: noteID,
      note: note,
    }),
  });

  const response = noteSaved.json();

  return response;
}
