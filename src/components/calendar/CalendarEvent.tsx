import { format } from "date-fns";
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
        {format(new Date(event.start), "HH:mm")} -{" "}
        {format(new Date(event.end), "HH:mm")}
      </span>
      <div className="truncate min-w-0 flex-1">{event.title}</div>
    </span>
  );
}
