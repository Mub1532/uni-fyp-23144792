"use client";

import moment from "moment";
import type { RowDataPacket } from "mysql2";
import type { GetServerSidePropsContext } from "next";
import { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  type SlotInfo,
  type View,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import EventModal, { type CalendarEvent } from "@/components/calendar/modal";
import { NOTE_CAL_CODES } from "@/types/notes";
import { USER_CODES } from "@/types/user";
import verifyUser from "@/utils/auth/jwt";
import { getDBConnection } from "@/utils/database";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "react-toastify";

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

const localiser = momentLocalizer(moment);

type ModalState = {
  open: boolean;
  mode: "create" | "edit";
  event: Partial<CalendarEvent>;
};

const EMPTY_MODAL: ModalState = { open: false, mode: "create", event: {} };

type props = {
  calendar?: string;
};

type CalendarItem = {
  id: string;
  user_id: number;
  date: string;
  type: string;
  imported_type: any;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export default function TestPage({ calendar }: props) {
  const calendarItems = calendar
    ? (JSON.parse(calendar) as CalendarItem[])
    : [];

  const mappedCalendar = calendarItems.map((x) => ({
    id: x.id,
    title: x.title,
    start: new Date(x.start_time),
    end: new Date(x.end_time),
    description: x.description,
  }));

  const [view, setView] = useState<View>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(mappedCalendar);
  const [modal, setModal] = useState<ModalState>(EMPTY_MODAL);

  const patch = (p: Partial<CalendarEvent>) =>
    setModal((m) => ({ ...m, event: { ...m.event, ...p } }));

  const createEventModal = (slot?: SlotInfo) => {
    setModal({
      open: true,
      mode: "create",
      event: {
        id: String(Date.now()),
        start: slot?.start ?? new Date(),
        end: slot?.end ?? new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  };

  const openEdit = (event: CalendarEvent) =>
    setModal({ open: true, mode: "edit", event: { ...event } });

  const handleSave = async () => {
    const ev = modal.event as CalendarEvent;
    if (!ev.title?.trim()) return;

    if (modal.mode === "create") {
      const res = await fetch("/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ev.title,
          description: ev.description,
          start: ev.start,
          end: ev.end,
        }),
      });
      const data = await res.json();

      switch (data.code) {
        case NOTE_CAL_CODES.SAVE_SUCCESS:
          setEvents([...events, { ...ev, id: String(data.calendarID) }]);
          setModal(EMPTY_MODAL);
          toast.info("Created event successfully.");
          break;
        case NOTE_CAL_CODES.SAVE_FAIL:
          toast.error("Failed to create event.");
          break;
      }
    } else {
      const res = await fetch("/api/calendar/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarID: ev.id,
          title: ev.title,
          description: ev.description,
          start: ev.start,
          end: ev.end,
        }),
      });
      const data = await res.json();

      switch (data.code) {
        case NOTE_CAL_CODES.SAVE_SUCCESS:
          setEvents(events.map((e) => (e.id === ev.id ? ev : e)));
          setModal(EMPTY_MODAL);
          toast.info("Saved event successfully.");
          break;
        case NOTE_CAL_CODES.SAVE_FAIL:
          toast.error("Failed to save event.");
          break;
      }
    }
  };

  const handleDelete = async () => {
    const res = await fetch("/api/calendar/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarID: modal.event.id }),
    });
    const data = await res.json();

    switch (data.code) {
      case NOTE_CAL_CODES.DELETE_SUCCESS:
        setEvents(events.filter((e) => e.id !== modal.event.id));
        setModal(EMPTY_MODAL);
        toast.info("Deleted event successfully.");
        break;
      case NOTE_CAL_CODES.DELETE_FAIL:
        toast.error("Failed to delete event.");
        break;
    }
  };

  return (
    <div className="h-full w-full p-4 flex flex-col relative gap-3 overflow-hidden">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => createEventModal()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 cursor-pointer"
        >
          + Add event
        </button>
      </div>

      <DnDCalendar
        localizer={localiser}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="h-full! w-full overflow-hidden! min-h-0 max-h-[78vh]! sm:max-h-[75vh]! md:max-h-[80vh]!"
        messages={{ agenda: "List" }}
        view={view}
        onView={setView}
        selectable
        onSelectSlot={createEventModal}
        onSelectEvent={openEdit}
        onEventDrop={({ event, start, end }) =>
          setEvents(
            events.map((e) =>
              e.id === event.id
                ? { ...e, start: new Date(start), end: new Date(end) }
                : e,
            ),
          )
        }
        onEventResize={({ event, start, end }) =>
          setEvents(
            events.map((e) =>
              e.id === event.id
                ? { ...e, start: new Date(start), end: new Date(end) }
                : e,
            ),
          )
        }
        resizable
      />
      <EventModal
        open={modal.open}
        mode={modal.mode}
        event={modal.event}
        onChange={patch}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setModal(EMPTY_MODAL)}
      />
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

  const [rows] = await connection.query<RowDataPacket[]>(
    "SELECT *, CAST(start_time AS DATETIME) as start_time, CAST(end_time AS DATETIME) as end_time FROM calendar_items WHERE user_id = ?;",
    [user?.id],
  );

  if (rows)
    return {
      props: { calendar: JSON.stringify(rows) },
    };

  return {
    props: { calendar: undefined },
  };
}
