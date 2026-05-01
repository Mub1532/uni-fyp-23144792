import moment from "moment";
import { type Dispatch, type SetStateAction, useState } from "react";
import {
  Calendar,
  momentLocalizer,
  type SlotInfo,
  type View,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { FaGoogle } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi";
import { toast } from "react-toastify";
import EventModal, { type CalendarEvent } from "@/components/calendar/modal";
import { EMPTY_MODAL, type ModalState } from "@/types/calendar";
import { NOTE_CAL_CODES } from "@/types/notes";

import "react-big-calendar/lib/css/react-big-calendar.css";

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);
const localiser = momentLocalizer(moment);

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
  currentCalModal: ModalState;
  setCurrentCalModal: Dispatch<SetStateAction<ModalState>>;
  openCalItem: (event: CalendarEvent) => void;
}

export const eventIcons: Record<string, React.ReactNode> = {
  GOOGLE: <FaGoogle className="text-xl text-white! shrink-0" />,
  AI: <HiSparkles className="text-xl text-yellow-400! shrink-0" />,
};

export default function CalendarContainer({
  initialEvents,
  currentCalModal,
  setCurrentCalModal,
  openCalItem,
}: CalendarViewProps) {
  const [view, setView] = useState<View>("month");
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);

  const patch = (p: Partial<CalendarEvent>) =>
    setCurrentCalModal((m) => ({ ...m, event: { ...m.event, ...p } }));

  const createEventModal = (slot?: SlotInfo) => {
    setCurrentCalModal({
      open: true,
      mode: "create",
      event: {
        id: String(Date.now()),
        start: slot?.start ?? new Date(),
        end: slot?.end ?? new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  };

  const handleSave = async () => {
    const ev = currentCalModal.event as CalendarEvent;
    if (!ev.title?.trim()) return;

    if (currentCalModal.mode === "create") {
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
      if (data.code === NOTE_CAL_CODES.SAVE_SUCCESS) {
        setEvents([...events, { ...ev, id: String(data.calendarID) }]);
        setCurrentCalModal(EMPTY_MODAL);
        toast.info("Created event successfully.");
      } else {
        toast.error("Failed to create event.");
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
      if (data.code === NOTE_CAL_CODES.SAVE_SUCCESS) {
        setEvents(events.map((e) => (e.id === ev.id ? ev : e)));
        setCurrentCalModal(EMPTY_MODAL);
        toast.info("Saved event successfully.");
      } else {
        toast.error("Failed to save event.");
      }
    }
  };

  const handleDelete = async () => {
    const res = await fetch("/api/calendar/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarID: currentCalModal.event.id }),
    });
    const data = await res.json();
    if (data.code === NOTE_CAL_CODES.DELETE_SUCCESS) {
      setEvents(events.filter((e) => e.id !== currentCalModal.event.id));
      setCurrentCalModal(EMPTY_MODAL);
      toast.info("Deleted event successfully.");
    } else {
      toast.error("Failed to delete event.");
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
        onSelectEvent={openCalItem}
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
        components={{
          event: ({ event }) => (
            <span className="flex items-center gap-1 text-md h-fit! w-full overflow-hidden text-white!">
              {eventIcons[
                event.type === "IMPORTED" ? event.imported_type : event.type
              ] ?? <FaUserPen className="text-xl shrink-0" />}
              <div>{event.title}</div>
            </span>
          ),
        }}
        eventPropGetter={(event) => {
          const type =
            event.type === "IMPORTED" ? event.imported_type : event.type;
          const classes: Record<string, string> = {
            GOOGLE: "!bg-[#4285F4]/70 dark:!bg-[#4285F4]/50",
            AI: "!bg-yellow-500 dark:!bg-yellow-600",
          };
          return {
            className: classes[type] ?? "!bg-sky-500/80 dark:!bg-sky-500/80",
          };
        }}
      />

      <EventModal
        open={currentCalModal.open}
        mode={currentCalModal.mode}
        event={currentCalModal.event}
        onChange={patch}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setCurrentCalModal(EMPTY_MODAL)}
      />
    </div>
  );
}
