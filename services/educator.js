import apiClient from './api';

export default {
  // Obtener todos los educadores
  getAllEducators() {
    return apiClient.get('/educator');
  },

  // Obtener un educador por ID
  getEducatorById(educatorId) {
    return apiClient.get(`/educator/${educatorId}`);
  },

  // Actualizar un educador por ID
  updateEducator(educatorId, educatorData) {
    return apiClient.patch(`/educator/${educatorId}`, educatorData);
  },

  // Eliminar un educador por ID
  deleteEducator(educatorId) {
    return apiClient.delete(`/educator/${educatorId}`);
  }
};
