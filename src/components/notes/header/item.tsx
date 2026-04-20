import type { NoteHeaderItemProps } from "@/types/notes";
import { formatCommands } from "@/utils/data/notes/commands";
import { joinClasses } from "@/utils/misc/classes";

export default function NoteHeaderItem({
    title,
    icon,
    newSection,
    command,
    editor,
    extraClass,
    defaultText = true,
}: NoteHeaderItemProps) {
    return (
        <>
            {newSection && (
                <div
                    className={joinClasses(
                        "h-4/6 w-0.5 dark:bg-slate-600 bg-slate-400 mx-1 shrink-0",
                    )}
                />
            )}
            <button
                className={joinClasses(
                    "shrink-0 h-fit min-h-8 w-fit text-blue px-1 text-sm flex items-center gap-1 hover:bg-blue-200 hover:dark:bg-slate-600 dark:hover:text-slate-200! cursor-pointer hover:rounded-sm hover:border-transparent!",
                    "group/noteHeaderBar md:animate-none",
                    editor?.isActive(command)
                        ? "bg-blue-200 dark:bg-slate-600 rounded-md"
                        : "",
                    extraClass,
                )}
                onClick={() => {
                    const selectedText = window.getSelection()?.toString() ?? "";
                    formatCommands[command](editor, selectedText);
                }}
                type="button"
            >
                {icon({
                    className: joinClasses("text-sm!"),
                })}
                <div
                    className={joinClasses(
                        "shrink-0 dark:group-hover/noteHeaderBar:text-slate-200! font-semibold text-xs",
                        defaultText && "text-slate-500 dark:text-slate-400",
                    )}
                >
                    {title}
                </div>
            </button>
        </>
    );
}
