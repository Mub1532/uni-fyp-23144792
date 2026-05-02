import moment from "moment";
import { getEventIcon } from "@/utils/calendar/eventIcon";
import type { CalendarEvent } from "./modal";

interface CalendarEventItemProps {
  event: CalendarEvent;
}

export function CalendarEventItem({ event }: CalendarEventItemProps) {
  return (
    <span className="flex items-center gap-1 text-sm h-fit! w-full! min-w-0! overflow-hidden text-white!">
      {getEventIcon(event, "calendar")}
      <span className="text-xs shrink-0 event-time">
        {moment(event.start).format("HH:mm")} -{" "}
        {moment(event.end).format("HH:mm")}
      </span>
      <div className="truncate min-w-0 flex-1">{event.title}</div>
    </span>
  );
}
