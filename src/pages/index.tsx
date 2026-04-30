import type { JSONContent } from "@tiptap/react";
import moment from "moment";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useState } from "react";
import { FaClock, FaGoogle, FaStickyNote } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { TypeAnimation } from "react-type-animation";
import type { CalendarEvent } from "@/components/calendar/modal";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import { extractNoteInfo, StickyNote } from "./notes";

interface HomeProps extends MyPageProps {
  notes: { id: string; note: JSONContent }[];
  calendar: string;
}

export default function index({ user, notes, calendar }: HomeProps) {
  const events: CalendarEvent[] = JSON.parse(calendar ?? "[]");
  const [showDate, setShowDate] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const todayEvents = events.filter((e) =>
    moment(e.start).isSame(moment(), "day"),
  );

  const upcomingEvents = events
    .filter((e) => moment(e.start).isAfter(moment(), "day"))
    .slice(0, 5);

  return (
    <div className="h-full w-full flex flex-col text-slate-600 dark:text-slate-300 px-2 gap-1">
      {/* Header */}
      {user?.username && (
        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
          <div className="text-xl font-semibold dark:text-slate-100 flex gap-[0.3ch]">
            <TypeAnimation
              key={user.username}
              sequence={["Welcome, ", 0, () => setShowWelcome(true)]}
              speed={60}
              cursor={false}
            />
            {showWelcome && (
              <TypeAnimation
                sequence={[user.username, 100, () => setShowDate(true)]}
                speed={60}
                cursor={false}
                className="text-blue-400"
              />
            )}
          </div>
          {showDate && (
            <div className="text-sm text-slate-400 ">
              <TypeAnimation
                sequence={[
                  `It is currently ${moment().format("dddd Do MMMM [-] HH:mm")}`,
                ]}
                speed={60}
                cursor={false}
              />
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
        {/* Main */}
        <div className="overflow-y-auto pr-4 py-5 border-r border-slate-200 dark:border-slate-700 flex flex-col gap-5 h-full w-full">
          {/* AI Summary */}
          <div className="rounded-lg bg-blue-300 dark:bg-slate-700 p-4">
            <TypeAnimation
              sequence={["AI Summary"]}
              speed={10}
              cursor={false}
              className="text-xs uppercase tracking-widest text-blue-900 dark:text-blue-300 font-bold mb-2"
            />

            <p className="text-sm font-semibold leading-relaxed">
              <span className="block">
                Calendar:{" "}
                {todayEvents.length === 0
                  ? "nothing on today"
                  : `${todayEvents.length} event${todayEvents.length !== 1 ? "s" : ""} lined up${upcomingEvents.length > 0 ? `, ${upcomingEvents.length} more coming` : ""}`}
              </span>
              <span className="block">
                Notes:{" "}
                {notes.length === 0
                  ? "nothing recent"
                  : `${notes.length} note${notes.length !== 1 ? "s" : ""} to catch up on`}
              </span>
              <span className="block mt-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                {todayEvents.length === 0
                  ? "Looks like a free day."
                  : todayEvents.length > 3
                    ? "Busy one today."
                    : "Fairly light day overall."}{" "}
                {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""}{" "}
                and {notes.length} note{notes.length !== 1 ? "s" : ""}.
              </span>
            </p>
          </div>

          {/* Recent Notes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1">
                <FaStickyNote className="text-yellow-400" />
                Recent Notes
              </div>
              <Link
                href="/notes"
                className="text-xs text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>

            {notes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-6 flex flex-col items-center justify-center gap-2 text-center">
                <FaStickyNote className="text-2xl text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400">No notes created yet</p>
                <Link href="/notes/create">
                  <span className="text-xs text-blue-400 hover:underline">
                    Create your first note
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3">
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
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="overflow-y-auto px-4 py-5 flex flex-col gap-5 h-full w-full">
          {/* Today */}
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3 flex items-center justify-center gap-1">
              <FaClock className="text-blue-400" />
              Your Schedule
            </div>
          </div>

          {/* Upcoming */}
          {upcomingEvents.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
                Upcoming
              </div>
              <div className="flex flex-col gap-1">
                {upcomingEvents.map((e) => (
                  <Link href="/calendar" key={e.id}>
                    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0 hover:text-blue-400 transition-colors cursor-pointer">
                      <div className="flex gap-2 items-center">
                        <span
                          suppressHydrationWarning
                          className="text-xs text-slate-400 w-16 shrink-0"
                        >
                          {moment(e.start).format("DD MMM")}
                        </span>
                        <span className="text-sm truncate">{e.title}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {todayEvents.length === 0 ? (
            <div className="text-sm text-slate-400">Nothing today</div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="text-sm text-slate-400 font-semibold">
                Todays Events
              </div>
              {todayEvents.map((e) => (
                <Link href="/calendar" key={e.id}>
                  <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0 hover:text-blue-400 transition-colors cursor-pointer">
                    <div className="flex gap-2 items-center">
                      <span
                        suppressHydrationWarning
                        className="text-xs font-medium w-fit"
                      >
                        {moment(e.start).format("HH:mm")}
                      </span>
                      {e.imported_type === "GOOGLE" ? (
                        <FaGoogle className="text-xl text-[#174EA6] dark:text-[#4285F4]" />
                      ) : (
                        <FaUserPen className="text-xl text-sky-400 dark:text-sky-500" />
                      )}
                      <span className="text-sm font-medium truncate">
                        {e.title}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Stats */}
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
              This Week
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "today", val: todayEvents.length },
                { label: "upcoming", val: upcomingEvents.length },
                { label: "notes", val: notes.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-blue-300 dark:bg-slate-700 p-2 text-center"
                >
                  <div className="text-base font-semibold text-slate-700 dark:text-slate-200">
                    {s.val}
                  </div>
                  <div className="text-xs font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (currentUser?.id) {
    return {
      redirect: {
        destination: `/auth/login?code=${USER_CODES.NOT_LOGGED_IN}`,
        permanent: false,
      },
    };
  }

  const connection = await getDBConnection();

  const [notes] = await connection.query<RowDataPacket[]>(
    "SELECT note, id FROM notes WHERE user_id = ? ORDER BY id DESC LIMIT 5;",
    [currentUser?.id],
  );

  const [calendar] = await connection.query<RowDataPacket[]>(
    "SELECT *, CAST(start_time AS DATETIME) as start_time, CAST(end_time AS DATETIME) as end_time FROM calendar_items WHERE user_id = ? ORDER BY start_time ASC;",
    [currentUser?.id],
  );

  return {
    props: {
      user: currentUser,
      notes: notes ?? [],
      calendar: JSON.stringify(calendar ?? []),
    },
  };
}
