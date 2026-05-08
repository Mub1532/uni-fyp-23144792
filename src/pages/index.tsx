import { isAfter, isBefore, isToday, startOfDay } from "date-fns";
import moment from "moment";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { FaClock } from "react-icons/fa";
import { AISummary } from "@/components/AI/summary";
import type { CalendarEvent } from "@/components/calendar/modal";
import CustomiseBackground from "@/components/home/Customise";
import { EventLists } from "@/components/home/EventLists";
import QuickActions from "@/components/home/QuickActions";
import { type NoteItem, RecentNotes } from "@/components/home/RecentNotes";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";
import { joinClasses } from "@/utils/misc/classes";
import type { CalendarItemRaw } from "./calendar";

interface HomeProps extends MyPageProps {
  notes: NoteItem[];
  calendar: string;
}

export default function Home({
  user,
  notes,
  calendar,
  openCalItem,
}: HomeProps) {
  const rawEvents: CalendarItemRaw[] = JSON.parse(calendar ?? "[]");
  const router = useRouter();

  const events: CalendarEvent[] = rawEvents.map((x) => ({
    id: x.id,
    title: x.title,
    start: new Date(x.start_time),
    end: new Date(x.end_time),
    description: x.description,
    imported_type: x.imported_type,
    type: x.type,
  }));

  const todayEvents = events.filter((e) => isToday(new Date(e.start)));

  const upcomingEvents = events.filter((e) =>
    isAfter(new Date(e.start), new Date()),
  );

  const pastEvents = events.filter((e) =>
    isBefore(new Date(e.start), startOfDay(new Date())),
  );

  async function selectCalendarEvent(event: CalendarEvent) {
    openCalItem(event);
    router.push("/calendar");
  }

  return (
    <div className="h-full w-full flex flex-col text-slate-600 dark:text-slate-300 gap-1 -mt-4 md:-mt-2">
      <div className="h-fit w-full border-b-2 px-2 dark:border-slate-500 border-blue-400 pb-2">
        {/* Welcome part */}
        <div className="text-sm sm:text-lg md:text-xl font-semibold dark:text-slate-100 flex items-center gap-1">
          <div>Welcome, </div>
          <div className="text-blue-400">{user?.username}</div>
          <CustomiseBackground
            className="ml-auto mr-0"
            initialImage={user?.background_image}
          />
        </div>
        <div className="text-xs sm:text-sm text-slate-400 -mt-1 md:mt-0">
          {`It is currently ${moment().format("dddd Do MMMM [-] HH:mm")}`}
        </div>
      </div>

      {/* Second part */}

      <div className="h-full w-full min-h-0 flex flex-col md:flex-row gap-1">
        <HomeSection isFirst>
          <AISummary
            notes={notes}
            todayEvents={todayEvents}
            upcomingEvents={upcomingEvents}
          />
          <RecentNotes notes={notes} />
          <QuickActions className="hidden md:block " />{" "}
        </HomeSection>
        <HomeSection>
          <div className="text-sm uppercase text-slate-800 dark:text-slate-300 font-semibold flex items-center justify-center gap-2 p-3">
            <FaClock className="text-blue-400 text-xl" />
            Your Schedule
          </div>

          <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(100px,1fr))]">
            {[
              { name: "Events Today", amount: todayEvents.length },
              { name: "Events Upcoming", amount: upcomingEvents.length },
              { name: "Notes Created", amount: notes.length },
            ].map((s) => (
              <div
                key={s.name}
                className="rounded-lg bg-blue-400/60 dark:bg-slate-600/60 p-2 text-center"
              >
                <div className="text-base font-semibold text-slate-700 dark:text-slate-200">
                  {s.amount}
                </div>
                <div className="text-xs font-semibold">{s.name}</div>
              </div>
            ))}
          </div>

          <EventLists
            type="Today"
            events={todayEvents}
            onClick={selectCalendarEvent}
          />
          <EventLists
            type="Upcoming"
            events={upcomingEvents}
            onClick={selectCalendarEvent}
          />
          <EventLists
            type="Past"
            events={pastEvents}
            onClick={selectCalendarEvent}
          />
        </HomeSection>
        <HomeSection className="md:hidden">
          <QuickActions />
        </HomeSection>
      </div>
    </div>
  );
}

type HomeSectionType = {
  isFirst?: boolean;
  children: ReactNode;
  className?: string;
};

export function HomeSection({
  children,
  isFirst = false,
  className,
}: HomeSectionType) {
  return (
    <div
      className={joinClasses(
        "h-fit md:h-full w-full flex flex-col p-2 gap-4 border-b-2 md:border-b-0 dark:border-slate-500 border-blue-400",
        isFirst ? "md:border-r-2!" : "md:border-none",
        className,
      )}
    >
      {children}
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
