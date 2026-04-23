import axiosInstance from './axiosInstance'

export const parkingSlotApi = {
  getSlots:     (type, startTime, endTime) =>
    axiosInstance.get('/parking-slots', { params: { type, startTime, endTime } }),

  getById:      (id)          => axiosInstance.get(`/parking-slots/${id}`),

  create:       (data)        => axiosInstance.post('/parking-slots', data),

  update:       (id, data)    => axiosInstance.put(`/parking-slots/${id}`, data),

  updateStatus: (id, status)  => axiosInstance.patch(`/parking-slots/${id}/status`, { status }),

  delete:       (id)          => axiosInstance.delete(`/parking-slots/${id}`),
}
