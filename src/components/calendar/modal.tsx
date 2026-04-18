"use client";

import { useEffect, useState } from "react";

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description?: string;
}

interface EventModalProps {
    open: boolean;
    mode: "create" | "edit";
    event: Partial<CalendarEvent>;
    onChange: (patch: Partial<CalendarEvent>) => void;
    onSave: () => void;
    onDelete: () => void;
    onClose: () => void;
}

function toDateTimeLocal(date?: Date): string {
    if (!date) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventModal({ open, mode, event, onChange, onSave, onDelete, onClose }: EventModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (open) setMounted(true);
    }, [open]);

    if (!mounted) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">

                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {mode === "create" ? "New event" : "Edit event"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title *</label>
                        <input
                            autoFocus
                            type="text"
                            value={event.title ?? ""}
                            onChange={e => onChange({ title: e.target.value })}
                            placeholder="Event title"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Start</label>
                            <input
                                type="datetime-local"
                                value={toDateTimeLocal(event.start)}
                                onChange={e => onChange({ start: new Date(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">End</label>
                            <input
                                type="datetime-local"
                                value={toDateTimeLocal(event.end)}
                                onChange={e => onChange({ end: new Date(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</label>
                        <textarea
                            rows={3}
                            value={event.description ?? ""}
                            onChange={e => onChange({ description: e.target.value })}
                            placeholder="Optional notes"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                        {mode === "edit" && (
                            <button
                                onClick={onDelete}
                                className="px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={!event.title?.trim()}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {mode === "create" ? "Create" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}