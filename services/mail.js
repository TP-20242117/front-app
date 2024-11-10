import apiClient from './api';

export default {
    createMail(mailData) {
      return apiClient.post('/mail/send-classroom-report', mailData);
    }
};