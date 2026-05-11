import { differenceInHours, format } from "date-fns";
import { eq } from "drizzle-orm";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaEdit, FaRegLightbulb } from "react-icons/fa";
import { toast } from "react-toastify";
import EventModal, { type CalendarEvent } from "@/components/calendar/modal";
import { EventLists } from "@/components/home/EventLists";
import { QuickButton } from "@/components/home/QuickButton";
import { db } from "@/db";
import { userPreferences, type WorkDay } from "@/db/schema";
import { NOTE_CAL_CODES } from "@/types/notes";
import type { MyPageProps } from "@/types/props";
import { USER_CODES } from "@/types/user";
import { getFreeTime, spreadSubTasks } from "@/utils/ai/algorithm";
import verifyUser from "@/utils/auth/jwt";
import { joinClasses } from "@/utils/misc/classes";

const DAYS: WorkDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface PlanProps extends MyPageProps {
  initialUserPreferences: typeof userPreferences.$inferSelect;
}

const exampleTitle = "Website Development with Next.js";
const exampleDesc =
  "research existing websites and critically analyse them in my report say in the report what my website would fix which problem it would fix and why mine is better create time plan for this prohject usin gantt chart design website ui ux first idk i guess in figma and then develop in next js also like idk mysql db aswell i gotta develop that i guess";

export default function Preferences({
  user,
  initialUserPreferences,
}: PlanProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [userPref, setUserPref] = useState<
    Omit<typeof userPreferences.$inferSelect, "id">
  >(
    initialUserPreferences ?? {
      userId: user?.id,
      workDays: [],
      minStartTime: "09:00",
      maxEndTime: "23:59",
      maxDailyHours: "",
    },
  );

  const router = useRouter();

  const [aiEvents, setAiEvents] = useState<CalendarEvent[]>([]);

  const [taskTitle, setTitle] = useState("");
  const [taskDesc, setDesc] = useState("");
  const [startDate, setStartDate] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleDay(day: WorkDay) {
    setUserPref((prev) => {
      const days = (prev.workDays ?? []) as WorkDay[];
      return {
        ...prev,
        workDays: days.includes(day)
          ? days.filter((d) => d !== day)
          : [...days, day],
      };
    });
  }

  async function generateSchedule() {
    if (loading) return;

    if (!taskTitle || !taskDesc || !startDate || !endDate) {
      toast.error("Please fill in all the fields");
      return;
    }
    if (taskTitle.length <= 5) {
      toast.error("Title must be more than 5 letters");
      return;
    }
    if (taskDesc.length <= 10) {
      toast.error("Description must be more than 10 letters");
      return;
    }
    if (differenceInHours(new Date(endDate), new Date(startDate)) < 1) {
      toast.error("End date must be at least 1 hour after start date");
      return;
    }
    setLoading(true);

    const response = await fetch("/api/ai/getSubTasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskTitle, description: taskDesc }),
    });
    const data = await response.json();

    if (!data?.success || !data?.results?.subtasks?.length) {
      toast.error("AI Error: No Sub tasks found.");
      setLoading(false);
      return;
    }

    try {
      const blocked = await fetch("/api/ai/blockedTimes");
      const jsonBlocked = await blocked.json();
      const blockedTimes = jsonBlocked?.blockedTimes ?? [];

      const title = data?.results?.title ?? taskTitle;
      const subTasks = data?.results?.subtasks;

      const freeTime = getFreeTime(
        new Date(startDate),
        new Date(endDate),
        blockedTimes,
        {
          max_daily_hours: userPref.maxDailyHours ?? "8",
          max_end_time: userPref?.maxEndTime ?? "23:00",
          min_start_time: userPref?.minStartTime ?? "09:00",
          work_days: userPref?.workDays ?? [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      );
      const calendar = spreadSubTasks(freeTime, title, subTasks, "8");

      setAiEvents(calendar?.events);
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error(
        "Failed to generate AI schedule, check if your preferences are too constrained.",
      );
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  function generateScheduleExample() {
    if (loading) return;
    if (taskTitle !== exampleTitle) setTitle(exampleTitle);
    if (taskDesc !== exampleDesc) setDesc(exampleDesc);
    setStartDate(new Date().toISOString().slice(0, 16));
    setEndDate(
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    );
  }

  async function setPreferences() {
    if (loading) return;
    const res = await fetch("/api/ai/setPreferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workDays: userPref.workDays,
        minStartTime: userPref.minStartTime,
        maxEndTime: userPref.maxEndTime,
        maxDailyHours: userPref.maxDailyHours,
      }),
    });

    const data = await res.json();

    if (!data?.success) {
      toast.error("Failed to save preferences.");
      return;
    }

    toast.success("Saved Preferences.");
    setModalOpen(false);
  }

  const [schedLoading, setSchedLoading] = useState(false);

  async function saveSchedule() {
    if (!aiEvents?.length) {
      toast.error("Error, cant find AI Schedule.");
      return;
    }
    setSchedLoading(true);

    const res = await fetch("/api/calendar/createBulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        aiEvents.map((e) => ({
          title: e.title,
          description: e.description,
          start: e.start,
          end: e.end,
        })),
      ),
    });

    const data = await res.json();

    if (data?.code !== NOTE_CAL_CODES.SAVE_SUCCESS) {
      toast.error("Failed to save schedule");
      return;
    }

    setSchedLoading(false);
    toast.success("Saved AI Schedule");
    router.push("/calendar");
  }

  useEffect(() => {
    if (user?.id && !userPref?.userId) {
      setUserPref({ ...userPref, userId: user.id });
    }
  }, [user?.id, userPref?.userId, userPref]);

  return (
    <>
      <div className="flex flex-col h-full w-full gap-4 overflow-hidden">
        <QuickButton
          label="Planner Preferences"
          icon={FaEdit}
          extraIconClass="text-sm!"
          className="text-md! w-full! flex items-center! justify-center md:w-fit!"
          onClick={() => setModalOpen(true)}
        />
        <div className="font-bold text-2xl text-center mb-4">
          Generate an AI Calendar Plan
        </div>
        <div className="flex px-2 md:flex-row h-full w-full items-center justify-center gap-4 overflow-auto">
          {aiEvents?.length < 1 && (
            <div className="flex flex-col gap-4 h-full w-full md:w-fit md:min-w-1/2 md:max-w-full pb-24">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Title
                </label>
                <input
                  minLength={10}
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1 h-full w-full">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Description
                </label>
                <textarea
                  minLength={10}
                  value={taskDesc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Type what you need to do in the task, can be vague, messy detailed etc. Click example Plan for an example."
                  className="w-full h-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <QuickButton
                label={loading ? "AI Plan generating..." : "Generate AI Plan"}
                icon={loading ? AiOutlineLoading3Quarters : FaEdit}
                className={joinClasses(
                  "w-full! flex items-center! justify-center!",
                  loading && "ai-glow",
                )}
                onClick={generateSchedule}
                extraIconClass={joinClasses(loading && "animate-spin")}
              />
              <QuickButton
                label="Example Plan"
                icon={FaRegLightbulb}
                className="w-full! flex items-center! justify-center! bg-yellow-500 font-bold dark:bg-yellow-600/40!"
                onClick={generateScheduleExample}
              />
            </div>
          )}
          {aiEvents?.length > 0 && (
            <div className="h-full w-full md:w-3/4 xl:w-fit xl:max-w-3/4 flex justify-center">
              <EventLists
                type="AISchedule"
                events={aiEvents}
                // onClick={selectCalendarEvent}
              />
            </div>
          )}
        </div>
        {aiEvents?.length > 0 && (
          <div className="h-fit w-full items-center text-center flex justify-center">
            <QuickButton
              label={schedLoading ? "Saving..." : "Save AI Plan to Calendar"}
              icon={schedLoading ? AiOutlineLoading3Quarters : FaEdit}
              className={
                "w-full flex items-center! justify-center! text-center"
              }
              onClick={saveSchedule}
              extraIconClass={schedLoading ? "animate-spin" : ""}
            />
          </div>
        )}
      </div>
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        modalType="generic"
        title="Your Preferences"
        onSave={setPreferences}
        submitLabel="Save"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Work Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    (userPref.workDays as WorkDay[])?.includes(day)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Min Start Time
              </label>
              <input
                type="time"
                value={userPref.minStartTime ?? ""}
                onChange={(e) =>
                  setUserPref((prev) => ({
                    ...prev,
                    minStartTime: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Max End Time
              </label>
              <input
                type="time"
                value={userPref.maxEndTime ?? ""}
                onChange={(e) =>
                  setUserPref((prev) => ({
                    ...prev,
                    maxEndTime: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Maximum Hours to Work Daily
            </label>
            <input
              type="number"
              min={1}
              max={24}
              step={0.5}
              value={userPref.maxDailyHours ?? ""}
              onChange={(e) =>
                setUserPref((prev) => ({
                  ...prev,
                  maxDailyHours: e.target.value,
                }))
              }
              placeholder="e.g. 8"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </EventModal>
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const rawCookie = req.headers.cookie;
  const { currentUser } = await verifyUser(rawCookie as string);

  if (!currentUser?.id) {
    return {
      redirect: {
        destination: `/auth/login?code=${USER_CODES.NOT_LOGGED_IN}`,
        permanent: false,
      },
    };
  }

  const [result] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, currentUser.id));
  return {
    props: { initialUserPreferences: result ?? null },
  };
}
