export type StudySession = {
  subject: string;
  startTime: string;
  endTime: string;
};

export type DaySchedule = {
  day: string;
  studySessions: StudySession[];
};

export type GPTScheduleResponse = {
  schedule: DaySchedule[];
  notes: string;
};
