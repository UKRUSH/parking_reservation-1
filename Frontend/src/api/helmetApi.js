import axiosInstance from './axiosInstance'

export const helmetApi = {
  getAll:       (params)      => axiosInstance.get('/helmets', { params }),

  getById:      (id)          => axiosInstance.get(`/helmets/${id}`),

  create:       (data)        => axiosInstance.post('/helmets', data),

  update:       (id, data)    => axiosInstance.put(`/helmets/${id}`, data),

  updateStatus: (id, status)  => axiosInstance.patch(`/helmets/${id}/status`, { status }),

  delete:       (id)          => axiosInstance.delete(`/helmets/${id}`),
}
