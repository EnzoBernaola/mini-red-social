import { API_URL } from "./config";

const NOTIFICATIONS_URL = `${API_URL}/api/notifications`;

export const getNotifications = async (token) => {
  const res = await fetch(NOTIFICATIONS_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const markAllAsRead = async (token) => {
  const res = await fetch(`${NOTIFICATIONS_URL}/read-all`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};
