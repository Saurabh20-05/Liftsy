import axios from 'axios';

const api = axios.create({  
   
 baseURL: process.env.REACT_APP_API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const workoutsAPI = {
  explore: (params) => api.get('/workouts/explore', { params }),
  mine: () => api.get('/workouts/mine'),
  get: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  save: (id) => api.post(`/workouts/${id}/save`),
  rate: (id, rating) => api.post(`/workouts/${id}/rate`, { rating }),
};

export const sessionsAPI = {
  start: (data) => api.post('/sessions/start', data),
  getActive: () => api.get('/sessions/active'),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  complete: (id, data) => api.post(`/sessions/${id}/complete`, data),
  share: (id, data) => api.post(`/sessions/${id}/share`, data),
  history: (params) => api.get('/sessions/history', { params }),
  get: (id) => api.get(`/sessions/${id}`),
  stats: (params) => api.get('/sessions/stats/overview', { params }),
};

export const exercisesAPI = {
  list: (params) => api.get('/exercises', { params }),
  get: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  muscles: () => api.get('/exercises/meta/muscles'),
  equipment: () => api.get('/exercises/meta/equipment'),
};

export const socialAPI = {
  feed: (params) => api.get('/social/feed', { params }),
explore: (params) => api.get('/social/explore', { params }),
  createPost: (data) => api.post('/social/post', data),
  likePost: (id) => api.post(`/social/post/${id}/like`),
  reactPost: (id, reactionType) => api.post(`/social/post/${id}/react`, { reactionType }),
  commentPost: (id, content) => api.post(`/social/post/${id}/comment`, { content }),
  deleteComment: (postId, commentId) => api.delete(`/social/post/${postId}/comment/${commentId}`),
  userPosts: (userId, params) => api.get(`/social/user/${userId}/posts`, { params }),
  deletePost: (id) => api.delete(`/social/post/${id}`),
};

export const usersAPI = {
  search: (q) => api.get('/users/search', { params: { q } }),
  profile: (username) => api.get(`/users/${username}`),
  follow: (id) => api.post(`/users/${id}/follow`),
  notifications: () => api.get('/users/me/notifications'),
  markRead: () => api.put('/users/me/notifications/read'),
  leaderboard: () => api.get('/users/leaderboard/volume'),
};

export const aiAPI = {
  generateWorkout: (data) => api.post('/ai/generate-workout', data),
  analyzeSession: (id) => api.post(`/ai/analyze-session/${id}`),
  coach: (messages, context) => api.post('/ai/coach', { messages, context }),
  formTips: (exerciseName) => api.post('/ai/form-tips', { exerciseName }),
  suggestProgression: (data) => api.post('/ai/suggest-progression', data),
};

export default api;
