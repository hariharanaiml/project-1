import api from './api';

const TOKEN_KEY = 'roadsense_token';
const USER_KEY = 'roadsense_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession({ access_token, user } = {}) {
  if (access_token) {
    localStorage.setItem(TOKEN_KEY, access_token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}

export function isAdmin(user = getStoredUser()) {
  return Boolean(user && (user.role === 'admin' || user.is_superuser));
}

export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  const data = response.data;
  saveSession(data);
  return data;
}

export async function register({ fullName, email, phone, password, role }) {
  const response = await api.post('/auth/register', {
    full_name: fullName,
    email,
    phone: phone || undefined,
    password,
    role,
  });
  const data = response.data;
  saveSession(data);
  return data;
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export function logout() {
  clearSession();
}

export default {
  login,
  register,
  getCurrentUser,
  logout,
  getStoredToken,
  getStoredUser,
  saveSession,
  clearSession,
  isAuthenticated,
  isAdmin,
};
