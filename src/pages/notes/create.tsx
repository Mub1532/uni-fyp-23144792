import NoteContent from "@/components/notes/content";
import useNoteEditor from "@/hooks/useNoteEditor";
import { NOTE_CODES } from "@/types/notes";
import { USER_CODES } from "@/types/user";
import { useRouter } from "next/router";
import { useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useDebounceCallback, useEventListener } from "usehooks-ts";

export default function Notes() {
    const router = useRouter();

    const editor = useNoteEditor();
    const lastSaved = useRef(editor?.getJSON());

    const debouncedSave = useDebounceCallback(async () => {
        const currentNote = editor?.getJSON();
        if (JSON.stringify(currentNote) === JSON.stringify(lastSaved.current))
            return;

        const noteSaved = await fetch(`/api/notes/create`, {
            method: "POST",
            body: JSON.stringify({
                note: currentNote,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const response = await noteSaved.json();

        switch (response?.code) {
            case USER_CODES.NOT_LOGGED_IN:
                toast.warn("Please login or sign up first.");
                break;
            case NOTE_CODES.SAVE_SUCCESS:
                lastSaved.current = currentNote;
                router.push(`/notes/${response?.noteID}`);
                toast.info("Note Saved Successfully.");
                break;
            case NOTE_CODES.SAVE_FAIL:
                toast.error("Failed to save Note.");
                break;
            default:
                toast.error("Unknown error.");
                break;
        }
    }, 200);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "s") {
                event.preventDefault();
                debouncedSave();
            }
        },
        [debouncedSave],
    );

    useEventListener("keydown", handleKeyDown);

    return <NoteContent editor={editor} />;
}
