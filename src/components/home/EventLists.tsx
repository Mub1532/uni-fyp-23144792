import { format } from "date-fns";
import { getEventIcon } from "@/utils/calendar/eventIcon";
import { joinClasses } from "@/utils/misc/classes";
import type { CalendarEvent } from "../calendar/modal";

type EventSection = "Today" | "Upcoming" | "Past" | "AISchedule";

interface EventListSectionProps {
  type: EventSection;
  events: CalendarEvent[];
  onClick?: (event: CalendarEvent) => void;
}

const labelMap: Record<EventSection, string> = {
  Today: "Todays Events",
  Upcoming: "Upcoming Events",
  Past: "Past Events",
  AISchedule: "Generated Schedule",
};

const emptyMap: Record<EventSection, string> = {
  Today: "Nothing Today",
  Upcoming: "Nothing Upcoming",
  Past: "No Past Events",
  AISchedule: "No AI Schedule Available...",
};

const dateFormatMap: Record<EventSection, string> = {
  Today: "HH:mm",
  Upcoming: "dd/mm/yy - HH:mm",
  Past: "dd/MM/yy - HH:mm",
  AISchedule: "dd/MM/yy - HH:mm",
};

export function EventLists({ type, events, onClick }: EventListSectionProps) {
  return (
    <div
      className={joinClasses(
        "flex flex-col gap-2 w-full",
        type === "Past" ? "opacity-70" : "",
      )}
    >
      <div className="text-md text-slate-400 font-semibold text-center md:text-start">
        {labelMap[type]}
      </div>
      {events.length === 0 ? (
        <div className="text-sm font-medium text-green-600 mt-2">
          {emptyMap[type]}
        </div>
      ) : (
        events.map((event, index) => (
          <button
            onClick={() => (onClick ? onClick(event) : null)}
            key={event.id ?? index}
            className={joinClasses(
              "flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0",
              type !== "AISchedule"
                ? "hover:text-blue-400 transition-colors cursor-pointer"
                : "",
            )}
          >
            <div className="flex gap-2 items-center">
              <span
                suppressHydrationWarning
                className="text-xs font-medium w-fit"
              >
                {type === "Today"
                  ? `${format(new Date(event.start), "HH:mm")} - ${format(new Date(event.end), "HH:mm")}`
                  : format(new Date(event.start), dateFormatMap[type])}
              </span>
              {getEventIcon(event)}
              <span className="text-sm font-medium truncate">
                {event.title}
                {event.type === "AI" && event?.description ? (
                  <span className="truncate">
                    {" - "}
                    {event.description}
                  </span>
                ) : (
                  ""
                )}
              </span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
