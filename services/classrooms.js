import apiClient from './api';

export default {
  createClassroom(classroomData) {
    return apiClient.post('/classrooms', classroomData);
  },

  getAllClassrooms() {
    return apiClient.get('/classrooms');
  },

  getClassroomsByEducator(educatorId) {
    return apiClient.get(`/classrooms/educator/${educatorId}`);
  },

  updateClassroom(classroomId, classroomData) {
    return apiClient.patch(`/classrooms/${classroomId}`, classroomData);
  },

  deleteClassroom(classroomId) {
    return apiClient.delete(`/classrooms/${classroomId}`);
  }
};
