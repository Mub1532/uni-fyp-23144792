import { NoteHeaderItemClass } from "@/types/notes";
import {
  FaBold,
  FaCode,
  FaHeading,
  FaItalic,
  FaLink,
  FaList,
  FaListOl,
  FaMinus,
  FaQuoteRight,
  FaUnderline,
} from "react-icons/fa";

export const noteEditorHeaderItems = [
  new NoteHeaderItemClass({
    title: "Title",
    icon: FaHeading,
    command: "title",
  }),
  new NoteHeaderItemClass({
    title: "Subtitle",
    icon: FaHeading,
    command: "subtitle",
  }),
  new NoteHeaderItemClass({
    title: "Bold",
    icon: FaBold,
    newSection: true,
    command: "bold",
  }),
  new NoteHeaderItemClass({
    title: "Italics",
    icon: FaItalic,
    command: "italic",
  }),
  new NoteHeaderItemClass({
    title: "Underline",
    icon: FaUnderline,
    command: "underline",
  }),
  new NoteHeaderItemClass({
    title: "Bullet Point",
    icon: FaList,
    newSection: true,
    command: "bulletPoint",
  }),
  new NoteHeaderItemClass({
    title: "Numbered Bullets",
    icon: FaListOl,
    command: "numberedBullets",
  }),
  new NoteHeaderItemClass({
    title: "Quotes",
    icon: FaQuoteRight,
    newSection: true,
    command: "quotes",
  }),
  new NoteHeaderItemClass({
    title: "Code block",
    icon: FaCode,
    command: "codeBlock",
  }),
  new NoteHeaderItemClass({
    title: "Divider",
    icon: FaMinus,
    command: "divider",
  }),
  new NoteHeaderItemClass({
    title: "Link",
    icon: FaLink,
    command: "link",
  }),
];
