// API service for backend integration
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const register = async (username: string, email: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
};

export const getUser = async (token: string) => {
  const res = await axios.get(`${API_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateUser = async (token: string, data: any) => {
  const res = await axios.put(`${API_URL}/user`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createDiaryEntry = async (token: string, entry: any) => {
  const res = await axios.post(`${API_URL}/diary`, entry, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getDiaryEntries = async (token: string) => {
  const res = await axios.get(`${API_URL}/diary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getDiaryEntry = async (token: string, id: string) => {
  const res = await axios.get(`${API_URL}/diary/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateDiaryEntry = async (token: string, id: string, data: any) => {
  const res = await axios.put(`${API_URL}/diary/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteDiaryEntry = async (token: string, id: string) => {
  const res = await axios.delete(`${API_URL}/diary/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
