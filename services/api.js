import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL, // URL base definida en .env
  headers: {
    'Content-Type': 'application/json',
  },
});



// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de errores específicos
    if (error.response) {
      if (error.response.status === 401) {
        console.error('No autorizado. Redirigiendo al inicio de sesión...');
        // Aquí puedes redirigir al usuario a la página de inicio de sesión si es necesario
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
