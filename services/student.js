import apiClient from './api';

export default {
  createStudent(studentData) {
    return apiClient.post('/students', studentData);
  },

  getAllStudents() {
    return apiClient.get('/students');
  },

  getAllStudentsWithEvaluations() {
    return apiClient.get('/students/with-evaluations');
  },

  getStudentsBySalonId(salonId) {
    return apiClient.get(`/students/salon/${salonId}`);
  },

  getStudentById(studentId) {
    return apiClient.get(`/students/${studentId}`);
  },

  updateStudent(studentId, studentData) {
    return apiClient.patch(`/students/${studentId}`, studentData);
  },

  deleteStudent(studentId) {
    return apiClient.delete(`/students/${studentId}`);
  },

  uploadStudentsArray(studentsArray) {
    return apiClient.post('/students/upload-array', studentsArray);
  }
};
