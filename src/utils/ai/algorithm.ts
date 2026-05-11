import {
  differenceInMinutes,
  eachDayOfInterval,
  getDay,
  isWithinInterval,
  parseISO,
  setHours,
  setMinutes,
} from "date-fns";
import type { CalendarEvent } from "@/components/calendar/modal";
import type { WorkDay } from "@/db/schema";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export type TimeSlot = { start: Date; end: Date };
export type FreeTime = {
  timeSlots: TimeSlot[];
  totalHours: number;
  maxDaily: string | undefined;
};

const defaultPreferences = {
  work_days: [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ] as WorkDay[],
  min_start_time: "09:00",
  max_end_time: "23:00",
  max_daily_hours: "8",
};

/**
 * Calculate the free time whcih does not go inside another calendar event, and also the users preferences
 * @param start
 * @param end
 * @param blockedTimes
 * @param userPreferences
 * @returns
 */
export function getFreeTime(
  start: Date,
  end: Date,
  blockedTimes: { start_time: string; end_time: string }[],
  userPreferences: {
    work_days: WorkDay[];
    min_start_time: string;
    max_end_time: string;
    max_daily_hours: string;
  } = defaultPreferences,
): FreeTime {
  const workDays = userPreferences.work_days;
  const [workStart, workEnd] = [
    userPreferences.min_start_time,
    userPreferences.max_end_time,
  ].map((time) => time.split(":").map(Number));
  const maxMinutesPerDay = parseFloat(userPreferences.max_daily_hours) * 60;

  const timeSlots: TimeSlot[] = [];
  let totalMinutes = 0;

  for (const day of eachDayOfInterval({ start, end })) {
    if (!workDays.includes(DAYS[getDay(day)] as WorkDay)) continue;

    // the time user will start the day minimum and finish maximum
    const userMinStart = setMinutes(setHours(day, workStart[0]), workStart[1]);
    const userMaxEnd = setMinutes(setHours(day, workEnd[0]), workEnd[1]);

    const dayBlocked = blockedTimes
      .filter(
        (b) =>
          isWithinInterval(parseISO(b.start_time), {
            start: userMinStart,
            end: userMaxEnd,
          }) ||
          isWithinInterval(parseISO(b.end_time), {
            start: userMinStart,
            end: userMaxEnd,
          }),
      )
      .map((b) => ({
        start:
          parseISO(b.start_time) < userMinStart
            ? userMinStart
            : parseISO(b.start_time),
        end:
          parseISO(b.end_time) > userMaxEnd ? userMaxEnd : parseISO(b.end_time),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let currentPosition = userMinStart;
    let dayMinutes = 0;

    for (const event of dayBlocked) {
      if (currentPosition < event.start) {
        timeSlots.push({ start: currentPosition, end: event.start });
        dayMinutes += differenceInMinutes(event.start, currentPosition);
      }
      currentPosition =
        event.end > currentPosition ? event.end : currentPosition;
    }

    if (currentPosition < userMaxEnd) {
      timeSlots.push({ start: currentPosition, end: userMaxEnd });
      dayMinutes += differenceInMinutes(userMaxEnd, currentPosition);
    }

    totalMinutes += Math.min(dayMinutes, maxMinutesPerDay);
  }

  return {
    timeSlots,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    maxDaily: userPreferences.max_daily_hours,
  };
}

type SpreadSubTasks = {
  events: CalendarEvent[];
  totalHours: number;
};

/**
 * Spread the sub tasks across the dates, time etc from user preferences, task, their current calenadr items etc so it dont overlap
 * @param freeTime
 * @param title
 * @param subtasks
 * @param maxDaily
 * @returns
 */
export function spreadSubTasks(
  freeTime: FreeTime,
  title: string,
  subtasks: string[],
  maxDaily: string = "8",
): SpreadSubTasks {
  // minimu is 5 min max session is 60 min and have at least 1 hr break between each session and make sure dont go over the max daily hours from user prefernces
  const MIN_SESSION = 5;
  const MAX_SESSION = 60;
  const BREAK = 60;
  const INTERVAL = 5;
  const maxDailyMinutes = parseFloat(maxDaily) * 60;

  // roundeed date eg to the interval eg make sure its in the 5 min eg 8. 8.05 8.10 etc
  const roundedDate = (date: Date) => {
    const ms = INTERVAL * 60000;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  };

  const getDayKey = (date: Date) => date.toISOString().slice(0, 10);

  // spread based on the task eg the last task will be longer than first etc
  const totalWeight = subtasks.reduce((sum, _, i) => sum + (i + 1), 0);
  const totalMinutes = freeTime.totalHours * 60;

  const minutesPerSubtask = subtasks.map((_, i) =>
    Math.round(((i + 1) / totalWeight) * totalMinutes),
  );

  const events: CalendarEvent[] = [];
  const dailyUsed: Record<string, number> = {};
  let slotIndex = 0;
  let current = roundedDate(freeTime.timeSlots[0]?.start);

  for (let i = 0; i < subtasks.length; i++) {
    let remaining = minutesPerSubtask[i];

    while (remaining > 0 && slotIndex < freeTime.timeSlots.length) {
      const slot = freeTime.timeSlots[slotIndex];

      if (current < slot.start) current = roundedDate(slot.start);

      const dayKey = getDayKey(current);
      const usedToday = dailyUsed[dayKey] ?? 0;

      if (usedToday >= maxDailyMinutes) {
        slotIndex++;
        if (freeTime.timeSlots[slotIndex])
          current = roundedDate(freeTime.timeSlots[slotIndex].start);
        continue;
      }

      const availableToday = maxDailyMinutes - usedToday;
      const raw = Math.min(MAX_SESSION, remaining, availableToday);
      const duration = Math.max(
        INTERVAL,
        Math.floor(raw / INTERVAL) * INTERVAL,
      );

      if (duration < MIN_SESSION) {
        slotIndex++;
        if (freeTime.timeSlots[slotIndex])
          current = roundedDate(freeTime.timeSlots[slotIndex].start);
        continue;
      }

      if (duration > remaining) break;

      const sessionEnd = new Date(current.getTime() + duration * 60000);

      if (sessionEnd <= slot.end) {
        events.push({
          title,
          description: subtasks[i],
          start: current,
          end: sessionEnd,
          type: "AI",
          imported_type: "AI",
        });
        remaining -= duration;
        dailyUsed[dayKey] = usedToday + duration;
        current = new Date(sessionEnd.getTime() + BREAK * 60000);
      } else {
        slotIndex++;
        if (freeTime.timeSlots[slotIndex])
          current = roundedDate(freeTime.timeSlots[slotIndex].start);
      }
    }
  }

  const totalMinutesUsed = events.reduce(
    (sum, e) => sum + differenceInMinutes(e.end, e.start),
    0,
  );

  // return calendar events and how long the taska actually are
  return {
    events,
    totalHours: Math.round((totalMinutesUsed / 60) * 100) / 100,
  };
}
