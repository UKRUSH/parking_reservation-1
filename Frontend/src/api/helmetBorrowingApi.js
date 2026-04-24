import axiosInstance from './axiosInstance'

export const helmetBorrowingApi = {
  getAll:  ()           => axiosInstance.get('/helmet-borrowings'),
  getById: (id)         => axiosInstance.get(`/helmet-borrowings/${id}`),
  create:  (data)       => axiosInstance.post('/helmet-borrowings', data),
  cancel:  (id)         => axiosInstance.patch(`/helmet-borrowings/${id}/cancel`),
  issue:   (id)         => axiosInstance.patch(`/helmet-borrowings/${id}/issue`),
  reject:  (id, reason) => axiosInstance.patch(`/helmet-borrowings/${id}/reject`, { reason }),
  return:  (id)         => axiosInstance.patch(`/helmet-borrowings/${id}/return`),
}
