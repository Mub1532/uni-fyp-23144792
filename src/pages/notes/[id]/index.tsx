import NoteContent from "@/components/notes/content";
import useNoteEditor from "@/hooks/useNoteEditor";
import { NOTE_CODES } from "@/types/notes";
import { USER_CODES, type userInfo } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import type { JSONContent } from "@tiptap/react";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useDebounceCallback, useEventListener } from "usehooks-ts";

type Props = {
    initialContent: JSONContent;
    noteID: string;
    user: userInfo;
    errorCode?: number;
};

export default function Notes({ initialContent, noteID, errorCode }: Props) {
    const router = useRouter();

    useEffect(() => {
        if (errorCode === NOTE_CODES.NOT_FOUND || !initialContent) {
            toast.error("That note was not found.");
            router.push("/notes");
        }
    }, [errorCode, initialContent, router]);

    const { id } = router.query as { id: string };

    if (!id) {
        router.push("/notes");
        setTimeout(() => {
            toast.warn("No note was given.");
        }, 500);
    }

    const editor = useNoteEditor(initialContent);
    const lastSaved = useRef(editor?.getJSON());

    const debouncedSave = useDebounceCallback(async () => {
        const currentNote = editor?.getJSON();
        if (JSON.stringify(currentNote) === JSON.stringify(lastSaved.current))
            return;

        const noteSaved = await fetch(`/api/notes/save`, {
            method: "POST",
            body: JSON.stringify({
                noteID: noteID,
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
                toast.info("Note Saved Successfully.");
                lastSaved.current = currentNote;
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

export async function getServerSideProps({
    params,
    req,
}: GetServerSidePropsContext) {
    const { id } = params as { id: string };
    const rawCookie = req.headers.cookie;
    const user = await verifyUser(rawCookie as string);

    if (!user || !user?.id) {
        return {
            redirect: {
                destination: `/auth/login?code=${USER_CODES.NOT_LOGGED_IN}`,
                permanent: false,
            },
        };
    }

    if (!id) {
        return {
            redirect: {
                destination: "/notes?message=",
                permanent: false,
            },
        };
    }
    const connection = await getDBConnection();

    const [[rows]] = await connection.query<RowDataPacket[]>(
        "SELECT note from notes WHERE id = ? AND user_id = ?;",
        [id, user?.id],
    );

    if (!rows) {
        return {
            props: {
                initialContent: null,
                noteID: id,
                errorCode: NOTE_CODES.NOT_FOUND,
            },
        };
    }

    if (rows?.note)
        return {
            props: { initialContent: rows?.note ?? null, noteID: id },
        };

    return {
        props: {
            initialContent: null,
            noteID: id,
            errorCode: NOTE_CODES.NOT_FOUND,
        },
    };
}
