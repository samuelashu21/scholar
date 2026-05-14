import axios from 'axios';

/**
 * Sends a push notification via Expo Push Service
 * @param {string} expoPushToken - The receiver's stored token
 * @param {string} title - The title of the notification (e.g., Sender Name)
 * @param {string} body - The message content
 * @param {object} data - Extra data (e.g., { chatId: '123' })
 */
export const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  if (!expoPushToken || !expoPushToken.startsWith('ExponentPushToken')) {
    console.log("Invalid or missing push token.");
    return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    _displayInForeground: true, // Shows notification even if app is open
  };

  try {
    await axios.post('https://exp.host/--/api/v2/push/send', message, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });
    console.log("Notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};   