import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import CalendarContainer from "@/components/calendar/CalendarContainer";
import type { CalendarEvent } from "@/components/calendar/modal";
import { EMPTY_MODAL } from "@/types/calendar";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

interface props extends MyPageProps {
  calendar?: string;
}

export type CalendarItemRaw = {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  imported_type: "GOOGLE";
  type: "MANUAL" | "AI" | "IMPORTED";
};

export default function CalendarPage({
  calendar,
  currentCalModal,
  setCurrentCalModal,
  openCalItem,
}: props) {
  const calendarItems = calendar
    ? (JSON.parse(calendar) as CalendarItemRaw[])
    : [];

  const initialEvents: CalendarEvent[] = calendarItems.map((x) => ({
    id: x.id,
    title: x.title,
    start: new Date(x.start_time),
    end: new Date(x.end_time),
    description: x.description,
    imported_type: x.imported_type,
    type: x.type,
  }));

  return (
    <CalendarContainer
      initialEvents={initialEvents}
      currentCalModal={currentCalModal ?? EMPTY_MODAL}
      setCurrentCalModal={setCurrentCalModal}
      openCalItem={openCalItem}
    />
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
    "SELECT *, CAST(start_time AS DATETIME) as start_time, CAST(end_time AS DATETIME) as end_time FROM calendar_items WHERE user_id = ?;",
    [currentUser?.id],
  );

  return { props: { calendar: rows ? JSON.stringify(rows) : null } };
}
