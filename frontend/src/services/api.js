import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auth
export const register        = d => API.post('/auth/register', d);
export const login           = d => API.post('/auth/login', d);
export const getMe           = () => API.get('/auth/me');
export const forgotPassword  = d => API.post('/auth/forgot-password', d);
export const resetPassword   = (token, d) => API.put(`/auth/reset-password/${token}`, d);

// User
export const getProfile    = () => API.get('/users/profile');
export const updateProfile = d  => API.put('/users/profile', d);
export const toggleSaveJob = id => API.post(`/users/save-job/${id}`);
export const getSavedJobs  = () => API.get('/users/saved-jobs');

// Jobs
export const getJobs             = p  => API.get('/jobs', { params: p });
export const getJobById          = id => API.get(`/jobs/${id}`);
export const getRecommendedJobs  = () => API.get('/jobs/recommended');
export const createJob           = d  => API.post('/jobs', d);
export const updateJob           = (id, d) => API.put(`/jobs/${id}`, d);
export const deleteJob           = id => API.delete(`/jobs/${id}`);
export const getMyJobs           = () => API.get('/jobs/my');
export const getJobApplicants    = id => API.get(`/jobs/${id}/applicants`);
export const toggleJobStatus     = id => API.patch(`/jobs/${id}/toggle-status`);

// Messages
export const getConversations  = () => API.get('/messages/conversations');
export const startConversation = d => API.post('/messages/start', d);
export const getMessages       = appId => API.get(`/messages/${appId}`);
export const sendMessage       = (appId, d) => API.post(`/messages/${appId}`, d, { headers: { 'Content-Type': 'multipart/form-data' } });

// Notifications
export const getNotifications  = () => API.get('/notifications');
export const markAllRead       = () => API.put('/notifications/mark-all-read');
export const markOneRead       = id => API.put(`/notifications/${id}/read`);
export const deleteNotification= id => API.delete(`/notifications/${id}`);

// Applications
export const applyForJob       = d  => API.post('/applications/apply', d, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyApplications = () => API.get('/applications/my');
export const withdrawApp       = id => API.delete(`/applications/${id}`);
export const updateAppStatus   = (id, d) => API.put(`/applications/${id}/status`, d);

// Company
export const saveCompany       = d  => API.post('/companies', d);
export const getMyCompany      = ()  => API.get('/companies/my');
export const getPublicCompany  = id  => API.get(`/companies/${id}`);

// Resume
export const analyzeResume = d => API.post('/resume/analyze', d, { headers: { 'Content-Type': 'multipart/form-data' } });

export default API;
