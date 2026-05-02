import { TypeAnimation } from "react-type-animation";

interface AISummaryCardProps {
  todayEvents: unknown[];
  upcomingEvents: unknown[];
  notes: unknown[];
}

export function AISummary({
  todayEvents,
  upcomingEvents,
  notes,
}: AISummaryCardProps) {
  return (
    <div className="md:rounded-md bg-blue-400/60 dark:bg-slate-600/60 py-2 px-2 md:p-4 mr-2 h-fit w-full text-center md:text-start">
      <TypeAnimation
        sequence={["AI Summary"]}
        speed={10}
        cursor={false}
        className="text-xs text-center uppercase tracking-widest text-yellow-700! dark:text-yellow-400! font-bold mb-2"
      />

      <div className="text-sm font-semibold flex flex-col mt-1 md:mt-0 gap-1">
        <div>
          Calendar:{" "}
          {todayEvents.length === 0
            ? "nothing on today"
            : `${todayEvents.length} event${todayEvents.length !== 1 ? "s" : ""} lined up${upcomingEvents.length > 0 ? `, ${upcomingEvents.length} more coming` : ""}`}
        </div>
        <div>
          Notes:{" "}
          {notes.length === 0
            ? "nothing recent"
            : `${notes.length} note${notes.length !== 1 ? "s" : ""} to catch up on`}
        </div>
        <div className="text-xs mt-1 text-slate-500 dark:text-slate-400">
          {todayEvents.length === 0
            ? "Looks like a free day."
            : todayEvents.length > 3
              ? "Busy one today."
              : "Fairly light day overall."}{" "}
          {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""} and{" "}
          {notes.length} note{notes.length !== 1 ? "s" : ""}.
        </div>
      </div>
    </div>
  );
}
