import apiClient2 from './api-ml';
export default {
    predict(Data) {
      return apiClient2.post('/predict', Data);
    }
  };
  