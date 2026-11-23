import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/redux/api/notificationsApi';
import { sessionExpired, signOut } from './authSlice';

const requestError = (error, fallback) => error?.message || fallback;
const notificationId = (notification) => notification?.id || notification?._id;
const isNotificationRead = (notification = {}) =>
  notification.isRead
  ?? notification.read
  ?? Boolean(notification.readAt || notification.read_at);

const normalizeNotification = (notification = {}) => ({
  ...notification,
  id: notificationId(notification),
  isRead: Boolean(isNotificationRead(notification)),
  title: notification.title || notification.subject || 'Notification',
  message: notification.message || notification.body || notification.description || '',
  type: notification.type || 'general',
  createdAt: notification.createdAt || notification.created_at || notification.timestamp,
});

const normalizeNotificationList = (result) => {
  const items = Array.isArray(result)
    ? result
    : result?.notifications || result?.items || [];
  const unreadCount = result?.unreadCount ?? result?.unread_count;

  return {
    items: items.map(normalizeNotification),
    total: Number(result?.total ?? result?.pagination?.total ?? items.length),
    unreadCount: unreadCount == null ? null : Number(unreadCount),
  };
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (query = {}, { rejectWithValue }) => {
    try {
      return normalizeNotificationList(await getNotifications(query));
    } catch (error) {
      return rejectWithValue(requestError(error, 'Unable to load notifications.'));
    }
  },
);

export const fetchUnreadNotificationCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getUnreadNotificationCount();
      return Number(result?.unreadCount ?? result?.unread_count ?? result?.count ?? result ?? 0);
    } catch (error) {
      return rejectWithValue(requestError(error, 'Unable to load the unread count.'));
    }
  },
  {
    condition: (_, { getState }) => getState().notifications.countStatus !== 'loading',
  },
);

export const readAllNotifications = createAsyncThunk(
  'notifications/readAll',
  async (_, { rejectWithValue }) => {
    try {
      await markAllNotificationsRead();
      return true;
    } catch (error) {
      return rejectWithValue(requestError(error, 'Unable to mark notifications as read.'));
    }
  },
);

export const readNotification = createAsyncThunk(
  'notifications/readOne',
  async (id, { rejectWithValue }) => {
    try {
      const result = await markNotificationRead(id);
      const notification = normalizeNotification(result?.notification || result);
      return { id, notification: notification.id ? notification : null };
    } catch (error) {
      return rejectWithValue(requestError(error, 'Unable to mark this notification as read.'));
    }
  },
);

export const removeNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteNotification(id);
      return id;
    } catch (error) {
      return rejectWithValue(requestError(error, 'Unable to delete this notification.'));
    }
  },
);

const initialState = {
  items: [],
  total: 0,
  unreadCount: 0,
  status: 'idle',
  countStatus: 'idle',
  error: null,
  actionError: null,
  pendingIds: [],
  markingAll: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.total = action.payload.total;
        if (action.payload.unreadCount != null) state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchUnreadNotificationCount.pending, (state) => {
        state.countStatus = 'loading';
      })
      .addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
        state.countStatus = 'succeeded';
        state.unreadCount = Math.max(0, action.payload);
      })
      .addCase(fetchUnreadNotificationCount.rejected, (state) => {
        state.countStatus = 'failed';
      })
      .addCase(readAllNotifications.pending, (state) => {
        state.markingAll = true;
        state.actionError = null;
      })
      .addCase(readAllNotifications.fulfilled, (state) => {
        state.markingAll = false;
        state.unreadCount = 0;
        state.items.forEach((item) => { item.isRead = true; });
      })
      .addCase(readAllNotifications.rejected, (state, action) => {
        state.markingAll = false;
        state.actionError = action.payload || action.error.message;
      })
      .addCase(readNotification.pending, (state, action) => {
        state.pendingIds.push(action.meta.arg);
        state.actionError = null;
      })
      .addCase(readNotification.fulfilled, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload.id);
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          const wasUnread = !state.items[index].isRead;
          state.items[index] = action.payload.notification
            ? { ...state.items[index], ...action.payload.notification, isRead: true }
            : { ...state.items[index], isRead: true };
          if (wasUnread) state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(readNotification.rejected, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.meta.arg);
        state.actionError = action.payload || action.error.message;
      })
      .addCase(removeNotification.pending, (state, action) => {
        state.pendingIds.push(action.meta.arg);
        state.actionError = null;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.payload);
        const notification = state.items.find((item) => item.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(removeNotification.rejected, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.meta.arg);
        state.actionError = action.payload || action.error.message;
      })
      .addMatcher(
        (action) => [signOut.fulfilled.type, signOut.rejected.type, sessionExpired.type].includes(action.type),
        () => initialState,
      );
  },
});

export default notificationsSlice.reducer;
