import apiClient from './api';

export default {
  getAllEducators() {
    return apiClient.get('/educator');
  },

  getEducatorById(educatorId) {
    return apiClient.get(`/educator/${educatorId}`);
  },

  updateEducator(educatorId, educatorData) {
    return apiClient.patch(`/educator/${educatorId}`, educatorData);
  },

  deleteEducator(educatorId) {
    return apiClient.delete(`/educator/${educatorId}`);
  }
};
