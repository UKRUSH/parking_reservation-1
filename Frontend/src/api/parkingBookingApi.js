import axiosInstance from './axiosInstance'

export const parkingBookingApi = {
  getAll: () => axiosInstance.get('/parking-bookings'),
  getById: (id) => axiosInstance.get(`/parking-bookings/${id}`),
  create: (data) => axiosInstance.post('/parking-bookings', data),
  approve: (id) => axiosInstance.patch(`/parking-bookings/${id}/approve`),
  reject: (id, reason) => axiosInstance.patch(`/parking-bookings/${id}/reject`, { reason }),
  cancel: (id) => axiosInstance.patch(`/parking-bookings/${id}/cancel`),
  getBySlot: (slotId) => axiosInstance.get(`/parking-bookings/slot/${slotId}`),
  checkConflict: (slotId, startTime, endTime) =>
    axiosInstance.get('/parking-bookings/check-conflict', {
      params: { slotId, startTime, endTime },
    }),
}
