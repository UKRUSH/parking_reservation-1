import axiosInstance from './axiosInstance'

export const userApi = {
  getAll: () => axiosInstance.get('/users'),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  updateRole: (id, role) => axiosInstance.patch(`/users/${id}/role`, { role }),
  deactivate: (id) => axiosInstance.delete(`/users/${id}`),
}
