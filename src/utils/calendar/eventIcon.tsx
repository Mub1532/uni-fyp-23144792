import type { ReactNode } from "react";
import { FaGoogle } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";
import { HiSparkles } from "react-icons/hi";
import type { CalendarEvent } from "@/components/calendar/modal";

export function getEventIcon(
  event: CalendarEvent,
  type: "home" | "calendar" = "home",
): ReactNode {
  const eventType =
    event.type === "IMPORTED" ? event.imported_type : event.type;

  if (type === "calendar") {
    switch (eventType) {
      case "GOOGLE":
        return <FaGoogle className="text-sm md:text-xl text-white! shrink-0" />;
      case "AI":
        return (
          <HiSparkles className="text-sm md:text-xl text-yellow-400! shrink-0" />
        );
      default:
        return <FaUserPen className="text-sm md:text-xl shrink-0" />;
    }
  }

  switch (eventType) {
    case "GOOGLE":
      return (
        <FaGoogle className="text-sm md:text-xl text-[#174EA6] dark:text-[#4285F4]" />
      );
    case "AI":
      return (
        <HiSparkles className="text-sm md:text-xl text-yellow-500 dark:text-yellow-400" />
      );
    default:
      return (
        <FaUserPen className="text-sm md:text-xl text-sky-400 dark:text-sky-500" />
      );
  }
}
