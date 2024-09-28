import * as SQLite from "expo-sqlite";

export const setupDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("studySchedules.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      data TEXT NOT NULL
    );
  `);

  console.log("Tabela criada com sucesso!");
};
