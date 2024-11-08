<template>
  <div class="container">
    <div class="dropdown mb-3">
      <select v-model="selectedClassroom" @change="loadStudents">
        <option disabled value="">Selecciona un salón</option>
        <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
          {{ classroom.name }}
        </option>
      </select>
    </div>

    <div v-if="loadingStudents" class="mb-3">
      <p>Cargando estudiantes...</p>
    </div>

    <div v-if="students.length > 0" class="mb-3">
      <select v-model="selectedStudent1" @change="loadStudentDetails(1)">
        <option disabled value="">Selecciona un estudiante</option>
        <option v-for="student in students" :key="student.id" :value="student.id">
          {{ student.name }}
        </option>
      </select>
    </div>

    <div v-if="students.length === 0 && selectedClassroom && !loadingStudents">
      <p>No hay estudiantes en este salón.</p>
    </div>

    <div v-if="selectedStudent1 && studentDetails1" class="mt-4">
      <h3>Datos del Estudiante 1: {{ studentDetails1.name }}</h3>
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Stroop Results</th>
            <th>CPT Results</th>
            <th>SST Results</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-if="studentDetails1.evaluations.length > 0 && studentDetails1.evaluations[0].stroopResults.length > 0">
              <div v-for="result in studentDetails1.evaluations[0].stroopResults" :key="result.id">
                <p>Average Response Time: {{ result.averageResponseTime }} ms</p>
                <p>Correct Answers: {{ result.correctAnswers }}</p>
                <p>Incorrect Answers: {{ result.incorrectAnswers }}</p>
              </div>
            </td>
            <td v-else>No disponible</td>

            <td v-if="studentDetails1.evaluations.length > 0 && studentDetails1.evaluations[0].cptResults.length > 0">
              <div v-for="result in studentDetails1.evaluations[0].cptResults" :key="result.id">
                <p>Average Response Time: {{ result.averageResponseTime }} ms</p>
                <p>Omission Errors: {{ result.omissionErrors }}</p>
                <p>Commission Errors: {{ result.commissionErrors }}</p>
              </div>
            </td>
            <td v-else>No disponible</td>

            <td v-if="studentDetails1.evaluations.length > 0 && studentDetails1.evaluations[0].sstResults.length > 0">
              <div v-for="result in studentDetails1.evaluations[0].sstResults" :key="result.id">
                <p>Average Response Time: {{ result.averageResponseTime }} ms</p>
                <p>Correct Stops: {{ result.correctStops }}</p>
                <p>Incorrect Stops: {{ result.incorrectStops }}</p>
                <p>Ignored Arrows: {{ result.ignoredArrows }}</p>
              </div>
            </td>
            <td v-else>No disponible</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="students.length > 0" class="mb-3">
      <select v-model="selectedStudent2" @change="loadStudentDetails(2)">
        <option disabled value="">Selecciona un estudiante</option>
        <option v-for="student in students" :key="student.id" :value="student.id">
          {{ student.name }}
        </option>
      </select>
    </div>

    <div v-if="selectedStudent2 && studentDetails2" class="mt-4">
      <h3>Datos del Estudiante 2: {{ studentDetails2.name }}</h3>
      <table class="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Stroop Results</th>
            <th>CPT Results</th>
            <th>SST Results</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-if="studentDetails2.evaluations.length > 0 && studentDetails2.evaluations[0].stroopResults.length > 0">
              <div v-for="result in studentDetails2.evaluations[0].stroopResults" :key="result.id">
                <p>Average Response Time: {{ result.averageResponseTime }} ms</p>
                <p>Correct Answers: {{ result.correctAnswers }}</p>
                <p>Incorrect Answers: {{ result.incorrectAnswers }}</p>
              </div>
            </td>
            <td v-else>No disponible</td>

            <td v-if="studentDetails2.evaluations.length > 0 && studentDetails2.evaluations[0].cptResults.length > 0">
              <div v-for="result in studentDetails2.evaluations[0].cptResults" :key="result.id">
                <p>Average Response Time: {{ result.averageResponseTime }} ms</p>
                <p>Omission Errors: {{ result.omissionErrors }}</p>
                <p>Commission Errors: {{ result.commissionErrors }}</p>
              </div>
            </td>
            <td v-else>No disponible</td>

            <td v-if="studentDetails2.evaluations.length > 0 && studentDetails2.evaluations[0].sstResults.length > 0">
              <div v-for="result in studentDetails2.evaluations[0].sstResults" :key="result.id">
                <p>Average Response Time: {{ result.averageResponseTime }} ms</p>
                <p>Correct Stops: {{ result.correctStops }}</p>
                <p>Incorrect Stops: {{ result.incorrectStops }}</p>
                <p>Ignored Arrows: {{ result.ignoredArrows }}</p>
              </div>
            </td>
            <td v-else>No disponible</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import studentService from "/services/student";
import classRoomsService from "/services/classrooms";
export default {
  data() {
    return {
      classrooms: [],
      students: [],
      selectedClassroom: "",
      selectedStudent1: "",
      selectedStudent2: "",
      studentDetails1: null,
      studentDetails2: null,
      loadingStudents: false,
      loadingDetails: false
    };
  },
  methods: {
    loadClassrooms() {
      const educatorId = localStorage.getItem('id');
      if (educatorId) {
        classRoomsService.getClassroomsByEducator(educatorId)
          .then(response => {
            this.classrooms = response.data.data;
            localStorage.setItem('classrooms', JSON.stringify(this.classrooms));
          })
          .catch(error => {
            console.error('Error al obtener los salones:', error);
          });
      }
    },

    loadStudents() {
      this.loadingStudents = true;
      if (this.selectedClassroom) {
        studentService.getStudentsBySalonId(this.selectedClassroom)
          .then(response => {
            if (response.data && Array.isArray(response.data.data)) {
              this.students = response.data.data;
            } else {
              this.students = [];
            }
          })
          .catch(error => {
            console.error("Error al cargar los estudiantes:", error);
            this.students = [];
          })
          .finally(() => {
            this.loadingStudents = false;
          });
      }
    },

    loadStudentDetails(studentNumber) {
      this.loadingDetails = true;
      const selectedStudent = studentNumber === 1 ? this.selectedStudent1 : this.selectedStudent2;
      if (selectedStudent) {
        console.log("Estudiante seleccionado con ID:", selectedStudent);

        studentService.getAllStudentsWithEvaluations()
          .then(response => {
            const students = response.data.data;
            const filteredStudents = students.filter(student => student.id === selectedStudent);
            if (filteredStudents.length > 0) {
              const student = filteredStudents[0];
              if (studentNumber === 1) {
                this.studentDetails1 = student;
              } else {
                this.studentDetails2 = student;
              }
            }
          })
          .catch(error => {
            console.error("Error al cargar los detalles del estudiante:", error);
          })
          .finally(() => {
            this.loadingDetails = false;
          });
      }
    }
  },

  created() {
    this.loadClassrooms();
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  margin-left: 80px !important;
  width: auto;
}

.dropdown {
  margin-bottom: 20px;
}

select {
  padding: 10px;
  width: 100%;
  font-size: 16px;
  border: 2px solid #007bff;
  border-radius: 6px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

select:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border: 1px solid #ddd;
}

th {
  background-color: #007bff;
  color: white;
}

td {
  background-color: #f8f9fa;
}

.mt-4 {
  margin-top: 40px;
}

.mb-3 {
  margin-bottom: 20px;
}
</style>
