<template>
  <div :class="['container', { 'dark-theme': theme === 'dark' }]">
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
import emitter from '@/eventBus';

export default {
  data() {
    return {
      theme: localStorage.getItem('theme') || 'light',
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
    handleThemeChange(newTheme) {
      this.theme = newTheme;
    },

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
  },

  mounted() {
    emitter.on('theme-changed', this.handleThemeChange);
  },

  beforeUnmount() {
    emitter.off('theme-changed', this.handleThemeChange);
  }
};
</script>

<style scoped>
.container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 28px;
  width: min(100%, 1120px);
  box-sizing: border-box;
  color: #1f2937;
}

.dropdown {
  margin-bottom: 16px;
}

select {
  min-height: 48px;
  padding: 11px 44px 11px 15px;
  width: 100%;
  font-size: 0.98rem;
  font-family: inherit;
  color: #1f2937;
  background-color: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.13);
}

.container > .mb-3 {
  margin-bottom: 16px;
}

.container > .mb-3 p {
  margin: 0;
  padding: 16px 18px;
  color: #475569;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
}

table {
  width: 100%;
  min-width: 660px;
  margin-top: 16px;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  background: #fff;
}

table th,
table td {
  padding: 14px 16px;
  text-align: left;
  vertical-align: top;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

table th:last-child,
table td:last-child {
  border-right: 0;
}

table tbody tr:last-child td {
  border-bottom: 0;
}

table thead th {
  background: #eaf1ff;
  color: #1e3a8a;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

table tbody td {
  color: #334155;
}

table td p {
  margin: 0 0 8px;
  line-height: 1.5;
}

table td p:last-child {
  margin-bottom: 0;
}

.mt-4 {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px;
  overflow-x: auto;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.mt-4 h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.15rem;
  line-height: 1.4;
  font-weight: 500;
}

.container.dark-theme {
  color: #f1f5f9;
}

.dark-theme select {
  color: #f1f5f9;
  background-color: #383838;
  border-color: rgba(148, 163, 184, 0.28);
}

.dark-theme > .mb-3 p {
  color: #cbd5e1;
  background: #313131;
  border-color: rgba(148, 163, 184, 0.18);
}

.dark-theme .mt-4 {
  background: #313131;
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.2);
}

.dark-theme .mt-4 h3 {
  color: #f1f5f9;
}

.container.dark-theme table.table {
  --bs-table-color: #e2e8f0;
  --bs-table-bg: #383838;
  --bs-table-border-color: rgba(148, 163, 184, 0.16);
  --bs-table-striped-color: #e2e8f0;
  --bs-table-striped-bg: #383838;
  --bs-table-active-color: #f1f5f9;
  --bs-table-active-bg: #414141;
  --bs-table-hover-color: #f1f5f9;
  --bs-table-hover-bg: #414141;
  border-color: rgba(148, 163, 184, 0.2);
  background: #383838;
}

.container.dark-theme table.table th,
.container.dark-theme table.table td {
  border-color: rgba(148, 163, 184, 0.16);
}

.container.dark-theme table.table thead th {
  background: #414141;
  color: #bfdbfe;
}

.container.dark-theme table.table > tbody > tr > td {
  --bs-table-color-type: #e2e8f0;
  --bs-table-bg-type: #383838;
  --bs-table-color-state: #e2e8f0;
  --bs-table-bg-state: #383838;
  color: #e2e8f0;
  background-color: #383838;
}

.container.dark-theme table.table > tbody > tr:nth-of-type(odd) > td {
  --bs-table-color-type: #e2e8f0;
  --bs-table-bg-type: #383838;
  --bs-table-color-state: #e2e8f0;
  --bs-table-bg-state: #383838;
  color: #e2e8f0;
}

@media (max-width: 640px) {
  .container {
    padding: 20px 16px;
  }

  .mt-4 {
    padding: 14px;
    border-radius: 14px;
  }

  .mt-4 h3 {
    font-size: 1.02rem;
  }
}
</style>
