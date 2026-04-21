import type { CalendarEvent } from "@/components/calendar/modal";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import moment from "moment";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { extractNoteInfo } from "./notes";

interface HomeProps extends MyPageProps {
  notes: { id: string; note: any }[];
  calendar: string;
}

export default function index({ user, notes, calendar }: HomeProps) {
  const events: CalendarEvent[] = JSON.parse(calendar ?? "[]");

  const todayEvents = events.filter((e) =>
    moment(e.start).isSame(moment(), "day"),
  );

  const upcomingEvents = events
    .filter((e) => moment(e.start).isAfter(moment(), "day"))
    .slice(0, 5);

  return (
    <div className="h-full w-full flex flex-col text-slate-600 dark:text-slate-300">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Welcome, <span className="text-blue-400">{user?.username}</span>
        </div>
        <div className="text-sm text-slate-400">
          {moment().format("dddd Do MMMM [·] HH:mm")}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
        {/* Main */}
        <div className="overflow-y-auto px-6 py-5 border-r border-slate-200 dark:border-slate-700 flex flex-col gap-5 h-full w-full">
          {/* AI Summary */}
          <div className="rounded-lg bg-blue-300 dark:bg-slate-700 p-4">
            <div className="text-xs uppercase tracking-widest text-blue-900 dark:text-blue-300 font-bold mb-2">
              AI Summary
            </div>
            <p className="text-sm font-semibold leading-relaxed">
              You have{" "}
              <span className="text-slate-600 dark:text-blue-300 font-medium">
                {todayEvents.length} events today
              </span>{" "}
              and{" "}
              <span className="text-slate-600 dark:text-blue-300 font-medium">
                {notes.length} recent notes
              </span>
              .
            </p>
            <div className="mt-3 text-xs text-slate-500">
              {todayEvents.length} today · {upcomingEvents.length} upcoming ·{" "}
              {notes.length} notes
            </div>
          </div>

          {/* Recent Notes */}
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
              Recent Notes
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {notes.map((item) => {
                const { title } = extractNoteInfo(item.note);
                return (
                  <Link href={`/notes/${item.id}`} key={item.id}>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 cursor-pointer hover:border-blue-400 transition-colors">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {title}
                      </div>
                    </div>
                  </Link>
                );
              })}
              <Link href="/notes/create">
                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-3 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                  <span className="text-sm text-slate-400">+ New note</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="overflow-y-auto px-4 py-5 flex flex-col gap-5 h-full w-full">
          {/* Today */}
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
              Today's Schedule
            </div>
            {todayEvents.length === 0 ? (
              <div className="text-sm text-slate-400">Nothing today</div>
            ) : (
              <div className="flex flex-col gap-1">
                {todayEvents.map((e) => (
                  <Link href="/calendar" key={e.id}>
                    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0 hover:text-blue-400 transition-colors cursor-pointer">
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-slate-400 w-10">
                          {moment(e.start).format("HH:mm")}
                        </span>
                        <span className="text-sm truncate">{e.title}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
                        <span className="text-xs text-slate-400 w-16 shrink-0">
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
  const user = await verifyUser(rawCookie as string);

  if (!user || !user?.id) {
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
    [user?.id],
  );

  const [calendar] = await connection.query<RowDataPacket[]>(
    "SELECT *, CAST(start_time AS DATETIME) as start_time, CAST(end_time AS DATETIME) as end_time FROM calendar_items WHERE user_id = ? ORDER BY start_time ASC;",
    [user?.id],
  );

  return {
    props: {
      user,
      notes: notes ?? [],
      calendar: JSON.stringify(calendar ?? []),
    },
  };
}
