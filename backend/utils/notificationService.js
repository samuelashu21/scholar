import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotificationNow = async ({ to, title, body, data = {} }) => {
  if (!to || !Expo.isExpoPushToken(to)) return;

  const messages = [
    {
      to,
      sound: "default",
      title,
      body,
      data,
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    await expo.sendPushNotificationsAsync(chunk);
  }
};
