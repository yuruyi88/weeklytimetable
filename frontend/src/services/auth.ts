import { api, setToken, clearToken as clearApiToken } from './api';

export const getAuthStatus = async () => {
  return api.auth.status();
};

export const setupPIN = async (pin: string) => {
  const result = await api.auth.setup(pin);
  return result;
};

export const verifyPIN = async (pin: string) => {
  const result = await api.auth.verify(pin);
  setToken(result.access_token);
  return result;
};

export const changePIN = async (oldPin: string, newPin: string) => {
  const result = await api.auth.change(oldPin, newPin);
  return result;
};

export const getToken = () => {
  return localStorage.getItem('timetable_token');
};

export const clearToken = () => {
  clearApiToken();
};

export const isAuthenticated = () => {
  return !!getToken();
};
