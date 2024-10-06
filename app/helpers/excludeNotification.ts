import * as Notifications from "expo-notifications";

export const cancelNotificationsForSchedule = async (scheduleId: number) => {
  const allNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  allNotifications.forEach((notification) => {
    if (notification.identifier.includes(`schedule_${scheduleId}`)) {
      Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  });
};
