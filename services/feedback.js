import apiClient from './api';

export default {
  createFeedback(feedbackData) {
    return apiClient.post('/feedback', feedbackData);
  },
};
