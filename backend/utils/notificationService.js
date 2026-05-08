import axios from "axios";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

const fallbackWithAxios = async (message) => {
  await axios.post("https://exp.host/--/api/v2/push/send", message, {
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
  });
};

export const sendPushNotification = async ({ to, title, body, data = {} }) => {
  if (!to || !Expo.isExpoPushToken(to)) {
    return { sent: false, reason: "invalid_token" };
  }

  const message = {
    to,
    sound: "default",
    title,
    body,
    data,
    _displayInForeground: true,
  };

  try {
    await expo.sendPushNotificationsAsync([message]);
    return { sent: true };
  } catch (error) {
    console.error("Expo SDK send failed, falling back to axios:", error.message);
    try {
      await fallbackWithAxios(message);
      return { sent: true, fallback: true };
    } catch (fallbackError) {
      console.error("Axios fallback failed:", fallbackError.message);
      return { sent: false, reason: "send_failed" };
    }
  }
};
