import axiosInstance from './axiosInstance'

export const notificationApi = {
  getAll: () => axiosInstance.get('/notifications'),
  getUnreadCount: () => axiosInstance.get('/notifications/unread-count'),
  markAsRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosInstance.patch('/notifications/read-all'),
  delete: (id) => axiosInstance.delete(`/notifications/${id}`),
}
