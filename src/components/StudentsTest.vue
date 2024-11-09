<template>
  <div class="test-table container mt-4" :class="{ 'dark-theme': isDarkTheme }">
    <h2>Hola {{ professorName }}</h2>
    <p>Estos son los test del mes</p>

    <div class="d-flex justify-content-between mb-3">
      <div class="input-group w-50">
        <span class="input-group-text">
          <i class="pi pi-search"></i>
        </span>
        <input
          type="text"
          class="form-control"
          placeholder="Buscar..."
          v-model="globalFilter"
        />
      </div>
      <div>
        <button class="btn btn-outline-primary me-2" @click="sendEmail">
          <i class="pi pi-envelope"></i> Enviar por correo (mailto)
        </button>
        <button class="btn btn-success" @click="exportToExcel">
          <i class="pi pi-file-excel"></i> Exportar Excel
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label for="classroomDropdown" class="form-label">Selecciona un salón:</label>
      <select id="classroomDropdown" class="form-select" v-model="selectedClassroom" @change="filterTestsByClassroom">
        <option value="" disabled>Selecciona un salón</option>
        <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
          {{ classroom.name }}
        </option>
      </select>
    </div>

    <table class="table table-bordered table-striped" :class="{ 'table-dark': isDarkTheme }">
      <thead :class="{ 'thead-light': !isDarkTheme, 'thead-dark': isDarkTheme }">
        <tr>
          <th>Status</th>
          <th>Fecha</th>
          <th>Nombre</th>
          <th>Diagnostico</th>
          <th>Edad</th>
          <th v-if="!isDarkTheme">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="test in filteredTests" :key="test.evaluationId">
          <td>
            <span class="badge" :class="test.status === 'Completed' ? 'bg-success' : 'bg-warning'">
              {{ test.status }}
            </span>
          </td>
          <td>{{ test.fecha }}</td>
          <td>{{ test.nombre }}</td>
          <td>{{ test.resultado || 'Sin diagnóstico' }}</td>
          <td>{{ test.edad }}</td>
          <td class="text-center" v-if="!isDarkTheme">
            <button
              class="btn btn-danger btn-sm"
              v-if="test.status !== 'Pending'"
              @click="deleteTest(test)"
            >
              <i class="pi pi-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <nav aria-label="Page navigation" class="py-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" @click="prevPage">Anterior</a>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
          <a class="page-link" @click="goToPage(page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" @click="nextPage">Siguiente</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import classRoomsService from '/services/classrooms';
import studentsService from '/services/student';
import evaluationsService from '/services/evaluation';
import educatorService from '/services/educator';

export default {
  data() {
    return {
      globalFilter: '',
      currentPage: 1,
      isDarkTheme: false,
      selectedClassroom: '',
      tests: [],
      classrooms: [],
      professorName: '',
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredTests.length / 10);
    },
    filteredTests() {
      let filtered = this.tests.filter(test =>
        test.nombre.toLowerCase().includes(this.globalFilter.toLowerCase())
      );

      if (this.selectedClassroom) {
        filtered = filtered.filter(test => test.classroomId === this.selectedClassroom);
      }

      return filtered.slice((this.currentPage - 1) * 10, this.currentPage * 10);
    },
  },
  mounted() {
    this.loadClassrooms();
    this.loadProfessorName();
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
    loadProfessorName() {
      const educatorId = localStorage.getItem('id');
      if (educatorId) {
        educatorService.getEducatorById(educatorId)
          .then(response => {
            this.professorName = response.data.data.name;
          })
          .catch(error => {
            console.error('Error al obtener el nombre del profesor:', error);
          });
      }
    },
    loadStudentsByClassroom(classroomId) {
      studentsService.getAllStudentsWithEvaluations()
        .then(response => {
          const students = response.data.data;
          const filteredStudents = students.filter(student => student.salonId === classroomId);

          this.tests = filteredStudents.map(student => {
            const evaluation = student.evaluations.find(evaluation => evaluation.type === 'Completo');
            return {
              evaluationId: evaluation ? evaluation.id : null,
              status: evaluation ? 'Completed' : 'Pending',
              fecha: evaluation ? evaluation.date : '',
              nombre: student.name,
              resultado: student.hasTdah !== null ? student.hasTdah : null,
              edad: student.age,
              classroomId: student.salonId,
            };
          });
        })
        .catch(error => {
          console.error('Error al obtener estudiantes con evaluaciones:', error);
        });
    },
    deleteTest(test) {
      if (confirm(`¿Estás seguro de que deseas eliminar la evaluación de ${test.nombre}?`)) {
        evaluationsService.deleteEvaluation(test.evaluationId)
          .then(() => {
            this.tests = this.tests.filter(t => t.evaluationId !== test.evaluationId);
            alert('Evaluación eliminada correctamente');
          })
          .catch(error => {
            console.error('Error al eliminar la evaluación:', error);
            alert('No se pudo eliminar la evaluación. Inténtalo de nuevo.');
          });
      }
    },
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.filteredTests);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tests');
      XLSX.writeFile(wb, 'tests.xlsx');
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
    filterTestsByClassroom() {
      this.currentPage = 1;
      if (this.selectedClassroom) {
        this.loadStudentsByClassroom(this.selectedClassroom);
      }
    },
  },
};
</script>

<style scoped>
.test-table {
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-left: 80px;
  width: auto;
}
.test-table.dark-theme {
  background-color: #333;
  color: #fff;
}
</style>
