"use client";

import EventModal, { type CalendarEvent } from "@/components/calendar/modal";
import moment from "moment";
import { useState } from "react";
import {
    Calendar,
    momentLocalizer,
    type SlotInfo,
    type View,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import "react-big-calendar/lib/css/react-big-calendar.css";

const DnDCalendar = withDragAndDrop<CalendarEvent>(Calendar);

const localiser = momentLocalizer(moment);

type ModalState = {
    open: boolean;
    mode: "create" | "edit";
    event: Partial<CalendarEvent>;
};

const EMPTY_MODAL: ModalState = { open: false, mode: "create", event: {} };

export default function TestPage() {
    const [view, setView] = useState<View>("month");
    const [events, setEvents] = useState<CalendarEvent[]>([
        {
            id: "1",
            title: "Test Event",
            start: new Date(),
            end: new Date(new Date().getTime() + 60 * 60 * 1000),
        },
    ]);
    const [modal, setModal] = useState<ModalState>(EMPTY_MODAL);

    const patch = (p: Partial<CalendarEvent>) =>
        setModal((m) => ({ ...m, event: { ...m.event, ...p } }));

    const openCreate = (slot?: SlotInfo) =>
        setModal({
            open: true,
            mode: "create",
            event: {
                id: String(Date.now()),
                start: slot?.start ?? new Date(),
                end: slot?.end ?? new Date(Date.now() + 60 * 60 * 1000),
            },
        });

    const openEdit = (event: CalendarEvent) =>
        setModal({ open: true, mode: "edit", event: { ...event } });

    const handleSave = () => {
        const ev = modal.event as CalendarEvent;
        if (!ev.title?.trim()) return;
        setEvents(
            modal.mode === "create"
                ? [...events, ev]
                : events.map((e) => (e.id === ev.id ? ev : e)),
        );
        setModal(EMPTY_MODAL);
    };

    const handleDelete = () => {
        setEvents(events.filter((e) => e.id !== modal.event.id));
        setModal(EMPTY_MODAL);
    };

    return (
        <div className="h-full w-full p-4 flex flex-col gap-3">
            <div className="flex justify-end">
                <button
                    onClick={() => openCreate()}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 cursor-pointer"
                >
                    + Add event
                </button>
            </div>

            <DnDCalendar
                localizer={localiser}
                events={events}
                startAccessor="start"
                endAccessor="end"
                className="h-full! w-full"
                messages={{ agenda: "List" }}
                view={view}
                onView={setView}
                selectable
                onSelectSlot={openCreate}
                onSelectEvent={openEdit}
                onEventDrop={({ event, start, end }) =>
                    setEvents(
                        events.map((e) =>
                            e.id === event.id
                                ? { ...e, start: new Date(start), end: new Date(end) }
                                : e,
                        ),
                    )
                }
                onEventResize={({ event, start, end }) =>
                    setEvents(
                        events.map((e) =>
                            e.id === event.id
                                ? { ...e, start: new Date(start), end: new Date(end) }
                                : e,
                        ),
                    )
                }
                resizable
            />

            <EventModal
                open={modal.open}
                mode={modal.mode}
                event={modal.event}
                onChange={patch}
                onSave={handleSave}
                onDelete={handleDelete}
                onClose={() => setModal(EMPTY_MODAL)}
            />
        </div>
    );
}
