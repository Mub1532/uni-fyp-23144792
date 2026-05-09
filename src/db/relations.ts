import { relations } from "drizzle-orm/relations";
import {
  calendarItems,
  notes,
  userBlockedHours,
  userPreferences,
  userSubtasks,
  users,
  userTasks,
} from "./schema";

export const calendarItemsRelations = relations(calendarItems, ({ one }) => ({
  user: one(users, {
    fields: [calendarItems.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  calendarItems: many(calendarItems),
  notes: many(notes),
  userBlockedHours: many(userBlockedHours),
  userPreferences: many(userPreferences),
  userTasks: many(userTasks),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const userBlockedHoursRelations = relations(
  userBlockedHours,
  ({ one }) => ({
    user: one(users, {
      fields: [userBlockedHours.userId],
      references: [users.id],
    }),
  }),
);

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userPreferences.userId],
      references: [users.id],
    }),
  }),
);

export const userSubtasksRelations = relations(userSubtasks, ({ one }) => ({
  userTask: one(userTasks, {
    fields: [userSubtasks.taskId],
    references: [userTasks.id],
  }),
}));

export const userTasksRelations = relations(userTasks, ({ one, many }) => ({
  userSubtasks: many(userSubtasks),
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id],
  }),
}));
