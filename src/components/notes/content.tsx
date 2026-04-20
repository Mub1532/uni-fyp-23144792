import { noteEditorHeaderItems } from "@/utils/data/notes/editorItems";
import { type Editor, EditorContent } from "@tiptap/react";
import type { DebouncedState } from "usehooks-ts";
import NoteHeaderItems from "./header/container";

type props = {
    editor: Editor;
    saveFunction: DebouncedState<() => Promise<void>>;
    saveLoading?: boolean;
};

export default function NoteContent({
    editor,
    saveFunction,
    saveLoading,
}: props) {
    return (
        <div className="h-full w-full flex flex-col px-2 items-center gap-6 -mt-2 overflow-hidden">
            <NoteHeaderItems
                saveFunction={saveFunction}
                editor={editor}
                items={noteEditorHeaderItems}
                saveLoading={saveLoading}
            />
            <div className="border-x-2 border-slate-500/20 w-full md:w-3/4 lg:w-1/2  h-full flex px-4 overflow-auto">
                <EditorContent
                    className="border-none! focus:border-none! w-full h-full"
                    editor={editor}
                />
            </div>
        </div>
    );
}
