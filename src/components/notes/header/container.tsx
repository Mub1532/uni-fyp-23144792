import type { Editor } from "@tiptap/react";
import { useRouter } from "next/router";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaSave, FaTrashAlt } from "react-icons/fa";
import type { DebouncedState } from "usehooks-ts";
import type { NoteHeaderItemClass } from "@/types/notes";
import {
  defaultScrollbar,
  joinClasses,
  scrollHint,
} from "@/utils/misc/classes";
import NoteHeaderItem from "./item";

type props = {
  items: NoteHeaderItemClass[];
  editor: Editor;
  saveFunction: DebouncedState<() => Promise<void>>;
  deleteFunction: DebouncedState<() => Promise<void>>;
  saveLoading?: boolean;
  deleteLoading?: boolean;
};

export default function NoteHeaderItems({
  items,
  editor,
  saveFunction,
  saveLoading,
  deleteFunction,
  deleteLoading,
}: props) {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div
      className={joinClasses(
        "w-full h-max min-h-12 rounded-md flex items-center px-2 bg-blue-100 dark:bg-slate-700 gap-1 overflow-hidden",
        defaultScrollbar,
      )}
    >
      <div
        className={joinClasses(
          "w-full h-full flex animate-spin items-center overflow-x-auto overflow-y-hidden gap-1 my-2",
          defaultScrollbar,
          scrollHint,
        )}
      >
        {items.map((item) => (
          <NoteHeaderItem {...item} editor={editor} key={item.title} />
        ))}
      </div>
      {id === "create" ? null : (
        <NoteHeaderItem
          editor={editor}
          icon={deleteLoading ? AiOutlineLoading3Quarters : FaTrashAlt}
          title="Delete"
          command="deleteNote"
          extraClass={
            "mr-0 ml-auto bg-red-500 dark:bg-red-500/70 rounded-sm px-2 text-slate-200!"
          }
          defaultText={false}
          onClick={deleteFunction}
          saveLoading={deleteLoading}
          spinIcon={deleteLoading}
        />
      )}
      <NoteHeaderItem
        editor={editor}
        icon={saveLoading ? AiOutlineLoading3Quarters : FaSave}
        title="Save"
        command="saveNote"
        extraClass={
          "mr-0 ml-auto bg-blue-500 dark:bg-blue-500/70 rounded-sm px-2 text-slate-200!"
        }
        defaultText={false}
        onClick={saveFunction}
        saveLoading={saveLoading}
        spinIcon={saveLoading}
      />
    </div>
  );
}
