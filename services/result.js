import apiClient from './api';

export default {
  createStroopResult(stroopData) {
    return apiClient.post('/results/stroop', stroopData);
  },

  getStroopResultsByEvaluation(evaluationId) {
    return apiClient.get(`/results/stroop/${evaluationId}`);
  },

  createCPTResult(cptData) {
    return apiClient.post('/results/cpt', cptData);
  },

  getCPTResultsByEvaluation(evaluationId) {
    return apiClient.get(`/results/cpt/${evaluationId}`);
  },

  createSSTResult(sstData) {
    return apiClient.post('/results/sst', sstData);
  },

  getSSTResultsByEvaluation(evaluationId) {
    return apiClient.get(`/results/sst/${evaluationId}`);
  }
};
