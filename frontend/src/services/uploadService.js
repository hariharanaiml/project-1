import api from './api';

export async function uploadImage(file, onUploadProgress = null) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (typeof onUploadProgress !== 'function') return;
      const percent = Math.round((progressEvent.loaded * 100) / Math.max(progressEvent.total || 1, 1));
      onUploadProgress(percent);
    },
  });

  return response.data;
}

export default {
  uploadImage,
};
