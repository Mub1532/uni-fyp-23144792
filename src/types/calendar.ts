import type { CalendarEvent } from "@/components/calendar/modal";

export type ModalState = {
  open: boolean;
  mode: "create" | "edit";
  event: Partial<CalendarEvent>;
};

export const EMPTY_MODAL: ModalState = {
  open: false,
  mode: "create",
  event: {},
};
