import * as Notifications from "expo-notifications";
import { askNotificationPermission } from "./permissions";
import { GPTScheduleResponse } from "../types/Schedule";

type ScheduleNotificationProps = {
  subject: string;
  startTime: string;
  dayOfWeek: number;
};

const scheduleWeeklyNotification = async ({
  subject,
  startTime,
  endTime,
  dayOfWeek,
  type,
}: ScheduleNotificationProps & {
  endTime?: string;
  type: "start" | "end";
}): Promise<void> => {
  const [hours, minutes] = (type === "start" ? startTime : endTime)?.split(
    ":"
  ) || ["00", "00"];

  console.log(
    `Agendando notificação para ${subject} às ${hours}:${minutes} no dia ${dayOfWeek}`
  );

  await Notifications.scheduleNotificationAsync({
    content: {
      title: type === "start" ? "Hora de Estudar!" : "Fim do Estudo!",
      body:
        type === "start"
          ? `Vamos começar com: ${subject} 📚`
          : `Parabéns! Consistência é a chave do sucesso! 🎉`,
    },
    trigger: {
      weekday: dayOfWeek,
      hour: parseInt(hours, 10),
      minute: parseInt(minutes, 10),
      repeats: true,
    },
  });
};

export const scheduleNotificationsForWeek = async (
  schedule: GPTScheduleResponse
): Promise<void> => {
  const hasPermission = await askNotificationPermission();

  if (!hasPermission) {
    console.log("Permissão para notificações negada.");
    return;
  }

  const daysOfWeek: { [key: string]: number } = {
    domingo: 1,
    "segunda-feira": 2,
    "terça-feira": 3,
    "quarta-feira": 4,
    "quinta-feira": 5,
    "sexta-feira": 6,
    sábado: 7,
  };

  console.log("Scheduling...");

  for (const daySchedule of schedule.schedule) {
    const dayOfWeek = daysOfWeek[daySchedule.day.toLowerCase()];
    if (dayOfWeek) {
      const firstSession = daySchedule.studySessions[0];
      const lastSession =
        daySchedule.studySessions[daySchedule.studySessions.length - 1];

      // Notify when the first session starts
      await scheduleWeeklyNotification({
        subject: firstSession.subject,
        startTime: firstSession.startTime,
        dayOfWeek,
        type: "start",
      });

      // Notify when the last session ends
      await scheduleWeeklyNotification({
        subject: lastSession.subject,
        startTime: lastSession.startTime,
        endTime: lastSession.endTime,
        dayOfWeek,
        type: "end",
      });
    }
  }

  console.log("Scheduled!");
};
