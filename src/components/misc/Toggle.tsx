import type { MouseEventHandler } from "react";
import { joinClasses } from "@/utils/misc/classes";

interface ToggleProps {
  toggle: boolean;
  onToggle?: MouseEventHandler<HTMLButtonElement>;
}

export default function Toggle({ toggle, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      title="Toggle Theme"
      className="w-12 h-6 rounded-full p-1 bg-blue-300 dark:bg-slate-500 relative transition-colors duration-300 ease-in cursor-pointer"
    >
      <div
        id="toggle"
        className={joinClasses(
          "rounded-full w-4 h-4 bg-blue-600 dark:bg-blue-300 relative pointer-events-none transition-all duration-300 ease-out",
          toggle ? "ml-6" : "ml-0! mr-auto!",
        )}
      />
    </button>
  );
}
