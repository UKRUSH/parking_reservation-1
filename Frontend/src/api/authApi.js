import axiosInstance from './axiosInstance'

export const authApi = {
  getMe: () => axiosInstance.get('/auth/me'),
  logout: () => axiosInstance.post('/auth/logout'),
}

// Google OAuth login — redirects browser to Spring Boot OAuth2 endpoint
export const loginWithGoogle = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google'
}
