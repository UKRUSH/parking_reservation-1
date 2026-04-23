import axiosInstance from './axiosInstance'

export const ticketApi = {
  // Tickets
  getAll: (status) =>
    axiosInstance.get('/tickets', { params: status ? { status } : {} }),
  getById: (id) =>
    axiosInstance.get(`/tickets/${id}`),
  create: (data) =>
    axiosInstance.post('/tickets', data),
  assign: (id, technicianId) =>
    axiosInstance.patch(`/tickets/${id}/assign`, { technicianId }),
  updateStatus: (id, status, technicianNotes) =>
    axiosInstance.patch(`/tickets/${id}/status`, { status, technicianNotes }),
  reject: (id, reason) =>
    axiosInstance.patch(`/tickets/${id}/reject`, { reason }),
  delete: (id) =>
    axiosInstance.delete(`/tickets/${id}`),

  // Attachments
  listAttachments: (ticketId) =>
    axiosInstance.get(`/tickets/${ticketId}/attachments`),
  uploadAttachment: (ticketId, file) => {
    const form = new FormData()
    form.append('file', file)
    return axiosInstance.post(`/tickets/${ticketId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  downloadAttachment: (ticketId, fileId) =>
    axiosInstance.get(`/tickets/${ticketId}/attachments/${fileId}`, { responseType: 'blob' }),
  deleteAttachment: (ticketId, fileId) =>
    axiosInstance.delete(`/tickets/${ticketId}/attachments/${fileId}`),

  // Comments
  getComments: (ticketId) =>
    axiosInstance.get(`/tickets/${ticketId}/comments`),
  addComment: (ticketId, content) =>
    axiosInstance.post(`/tickets/${ticketId}/comments`, { content }),
  editComment: (ticketId, commentId, content) =>
    axiosInstance.put(`/tickets/${ticketId}/comments/${commentId}`, { content }),
  deleteComment: (ticketId, commentId) =>
    axiosInstance.delete(`/tickets/${ticketId}/comments/${commentId}`),
}
