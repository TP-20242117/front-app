<template>
  <div :class="['test-table', 'container', 'mt-4', { 'dark-theme': isDarkTheme }]">
    <h2>Hola {{ professorName }}</h2>
    <p>Estos son los test del mes</p>

    <div class="d-flex justify-content-between mb-3">
      <div class="input-group w-50" :class="{ 'bg-dark': isDarkTheme }">
        <span class="input-group-text" :class="{ 'bg-dark': isDarkTheme }">
          <i class="pi pi-search"></i>
        </span>
        <input
          type="text"
          class="form-control"
          placeholder="Buscar..."
          v-model="globalFilter"
          :class="{ 'bg-dark text-light': isDarkTheme }"
        />
      </div>
      <div>
        <button class="btn btn-outline-primary me-2" @click="sendEmail">
          <i class="pi pi-envelope"></i> Enviar por correo
        </button>
        <button class="btn btn-success" @click="exportToExcel">
          <i class="pi pi-file-excel"></i> Exportar Excel
        </button>
      </div>
    </div>

    <div class="mb-3">
      <label for="classroomDropdown" class="form-label">Selecciona un salón:</label>
      <select
        id="classroomDropdown"
        class="form-select"
        v-model="selectedClassroom"
        @change="filterTestsByClassroom"
        :class="{ 'bg-dark text-light': isDarkTheme }"
      >
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
          <th>Resultado</th>
          <th>Edad</th>
          <th v-if="!isDarkTheme">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="test in paginatedTests" :key="test.evaluationId">
          <td>
            <span class="badge" :class="test.status === 'Completed' ? 'bg-success' : 'bg-warning'">
              {{ test.status }}
            </span>
          </td>
          <td>{{ formatDate(test.fecha) }}</td>
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

    <nav class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage">Anterior</button>
        </li>
        <li
          class="page-item"
          v-for="page in totalPages"
          :key="page"
          :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage">Siguiente</button>
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
import mailService from '/services/mail';
import { useToast } from 'vue-toastification';

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
    filteredTests() {
      let filtered = this.tests;

      if (this.globalFilter) {
        filtered = filtered.filter(test =>
          test.nombre.toLowerCase().includes(this.globalFilter.toLowerCase())
        );
      }

      if (this.selectedClassroom) {
        filtered = filtered.filter(test => test.classroomId === this.selectedClassroom);
      }

      return filtered;
    },
    paginatedTests() {
      const start = (this.currentPage - 1) * 10;
      return this.filteredTests.slice(start, start + 10);
    },
    totalPages() {
      return Math.ceil(this.filteredTests.length / 10) || 1;
    },
  },
  mounted() {
    this.loadClassrooms();
    this.loadProfessorName();
  },
  methods: {
    sendEmail() {
      const toast = useToast();
      if (this.selectedClassroom) {
        const professorEmail = String(localStorage.getItem("email"));
        const mailData = {
          email: professorEmail,
          salonId: this.selectedClassroom,
        };
        mailService.createMail(mailData)
          .then(() => toast.success("Correo enviado exitosamente."))
          .catch(() => toast.error("No se pudo enviar el correo."));
      } else {
        toast.warning("Por favor, selecciona un salón antes de enviar el correo.");
      }
    },
    formatDate(fecha) {
      if (!fecha) return '';
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES');
    },
    loadClassrooms() {
      const educatorId = localStorage.getItem('id');
      if (educatorId) {
        classRoomsService.getClassroomsByEducator(educatorId)
          .then(response => this.classrooms = response.data.data)
          .catch(error => console.error('Error al obtener salones:', error));
      }
    },
    loadProfessorName() {
      const educatorId = localStorage.getItem('id');
      if (educatorId) {
        educatorService.getEducatorById(educatorId)
          .then(response => this.professorName = response.data.data.name)
          .catch(error => console.error('Error al obtener nombre del profesor:', error));
      }
    },
    loadStudentsByClassroom(classroomId) {
      studentsService.getAllStudentsWithEvaluations()
        .then(response => {
          const students = response.data.data.filter(s => s.salonId === classroomId);
          this.tests = students.map(student => {
            const evalComp = student.evaluations.find(e => e.type === 'Completo');
            return {
              evaluationId: evalComp ? evalComp.id : null,
              status: evalComp ? 'Completed' : 'Pending',
              fecha: evalComp ? evalComp.date : '',
              nombre: student.name,
              resultado: student.hasTdah === null 
                ? 'Sin diagnóstico' 
                : student.hasTdah === 0 
                ? 'Sin Tdah' 
                : 'Con Tdah',
              edad: student.age,
              classroomId: student.salonId,
            };
          });
          this.currentPage = 1;
        })
        .catch(error => console.error('Error al cargar estudiantes:', error));
    },
    deleteTest(test) {
      if (confirm(`¿Eliminar evaluación de ${test.nombre}?`)) {
        evaluationsService.deleteEvaluation(test.evaluationId)
          .then(() => {
            this.tests = this.tests.filter(t => t.evaluationId !== test.evaluationId);
            alert('Evaluación eliminada.');
          })
          .catch(() => alert('Error al eliminar.'));
      }
    },
    exportToExcel() {
      const data = this.filteredTests.map(({ status, fecha, nombre, resultado, edad }) => ({
        'Status': status,
        'Fecha': fecha,
        'Nombre': nombre,
        'Resultado': resultado,
        'Edad': edad
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tests');
      XLSX.writeFile(wb, 'tests.xlsx');
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    goToPage(page) {
      this.currentPage = page;
    },
    filterTestsByClassroom() {
      this.loadStudentsByClassroom(this.selectedClassroom);
    },
  },
};
</script>


<style scoped>
.test-table {
  max-width: 900px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 10px;
  width: auto;
  transition: background-color 0.3s, color 0.3s;
}

.dark-theme {
  background-color: #333;
  color: white;
}

.dark-theme .form-control, .dark-theme .form-select {
  background-color: #555;
  color: white;
}

.dark-theme .input-group-text {
  background-color: #444;
  color: white;
}

.dark-theme .table {
  background-color: #444;
  color: white;
}

.dark-theme .table th, .dark-theme .table td {
  border-color: #666;
}

.dark-theme .table th {
  background-color: #555;
  color: white;
}

.dark-theme .table td {
  background-color: #444;
  color: white;
}

.dark-theme .badge {
  background-color: #666;
}

.dark-theme .table tbody tr:hover {
  background-color: #555;
}
.dark-theme .page-link {
  background-color: #555;
  color: white;
  border-color: #666;
}

.dark-theme .page-item.active .page-link {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
