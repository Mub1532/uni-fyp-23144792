import type { ToolbarProps, View } from "react-big-calendar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { CalendarEvent } from "./modal";

export function CalendarToolbar({
  label,
  onNavigate,
  onView,
  view,
  views,
}: ToolbarProps<CalendarEvent, object>) {
  return (
    <div className="rbc-toolbar gap-4">
      <span className="rbc-btn-group h-8">
        <button
          className="h-full"
          type="button"
          onClick={() => onNavigate("PREV")}
        >
          <FaChevronLeft className="text-lg" />
        </button>
        <button
          className="h-full"
          type="button"
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </button>
        <button
          className="h-full"
          type="button"
          onClick={() => onNavigate("NEXT")}
        >
          <FaChevronRight className="text-lg" />
        </button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>

      <span className="rbc-btn-group">
        {(views as string[]).map((v) => (
          <button
            key={v}
            type="button"
            className={view === v ? "rbc-active" : ""}
            onClick={() => onView(v as View)}
          >
            {viewLabels[v] ?? v}
          </button>
        ))}
      </span>
    </div>
  );
}

const viewLabels: Record<string, string> = {
  month: "Month",
  week: "Week",
  day: "Day",
  agenda: "List",
};
