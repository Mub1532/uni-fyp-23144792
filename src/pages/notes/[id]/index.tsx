import type { JSONContent } from "@tiptap/react";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useDebounceCallback, useEventListener } from "usehooks-ts";
import NoteContent from "@/components/notes/content";
import useNoteEditor from "@/hooks/useNoteEditor";
import { NOTE_CAL_CODES } from "@/types/notes";
import { USER_CODES, type userInfo } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

type Props = {
  initialContent: JSONContent;
  noteID: string;
  user: userInfo;
  errorCode?: number;
};

export default function Notes({ initialContent, noteID, errorCode }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (errorCode === NOTE_CAL_CODES.NOT_FOUND) {
      toast.error("That note was not found.");
      router.push("/notes");
    }
  }, [errorCode, router]);

  const { id } = router.query as { id: string };

  if (!id) {
    router.push("/notes");
    setTimeout(() => {
      toast.warn("No note was given.");
    }, 500);
  }

  const editor = useNoteEditor(initialContent);
  const lastSaved = useRef(editor?.getJSON());
  const [saveLoading, setSaveLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const debouncedSave = useDebounceCallback(async () => {
    const currentNote = editor?.getJSON();
    if (JSON.stringify(currentNote) === JSON.stringify(lastSaved.current))
      return;

    setSaveLoading(true);

    let responseFetch: Response;

    if (id !== "create") {
      responseFetch = await fetch(`/api/notes/save`, {
        method: "POST",
        body: JSON.stringify({
          noteID: noteID,
          note: currentNote,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      responseFetch = await fetch(`/api/notes/create`, {
        method: "POST",
        body: JSON.stringify({
          note: currentNote,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const response = await responseFetch.json();

    setSaveLoading(false);

    switch (response?.code) {
      case USER_CODES.NOT_LOGGED_IN:
        toast.warn("Please login or sign up first.");
        break;
      case NOTE_CAL_CODES.SAVE_SUCCESS:
        toast.info(
          id === "create"
            ? "Created Note Successfully."
            : "Note Saved Successfully.",
        );
        if (id === "create") {
          router.push(`/notes/${response?.noteID}`);
        }
        lastSaved.current = currentNote;
        break;
      case NOTE_CAL_CODES.SAVE_FAIL:
        toast.error("Failed to save Note.");
        break;
      default:
        toast.error("Unknown error.");
        break;
    }
  }, 200);

  const debouncedDelete = useDebounceCallback(async () => {
    setDelLoading(true);

    const responseFetch = await fetch(`/api/notes/delete`, {
      method: "POST",
      body: JSON.stringify({
        noteID: noteID,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await responseFetch.json();

    setDelLoading(false);

    switch (response?.code) {
      case USER_CODES.NOT_LOGGED_IN:
        toast.warn("Please login or sign up first.");
        break;
      case NOTE_CAL_CODES.DELETE_SUCCESS:
        toast.info("Note Deleted Successfully");
        router.push(`/notes`);
        break;
      case NOTE_CAL_CODES.DELETE_FAIL:
        toast.error("Failed to Delete Note.");
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

  return (
    <NoteContent
      saveLoading={saveLoading}
      saveFunction={debouncedSave}
      deleteFunction={debouncedDelete}
      deleteLoading={delLoading}
      editor={editor}
    />
  );
}

export async function getServerSideProps({
  params,
  req,
}: GetServerSidePropsContext) {
  const { id } = params as { id: string };
  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser?.id) {
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
        destination: "/notes",
        permanent: false,
      },
    };
  }

  if (id === "create")
    return {
      props: {
        initialContent: null,
        noteID: "create",
      },
    };

  const connection = await getDBConnection();

  const [[rows]] = await connection.query<RowDataPacket[]>(
    "SELECT note from notes WHERE id = ? AND user_id = ?;",
    [id, currentUser?.id],
  );

  if (!rows) {
    return {
      props: {
        initialContent: null,
        noteID: id,
        errorCode: NOTE_CAL_CODES.NOT_FOUND,
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
      errorCode: NOTE_CAL_CODES.NOT_FOUND,
    },
  };
}
