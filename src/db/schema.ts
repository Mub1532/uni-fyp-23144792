import {
  customType,
  datetime,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  time,
  timestamp,
  tinyint,
  tinytext,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const calendarItems = mysqlTable(
  "calendar_items",
  {
    id: int().autoincrement().notNull(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: mysqlEnum(["IMPORTED", "MANUAL", "AI"]).notNull(),
    importedType: mysqlEnum("imported_type", ["GOOGLE"]),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    startTime: datetime("start_time", { mode: "string" }).notNull(),
    endTime: datetime("end_time", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .onUpdateNow(),
    externalIcalId: varchar("external_ical_id", { length: 255 }),
  },
  (table) => [
    index("idx_user_date").on(table.userId),
    primaryKey({ columns: [table.id], name: "calendar_items_id" }),
    unique("external_ical_id").on(table.externalIcalId),
  ],
);

export const notes = mysqlTable(
  "notes",
  {
    id: int().autoincrement().notNull(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    note: json().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    index("user_id").on(table.userId),
    primaryKey({ columns: [table.id], name: "notes_id" }),
  ],
);

export const userBlockedHours = mysqlTable(
  "user_blocked_hours",
  {
    id: int().autoincrement().notNull(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    day: mysqlEnum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]),
    startTime: time("start_time"),
    endTime: time("end_time"),
  },
  (table) => [
    index("user_id").on(table.userId),
    primaryKey({ columns: [table.id], name: "user_blocked_hours_id" }),
  ],
);

export type WorkDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const workDaysSet = customType<{ data: WorkDay[]; driverData: string }>({
  dataType() {
    return "set('monday','tuesday','wednesday','thursday','friday','saturday','sunday')";
  },
  fromDriver(value): WorkDay[] {
    return value.split(",") as WorkDay[];
  },
  toDriver(value): string {
    return value.join(",");
  },
});

export const userPreferences = mysqlTable(
  "user_preferences",
  {
    id: int().autoincrement().notNull(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    minStartTime: time("min_start_time"),
    maxEndTime: time("max_end_time"),
    workDays: workDaysSet("work_days"),
    maxDailyHours: decimal("max_daily_hours", { precision: 4, scale: 2 }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "user_preferences_id" }),
    unique("user_id").on(table.userId),
  ],
);

export const userSubtasks = mysqlTable(
  "user_subtasks",
  {
    id: int().autoincrement().notNull(),
    taskId: int("task_id")
      .notNull()
      .references(() => userTasks.id),
    description: varchar({ length: 255 }).notNull(),
    comments: text(),
    estimatedHours: decimal("estimated_hours", {
      precision: 4,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    index("task_id").on(table.taskId),
    primaryKey({ columns: [table.id], name: "user_subtasks_id" }),
  ],
);

export const userTasks = mysqlTable(
  "user_tasks",
  {
    id: int().autoincrement().notNull(),
    userId: int("user_id")
      .notNull()
      .references(() => users.id),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    dueDate: datetime("due_date", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    index("user_id").on(table.userId),
    primaryKey({ columns: [table.id], name: "user_tasks_id" }),
  ],
);

export const users = mysqlTable(
  "users",
  {
    id: int().autoincrement().notNull(),
    username: tinytext().notNull(),
    email: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 64 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    googleLastSync: timestamp({ mode: "string" }),
    googleAccessToken: text(),
    googleRefreshToken: text(),
    googleName: varchar({ length: 255 }),
    googlePic: varchar({ length: 500 }),
    useGooglePic: tinyint().default(0),
    backgroundImage: text("background_image"),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "users_id" }),
    unique("email").on(table.email),
  ],
);
