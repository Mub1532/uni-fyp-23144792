import type { JSONContent } from "@tiptap/react";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiStickyNoteAddLine } from "react-icons/ri";
import type { NoteItem } from "@/components/home/RecentNotes";
import ItemContainer from "@/components/misc/ItemContainer";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import { joinClasses } from "@/utils/misc/classes";

interface NotesProps extends MyPageProps {
  notes: (RowDataPacket & { note: JSONContent; id: number })[];
}

export default function Notes({ notes }: NotesProps) {
  const router = useRouter();

  return (
    <>
      <ItemContainer
        as="button"
        className="text-xl! flex gap-2 h-fit! p-3 py-2 mx-2 mb-4"
        onClick={() => {
          router.push("/notes/create");
        }}
      >
        <RiStickyNoteAddLine />
        <div className="text-sm md:text-md font-semibold">Create New Note</div>
      </ItemContainer>
      <StickyNoteContainer notes={notes} />
    </>
  );
}

type StickyProps = {
  noteID: string | number;
  title: string;
  content: string;
};

export function StickyNote({ noteID, title, content }: StickyProps) {
  return (
    <Link
      href={`/notes/${noteID}`}
      passHref
      aria-label={noteID as string}
      className="cursor-pointer hover:opacity-80 transition-all! ease-in duration-300 h-full aspect-square w-full dark:bg-blue-600/20 bg-yellow-200 flex flex-col gap-2 dark:text-slate-100 text-slate-700"
    >
      <div className="text-sm md:text-lgitems-center dark:bg-blue-500/30 bg-yellow-300 p-1 font-semibold h-fit truncate w-full">
        {title}
      </div>
      <p
        className={
          "px-1 text-xs md:text-sm font-medium h-fit w-full wrap-break-word line-clamp-6 overflow-hidden mb-2 text-start items-start"
        }
      >
        {content}
      </p>
    </Link>
  );
}

interface StickyNoteContainerProps {
  notes: NoteItem[];
  size?: "small" | "default";
  className?: string;
}

export function StickyNoteContainer({
  notes,
  size = "default",
  className,
}: StickyNoteContainerProps) {
  return (
    <div
      className={joinClasses(
        className,
        "h-fit w-full min-w-full grid overflow-y-auto overflow-x-hidden gap-y-4 gap-2.5",
        size === "small"
          ? "auto-rows-[7.5rem] md:auto-rows-[10.5rem] grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))]"
          : "px-2 grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] auto-rows-[10rem]",
      )}
    >
      {notes.map((item) => {
        const { title, content } = extractNoteInfo(item.note);
        return (
          <StickyNote
            key={item.id}
            noteID={item.id}
            title={title}
            content={content}
          />
        );
      })}
    </div>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
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

  const connection = await getDBConnection();

  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT note, id from notes  WHERE user_id = ?;",
    [currentUser?.id],
  );

  if (rows)
    return {
      props: { notes: rows },
    };

  return {
    props: { notes: undefined },
  };
}

export function extractNoteInfo(note: JSONContent): {
  title: string;
  content: string;
} {
  const title =
    note.content?.find((n) => n.type === "heading")?.content?.[0]?.text ??
    note.content
      ?.find((n) => n.type === "paragraph")
      ?.content?.[0]?.text?.split(" ")
      .slice(0, 4)
      .join(" ") ??
    "Untitled";

  const content =
    note.content
      ?.filter((n) => n.type !== "heading")
      ?.flatMap((n) => n.content?.map((c) => c.text) ?? [])
      ?.join(" ") ?? "";

  return { title, content };
}
