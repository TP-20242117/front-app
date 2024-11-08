import apiClient from './api';

export default {
  createEvaluation(evaluationData) {
    return apiClient.post('/evaluations', evaluationData);
  },

  getAllEvaluations() {
    return apiClient.get('/evaluations');
  },

  getEvaluationsByStudent(studentId) {
    return apiClient.get(`/evaluations/student/${studentId}`);
  },

  deleteEvaluation(evaluationId) {
    return apiClient.delete(`/evaluations/${evaluationId}`);
  },

  getEvaluationsWithResults(studentId) {
    return apiClient.get(`/evaluations/student/${studentId}/results`);
  },

  updateEvaluation(evaluationId, evaluationData) {
    return apiClient.patch(`/evaluations/${evaluationId}`, evaluationData);
  }
};
