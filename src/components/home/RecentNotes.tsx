import type { JSONContent } from "@tiptap/react";
import Link from "next/link";
import { FaStickyNote } from "react-icons/fa";
import { StickyNoteContainer } from "@/pages/notes";
import { QuickButton } from "./QuickButton";

interface RecentNotesProps {
  notes: NoteItem[];
}

export interface NoteItem {
  id: number;
  note: JSONContent;
}

export function RecentNotes({ notes }: RecentNotesProps) {
  return (
    <div className="h-fit! md:h-full w-full flex flex-col gap-4">
      <div className="text-sm uppercase text-slate-800 dark:text-slate-300 font-semibold flex items-center justify-center gap-2 px-0 md:px-1 p-3">
        <FaStickyNote className="text-yellow-400 text-xl" />
        Your Recent Notes
      </div>
      {notes.length !== 0 && (
        <QuickButton
          href="/notes"
          label="View all Notes"
          icon={FaStickyNote}
          extraIconClass="text-sm!"
          className="text-md! w-full! flex items-center! justify-center md:w-fit!"
        />
      )}
      {notes.length !== 0 ? (
        <StickyNoteContainer notes={notes} size="small" />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg dark:bg-slate-700 bg-blue-300">
          <FaStickyNote className="text-3xl text-yellow-400 dark:text-yellow-500" />
          <p className="text-sm dark:text-slate-400 font-bold">No notes yet</p>
          <Link
            href="/notes/create"
            className="text-md dark:text-blue-400 text-slate-100 hover:underline font-bold"
          >
            Create your first note
          </Link>
        </div>
      )}
    </div>
  );
}
