import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.error('No autorizado. Redirigiendo al inicio de sesión...');
      } else if (error.response.status === 403) {
        console.error('Acceso prohibido.');
      } else if (error.response.status === 500) {
        console.error('Error en el servidor. Intenta de nuevo más tarde.');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
