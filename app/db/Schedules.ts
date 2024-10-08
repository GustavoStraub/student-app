import * as SQLite from "expo-sqlite";
import { cancelNotificationsForSchedule } from "../helpers/excludeNotification";

export type Schedule = {
  id: number;
  name: string;
  data: string; // JSON
};

export const insertSchedule = async (
  name: string,
  data: string
): Promise<void> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db", {
    useNewConnection: true,
  });

  const result = await db.runAsync(
    "INSERT INTO schedules (name, data) VALUES (?, ?)",
    name,
    data
  );

  console.log("Schedule saved!", result);
};

export const getAllSchedules = async (): Promise<Schedule[]> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db");
  const schedules: Schedule[] = await db.getAllAsync("SELECT * FROM schedules");
  return schedules;
};

export const deleteSchedule = async (id: number): Promise<void> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db");
  await db.runAsync("DELETE FROM schedules WHERE id = ?", id);
};

export const flushSchedules = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db", {
    useNewConnection: true,
  });
  await db.runAsync("DELETE FROM schedules");
};

export const excludeScheduleAndNotifications = async (
  scheduleId: number
): Promise<void> => {
  await cancelNotificationsForSchedule(scheduleId);

  await deleteSchedule(scheduleId);
};
