import { apiInstance } from './apiClient';

export const getNotifications = ({
  limit = 20,
  offset = 0,
  unreadOnly = false,
  type,
} = {}) => apiInstance.get('/notifications', {
  params: {
    limit,
    offset,
    unreadOnly,
    ...(type ? { type } : {}),
  },
});

export const getUnreadNotificationCount = () =>
  apiInstance.get('/notifications/unread-count');

export const markAllNotificationsRead = () =>
  apiInstance.patch('/notifications/read-all');

export const markNotificationRead = (id) =>
  apiInstance.patch(`/notifications/${id}/read`);

export const deleteNotification = (id) =>
  apiInstance.delete(`/notifications/${id}`);
