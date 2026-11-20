import axios from 'axios';

const TOKEN_KEY = 'roadsense_token';

const HTTP_ERROR_MESSAGES = {
  400: 'Invalid image or request.',
  401: 'Authentication required. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'AI detection service was not found.',
  413: 'Image is too large. Please upload a smaller image.',
  422: 'The uploaded image could not be processed.',
  500: 'The AI detection service encountered an internal error.',
  502: 'The AI detection service is temporarily unavailable.',
  503: 'The AI detection service is temporarily unavailable.',
};

function apiErrorMessage(status) {
  return HTTP_ERROR_MESSAGES[status] || 'The RoadSense AI request could not be completed.';
}

function backendErrorMessage(error) {
  const body = error?.response?.data;
  const message = body?.error?.message || body?.detail || body?.message;
  return typeof message === 'string' && message.trim() ? message : null;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
});

export function getApiAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const apiOrigin = new URL(api.defaults.baseURL, window.location.origin).origin;
  const assetPath = String(path).replace(/\\/g, '/').replace(/^\/+/, '');
  return new URL(assetPath, `${apiOrigin}/`).toString();
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  // Never set a multipart Content-Type manually. Axios supplies the boundary.
  // JSON requests retain Axios's built-in default serialization and headers.
  if (isFormData) {
    if (typeof config.headers?.setContentType === 'function') {
      config.headers.setContentType(undefined);
    }
    delete config.headers?.['Content-Type'];
    delete config.headers?.['content-type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const payload = response?.data;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return { ...response, data: payload.data, meta: payload.meta ?? null };
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('roadsense_user');
    }

    const status = error?.response?.status;
    const message = backendErrorMessage(error) || (
      status
        ? apiErrorMessage(status)
        : 'Unable to connect to the RoadSense AI backend. Make sure the backend is running.'
    );
    const apiError = new Error(message);
    apiError.status = status || null;
    apiError.isNetworkError = !status;
    apiError.code = error?.response?.data?.error?.code || null;
    return Promise.reject(apiError);
  },
);

export default api;
