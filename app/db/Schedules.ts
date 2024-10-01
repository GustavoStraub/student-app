import * as SQLite from "expo-sqlite";

export type Schedule = {
  id: number;
  name: string;
  data: string; // JSON
};

export const insertSchedule = async (
  name: string,
  data: object
): Promise<void> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db", {
    useNewConnection: true,
  });

  const result = await db.runAsync(
    "INSERT INTO schedules (name, data) VALUES (?, ?)",
    name,
    JSON.stringify(data)
  );

  console.log("Cronograma inserido com sucesso!", result);
};

export const getAllSchedules = async (): Promise<Schedule[]> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db");
  const schedules: Schedule[] = await db.getAllAsync("SELECT * FROM schedules");
  console.log("Cronogramas carregados:", schedules);
  return schedules;
};

export const deleteSchedule = async (id: number): Promise<void> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db");
  await db.runAsync("DELETE FROM schedules WHERE id = ?", id);
  console.log("Cronograma deletado!");
};

export const flushSchedules = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db", {
    useNewConnection: true,
  });
  await db.runAsync("DELETE FROM schedules");
  console.log("Cronogramas deletados!");
};
