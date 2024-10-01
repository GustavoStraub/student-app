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
  dayOfWeek,
}: ScheduleNotificationProps): Promise<void> => {
  const [hours, minutes] = startTime.split(":");

  console.log(
    `Agendando notificação para ${subject} às ${hours}:${minutes} no dia ${dayOfWeek}`
  );

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, // always show alert
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Hora de Estudar!",
      body: ` Vamos começar com: ${subject} 📚`,
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
      console.log(`Scheduling ${firstSession.subject} on ${daySchedule.day}`);
      await scheduleWeeklyNotification({
        subject: firstSession.subject,
        startTime: firstSession.startTime,
        dayOfWeek,
      });
    }
  }

  console.log("Scheduled!");
};
