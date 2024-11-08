import axios from 'axios';
const apiClient2 = axios.create({
    baseURL: "https://flask-app-902582650829.us-central1.run.app",
    headers: {
      'Content-Type': 'application/json',
    },
  });
export default apiClient2;