import * as SQLite from "expo-sqlite";

export const insertSchedule = async (
  name: string,
  data: object
): Promise<void> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db");
  await db.runAsync(
    "INSERT INTO schedules (name, data) VALUES (?, ?)",
    name,
    JSON.stringify(data)
  );
  console.log("Cronograma inserido!");
};

export const getAllSchedules = async () => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db");
  const schedules = await db.getAllAsync("SELECT * FROM schedules");
  console.log("Todos os cronogramas:", schedules);
  return schedules;
};

export const deleteSchedule = async (id: number): Promise<void> => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db");
  await db.runAsync("DELETE FROM schedules WHERE id = ?", id);
  console.log("Cronograma deletado!");
};
