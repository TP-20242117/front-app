import apiClient from './api';

export default {
  registerEducator(educatorData) {
    return apiClient.post('/auth/register-educator', educatorData);
  },

  registerStudent(studentData) {
    return apiClient.post('/auth/register-student', studentData);
  },
  
  loginEducator(loginData) {
    return apiClient.post('/auth/login-educator', loginData)
      .then(response => {
        this.setId(response.data.data.id);
        return response;
      })
      .catch(error => {
        console.error('Error en el inicio de sesión de educador:', error);
        throw error;
      });
  },

  loginStudent(loginData) {
    return apiClient.post('/auth/login-student', loginData);
  },

  setId(idex) {
    console.log('Guardando id en localStorage:', idex);
    localStorage.setItem('id', idex);
  }
};
