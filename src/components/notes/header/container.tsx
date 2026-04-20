import type { NoteHeaderItemClass } from "@/types/notes";
import {
    defaultScrollbar,
    joinClasses,
    scrollHint,
} from "@/utils/misc/classes";
import type { Editor } from "@tiptap/react";
import { FaSave } from "react-icons/fa";
import NoteHeaderItem from "./item";

type props = {
    items: NoteHeaderItemClass[];
    editor: Editor;
};

export default function NoteHeaderItems({ items, editor }: props) {
    return (
        <div
            className={joinClasses(
                "w-full h-max min-h-12 rounded-md flex items-center px-2 bg-blue-100 dark:bg-slate-700 gap-1 overflow-hidden",
                defaultScrollbar,
            )}
        >
            <div
                className={joinClasses(
                    "w-full h-full flex items-center overflow-x-auto overflow-y-hidden gap-1 my-2",
                    defaultScrollbar,
                    scrollHint,
                )}
            >
                {items.map((item) => (
                    <NoteHeaderItem {...item} editor={editor} key={item.title} />
                ))}
            </div>
            <NoteHeaderItem
                editor={editor}
                icon={FaSave}
                title="Save"
                command="saveNote"
                extraClass="mr-0 ml-auto bg-blue-500 rounded-sm px-2 text-slate-200!"
                defaultText={false}
            />
        </div>
    );
}
