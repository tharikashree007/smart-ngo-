import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const projectAPI = {
  getAll: () => API.get('/projects'),
  getOne: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  approve: (id, status) => API.patch(`/projects/${id}/approve`, { status }),
  flag: (id, reason) => API.post(`/projects/${id}/flag`, { reason }),
  calculateImpact: (id) => API.post(`/projects/${id}/impact`),
  addMilestone: (id, data) => API.post(`/projects/${id}/milestones`, data),
  updateMilestone: (id, mId, data) => API.patch(`/projects/${id}/milestones/${mId}`, data),
  addExpense: (id, data) => API.post(`/projects/${id}/expenses`, data),
  addUpdate: (id, data) => API.post(`/projects/${id}/updates`, data),
};

export const donationAPI = {
  getAll: () => API.get('/donations'),
  create: (data) => API.post('/donations', data),
  getByProject: (projectId) => API.get(`/donations/project/${projectId}`),
  getReceipt: (id) => API.get(`/donations/${id}/receipt`),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: () => API.get('/admin/users'),
  approveNGO: (id, approved) => API.patch(`/admin/users/${id}/approve-ngo`, { approved }),
  flagUser: (id) => API.patch(`/admin/users/${id}/flag`),
  getFraudAlerts: () => API.get('/admin/fraud-alerts'),
  getDonations: () => API.get('/admin/donations'),
};

export default API;
