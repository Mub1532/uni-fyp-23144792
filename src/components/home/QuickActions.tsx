import { FaCalendar, FaCog, FaCogs, FaStickyNote } from "react-icons/fa";
import { joinClasses } from "@/utils/misc/classes";
import LoginButton from "../misc/LoginButton";
import { QuickButton } from "./QuickButton";

type QuickActionsType = {
  className?: string;
};

export default function QuickActions({ className }: QuickActionsType) {
  return (
    <div className={joinClasses(className)}>
      <div className="text-sm uppercase text-slate-800 dark:text-slate-300 font-semibold flex items-start justify-start gap-2 px-0 p-3">
        <FaCogs className="text-blue-400 text-xl" />
        Quick Actions
      </div>

      <div
        className={joinClasses(
          "flex flex-wrap flex-col md:flex-row gap-2 py-2 h-fit w-full",
        )}
      >
        <QuickButton
          href="/notes"
          label="View all Notes"
          icon={FaStickyNote}
          extraIconClass="text-sm!"
          className="text-md! w-full! flex items-center! justify-center md:w-fit!"
        />
        <QuickButton
          href="/settings?tab=calendar"
          label="Calendar Sync Settings"
          icon={FaCalendar}
          extraIconClass="text-sm!"
          className="text-md! w-full! flex items-center! justify-center md:w-fit!"
        />
        <QuickButton
          href="/settings?tab=account"
          label="Account Settings"
          icon={FaCog}
          extraIconClass="text-sm!"
          className="text-md! w-full! flex items-center! justify-center md:w-fit!"
        />
        <LoginButton
          type="logout"
          extraIconClass="text-sm!"
          extraClass="text-md! w-full! flex items-center! justify-center md:w-fit!"
        />
      </div>
    </div>
  );
}
