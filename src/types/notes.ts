import type { Editor } from "@tiptap/react";
import type { IconType } from "react-icons";
import type { formatCommands } from "@/utils/data/notes/commands";

export interface NoteHeaderItemProps extends NoteHeaderItemPropsPlain {
  editor: Editor;
  extraClass?: string;
  defaultText?: boolean;
  onClick?: () => unknown;
  saveLoading?: boolean;
  spinIcon?: boolean;
}

export type NoteHeaderItemPropsPlain = {
  icon: IconType;
  title: string;
  newSection?: boolean;
  command: keyof typeof formatCommands | "saveCommand" | "delCommand";
};

export class NoteHeaderItemClass {
  title: string;
  icon: IconType;
  newSection: boolean;
  command: keyof typeof formatCommands | "saveCommand" | "delCommand";

  constructor(options: NoteHeaderItemPropsPlain) {
    this.title = options.title;
    this.icon = options.icon;
    this.newSection = options.newSection ?? false;
    this.command = options.command;
  }
}

export enum NOTE_CAL_CODES {
  NOT_FOUND,
  SAVE_SUCCESS,
  SAVE_FAIL,
  DELETE_SUCCESS,
  DELETE_FAIL,
}
