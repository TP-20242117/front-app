<template>
  <div class="test-table container mt-4" :class="{ 'dark-theme': isDarkTheme }">
    <h2>Hola XXXX</h2>
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

    <table class="table table-bordered table-striped" :class="{ 'table-dark': isDarkTheme }">
      <thead :class="{ 'thead-light': !isDarkTheme, 'thead-dark': isDarkTheme }">
        <tr>
          <th>Status</th>
          <th>Fecha</th>
          <th>Nombre</th>
          <th>Resultado</th>
          <th>Edad</th>
          <th>Sexo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="test in filteredTests" :key="test.fecha">
          <td>
            <span
              class="badge"
              :class="test.status === 'Completed' ? 'bg-success' : 'bg-warning'"
            >
              {{ test.status }}
            </span>
          </td>
          <td>{{ test.fecha }}</td>
          <td>{{ test.nombre }}</td>
          <td>{{ test.resultado }}</td>
          <td>{{ test.edad }}</td>
          <td>{{ test.sexo }}</td>
          <td class="text-center">
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

    <form @submit.prevent="submitForm" :action="formAction" method="POST">
      <input type="hidden" name="recipient" value="recipient@example.com">
      <input type="hidden" name="subject" value="Datos de Tests">
      <textarea name="message" v-model="emailContent" placeholder="Datos de Tests" required style="display:none;"></textarea>
      <button type="submit" style="display:none;">Enviar Correo (Formspree)</button>
    </form>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
export default {
  data() {
    return {
      globalFilter: '',
      currentPage: 1,
      isDarkTheme: false,
      tests: [
        { status: 'Completed', fecha: '01/04/2024', nombre: 'Kendall', resultado: '80', edad: 12, sexo: 'M' },
        { status: 'Pending', fecha: '03/05/2024', nombre: 'Paulo', resultado: '70', edad: 14, sexo: 'M' },
        { status: 'Completed', fecha: '07/06/2024', nombre: 'Isabel', resultado: '90', edad: 15, sexo: 'F' },
        { status: 'Pending', fecha: '11/07/2024', nombre: 'Laura', resultado: '65', edad: 13, sexo: 'F' },
        { status: 'Completed', fecha: '13/08/2024', nombre: 'Rafael', resultado: '75', edad: 16, sexo: 'M' },
        { status: 'Completed', fecha: '19/09/2024', nombre: 'Ana', resultado: '85', edad: 17, sexo: 'F' },
        { status: 'Pending', fecha: '21/10/2024', nombre: 'Mario', resultado: '60', edad: 14, sexo: 'M' },
        { status: 'Completed', fecha: '25/10/2024', nombre: 'Fernando', resultado: '95', edad: 13, sexo: 'M' },
        { status: 'Pending', fecha: '30/10/2024', nombre: 'Sofía', resultado: '55', edad: 12, sexo: 'F' },
        { status: 'Completed', fecha: '01/11/2024', nombre: 'Diego', resultado: '78', edad: 14, sexo: 'M' },
      ],
      emailContent: '',
      formAction: 'https://formspree.io/f/YOUR_FORM_ID',
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredTests.length / 10);
    },
    filteredTests() {
      const filtered = this.tests.filter(test => 
        test.nombre.toLowerCase().includes(this.globalFilter.toLowerCase())
      );
      return filtered.slice((this.currentPage - 1) * 10, this.currentPage * 10);
    },
  },
  methods: {
    deleteTest(test) {
      this.tests = this.tests.filter(t => t !== test);
    },
    sendEmail() {
      const filteredData = this.filteredTests.map(test => 
        `Nombre: ${test.nombre}, Fecha: ${test.fecha}, Resultado: ${test.resultado}, Edad: ${test.edad}, Sexo: ${test.sexo}, Status: ${test.status}`
      ).join('\n');

      const emailBody = encodeURIComponent(filteredData);
      const emailTo = 'recipient@example.com';
      const subject = 'Datos de Tests';

      const mailtoLink = `mailto:${emailTo}?subject=${subject}&body=${emailBody}`;
      window.location.href = mailtoLink;
    },
    submitForm() {
      const filteredData = this.filteredTests.map(test => 
        `Nombre: ${test.nombre}, Fecha: ${test.fecha}, Resultado: ${test.resultado}, Edad: ${test.edad}, Sexo: ${test.sexo}, Status: ${test.status}`
      ).join('\n');
      this.emailContent = filteredData;
      this.$refs.form.submit();
    },
    exportToExcel() {
      const filteredData = this.tests.filter(test => 
        test.nombre.toLowerCase().includes(this.globalFilter.toLowerCase())
      );

      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tests');
      XLSX.writeFile(workbook, 'tests.xlsx');
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
  },
};
</script>

<style scoped>
.test-table {
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
.dark-theme .test-table {
  background-color: #2d3748;
  color: #cbd5e0;
}
.dark-theme .table {
  background-color: #4a5568 !important;
  color: #cbd5e0 !important;
  border-color: #2d3748 !important;
}
.dark-theme .table td, .dark-theme .table th {
  background-color: #4a5568 !important;
  color: #cbd5e0 !important;
}
.dark-theme .table-striped tbody tr:nth-of-type(odd) {
  background-color: #3b4252 !important;
}
.dark-theme .table-striped tbody tr:nth-of-type(even) {
  background-color: #434c5e !important;
}
.dark-theme .table-bordered td, .dark-theme .table-bordered th {
  border-color: #2d3748 !important;
}
.dark-theme .thead-dark {
  background-color: #2d3748 !important;
  color: #cbd5e0 !important;
}
.dark-theme .input-group-text, 
.dark-theme .form-control {
  background-color: #4a5568 !important;
  color: #cbd5e0 !important;
  border: 1px solid #2d3748 !important;
}
.dark-theme .badge.bg-success {
  background-color: #38a169 !important;
}
.dark-theme .badge.bg-warning {
  background-color: #dd6b20 !important;
}
.dark-theme .btn-outline-primary {
  color: #63b3ed !important;
  border-color: #63b3ed !important;
}
.dark-theme .btn-outline-primary:hover {
  background-color: #63b3ed !important;
  color: white !important;
}
.dark-theme .btn-success {
  background-color: #48bb78 !important;
  color: #fff !important;
}
.dark-theme .btn-danger {
  background-color: #e53e3e !important;
  color: #fff !important;
}
.dark-theme .page-link {
  background-color: #4a5568 !important;
  color: #cbd5e0 !important;
  border-color: #2d3748 !important;
}
.pagination {
  padding: 10px 0;
}
.page-link {
  margin: 0 5px;
}
</style>
