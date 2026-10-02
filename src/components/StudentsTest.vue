<template>
  <div :class="['test-table', 'container', 'mt-4', { 'dark-theme': isDarkTheme }]">
    <div class="table-header">
      <div>
        <h2>Hola {{ professorName }}</h2>
        <p>Estos son los test del mes</p>
      </div>
    </div>

    <div class="toolbar">
      <div class="input-group search-box" :class="{ 'dark-box': isDarkTheme }">
        <span class="input-group-text" :class="{ 'dark-box': isDarkTheme }">
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
      <div class="action-buttons">
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
import emitter from '@/eventBus';
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      globalFilter: '',
      currentPage: 1,
      isDarkTheme: localStorage.getItem('theme') === 'dark',
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
    this.isDarkTheme = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
    emitter.on('theme-changed', this.handleThemeChange);
    this.loadClassrooms();
    this.loadProfessorName();
  },
  beforeUnmount() {
    emitter.off('theme-changed', this.handleThemeChange);
  },
  methods: {
    handleThemeChange(newTheme) {
      this.isDarkTheme = newTheme === 'dark';
      document.body.classList.toggle('dark-theme', this.isDarkTheme);
    },
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
                : Number(student.hasTdah) === 0 
                ? 'Sin indicio de Tdah' 
                : 'Tiene indicios de Tdah',
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
            if (this.selectedClassroom) {
            this.loadStudentsByClassroom(this.selectedClassroom);
        }
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
  position: relative;
  z-index: 1;
  max-width: 980px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  padding: 28px 24px 18px;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  width: min(980px, 100%);
  transition: background-color 0.3s, color 0.3s;
  margin: 30px auto 40px;
}

.table-header {
  margin-bottom: 22px;
}

.table-header h2 {
  margin: 0;
  font-size: clamp(2rem, 2.5vw, 2.8rem);
  color: #1d4ed8;
  font-weight: 600;
}

.table-header p {
  margin: 8px 0 0;
  color: #475569;
  font-size: 1.02rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.search-box {
  width: min(360px, 100%);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
}

.search-box .input-group-text {
  background: #ffffff;
  color: #64748b;
  border: 1px solid #dbe3f0;
  border-right: none;
}

.search-box .form-control {
  border: 1px solid #dbe3f0;
  border-left: none;
  background: #ffffff;
  color: #0f172a;
  padding: 12px 14px;
}

.search-box .form-control:focus {
  box-shadow: none;
  outline: none;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 10px 16px;
  border: none;
}

.btn-outline-primary {
  background: rgba(37, 99, 235, 0.06);
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.18);
}

.btn-outline-primary:hover {
  background: rgba(37, 99, 235, 0.12);
}

.btn-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.18);
}

.form-label {
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
}

.form-select {
  border-radius: 14px;
  border: 1px solid #dbe3f0;
  background: #ffffff;
  color: #0f172a;
  padding: 12px 14px;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-top: 8px;
  background: transparent;
}

.table thead th {
  background: rgba(148, 163, 184, 0.16);
  color: #334155;
  border: none;
  padding: 14px 16px;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.table tbody td {
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  border-right: none;
  border-left: none;
  padding: 14px 16px;
  color: #1f2937;
  vertical-align: middle;
}

.table tbody tr td:first-child {
  border-left: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px 0 0 12px;
}

.table tbody tr td:last-child {
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 0 12px 12px 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  border-radius: 999px;
  padding: 8px 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.bg-success {
  background: rgba(34, 197, 94, 0.14) !important;
  color: #166534 !important;
}

.bg-warning {
  background: rgba(245, 158, 11, 0.14) !important;
  color: #92400e !important;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.pagination {
  margin-top: 18px;
  gap: 8px;
}

.page-link {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.8);
  color: #334155;
  border-radius: 10px;
  padding: 8px 12px;
}

.page-item.active .page-link {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-color: #1d4ed8;
  color: white;
}

.page-item.disabled .page-link {
  opacity: 0.5;
}

.dark-theme {
  background: #313131;
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.14);
}

.dark-theme .table-header h2 {
  color: #e2e8f0;
}

.dark-theme .table-header p,
.dark-theme .form-label,
.dark-theme label,
.dark-theme .table thead th,
.dark-theme .table tbody td,
.dark-theme .page-link {
  color: #e2e8f0;
}

.dark-theme .search-box .input-group-text,
.dark-theme .search-box .form-control,
.dark-theme .form-select,
.dark-theme .page-link {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(148, 163, 184, 0.22);
  color: #f8fafc;
}

.dark-theme .search-box .form-control::placeholder {
  color: #cbd5e1;
}

.dark-theme .table tbody td {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  color: #f8fafc;
}

.dark-theme .table thead th {
  background: rgba(255, 255, 255, 0.04);
}

.dark-theme .badge {
  background-color: rgba(148, 163, 184, 0.18);
}

.dark-theme .btn-outline-primary {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(96, 165, 250, 0.28);
  color: #dbeafe;
}

.dark-theme .page-item.active .page-link {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-color: #60a5fa;
  color: #ffffff;
}

.dark-theme .btn-danger {
  background: rgba(239, 68, 68, 0.12);
  color: #fecaca;
}

.dark-theme .action-buttons .btn-success {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
  color: white;
}
</style>
