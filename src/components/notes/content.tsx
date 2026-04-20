import { noteEditorHeaderItems } from "@/utils/data/notes/editorItems";
import { type Editor, EditorContent } from "@tiptap/react";
import NoteHeaderItems from "./header/container";

type props = {
    editor: Editor;
};

export default function NoteContent({ editor }: props) {
    return (
        <div className="h-full w-full flex flex-col px-2 items-center gap-6 -mt-2 overflow-hidden">
            <NoteHeaderItems editor={editor} items={noteEditorHeaderItems} />
            <div className="border-x-2 border-slate-500/20 w-full md:w-3/4 lg:w-1/2  h-full flex px-4 overflow-auto">
                <EditorContent
                    className="border-none! focus:border-none! w-full h-full"
                    editor={editor}
                />
            </div>
        </div>
    );
}
