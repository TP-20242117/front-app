<template>
  <div :class="['main-content', theme]">
    <h2>
      {{ students.length > 0 ? 'Lista de Estudiantes' : 'Cargar Excel de Estudiantes' }}
      <span 
        v-if="students.length === 0" 
        class="question-icon" 
        @mouseenter="openModal"  
        title="¿Cómo cargar un Excel?">
        ?
      </span>
    </h2>
    
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>Ejemplo de Contenido del Excel</h2>
        <img src="../assets/excel.png" alt="Instrucciones para cargar Excel" />
        <button class="close-modal" @click="closeModal">Cerrar</button>
      </div>
    </div>

    <input
      type="file"
      @change="handleFileUpload"
      accept=".xlsx, .xls"
      ref="fileInput"
      v-if="students.length === 0"
    >

    <div v-if="students.length > 0" class="students-list">
      <ul>
        <li v-for="(student, index) in students" :key="index" class="student-item">
          <span class="student-name">{{ student.name }}</span>
          <span class="student-password"> - Contraseña: {{ student.password }}</span>
          <span class="student-age"> - Edad: {{ student.age }}</span>
          <span class="student-classroom" v-if="student.classroom"> - Salón: {{ student.classroom }}</span>
        </li>
      </ul>
      <button v-if="isExcelUploaded" @click="uploadStudents">Cargar Estudiantes</button>
    </div>
    
    <div v-if="students.length === 0 && studentsExist">
      <p>No hay estudiantes en este salón.</p>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import studentService from '/services/student';
import classRoomsService from '/services/classrooms';

export default {
  data() {
    return {
      students: [],
      studentsExist: false,
      theme: localStorage.getItem('theme') || 'light',
      expectedClassroomName: '',
      isExcelUploaded: false,
      isModalOpen: false,
    };
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    
    async fetchClassrooms() {
      const educatorId = localStorage.getItem('id');
      try {
        const response = await classRoomsService.getClassroomsByEducator(educatorId);
        if (response && response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        } else {
          console.warn('No se encontraron salones o la estructura de respuesta es incorrecta.');
          return [];
        }
      } catch (error) {
        console.error('Error al obtener los salones:', error);
        return [];
      }
    },

    async checkExistingStudents(salonId) {
      try {
        const response = await studentService.getStudentsBySalonId(salonId);
        if (response.error) {
          throw new Error(response.message);
        }

        const studentsData = response.data.data || [];
        this.studentsExist = studentsData.length > 0;

        this.students = studentsData.map(student => ({
          name: student.name,
          password: student.password,
          classroom: '',
          age: student.age
        }));
      } catch (error) {
        console.error('Error al verificar estudiantes existentes:', error);
      }
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      const expectedClassroom = this.$route.params.name;
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          const classrooms = json.map(student => student.Salon);
          const uniqueClassrooms = new Set(classrooms);

          if (uniqueClassrooms.size > 1) {
            alert('El archivo contiene estudiantes de diferentes salones. Por favor, cargue un archivo con estudiantes de un solo salón.');
            return;
          } else if (!uniqueClassrooms.has(expectedClassroom)) {
            alert(`El salón en el archivo (${Array.from(uniqueClassrooms).join(', ')}) no coincide con el salón esperado: ${expectedClassroom}.`);
            return;
          }

          this.students = json.map(student => ({
            name: student.Alumno,
            password: String(student['Clave Alumno']),
            classroom: student.Salon,
            age: student.Edad
          }));

          this.isExcelUploaded = true;
          this.$refs.fileInput.value = '';
        };
        reader.readAsArrayBuffer(file);
      }
    },

    async uploadStudents() {
      try {
        const classrooms = await this.fetchClassrooms();
        const expectedClassroomName = this.$route.params.name;
        this.expectedClassroomName = expectedClassroomName;
        const matchingClassrooms = classrooms.filter(classroom => classroom.name === expectedClassroomName);

        if (matchingClassrooms.length > 0) {
          const salonId = matchingClassrooms[0].id;
          const studentsToUpload = this.students.filter(student => student.classroom === expectedClassroomName);

          if (studentsToUpload.length === 0) {
            alert('No hay estudiantes con el salón correspondiente para cargar.');
            return;
          }

          for (const student of studentsToUpload) {
            await studentService.createStudent({
              name: student.name,
              password: student.password,
              age: student.age,
              salonId: salonId
            });
          }
          alert('Estudiantes cargados exitosamente');
          await this.checkExistingStudents(salonId);
          this.isExcelUploaded = false;
        } else {
          alert('No se encontró el salón correspondiente.');
        }
      } catch (error) {
        console.error('Error al cargar los estudiantes:', error);
        alert('Error al cargar los estudiantes. Por favor, intenta de nuevo.');
      }
    },
  },

  async mounted() {
    const classrooms = await this.fetchClassrooms();
    const expectedClassroomName = this.$route.params.name;

    if (Array.isArray(classrooms)) {
      const matchingClassrooms = classrooms.filter(classroom => classroom.name === expectedClassroomName);
      if (matchingClassrooms.length > 0) {
        const salonId = matchingClassrooms[0].id;
        await this.checkExistingStudents(salonId);
      } else {
        console.warn('No se encontró el salón correspondiente en la base de datos.');
      }
    } else {
      console.warn('No se pudieron obtener salones.');
    }
  },
};
</script>

<style scoped>
.main-content {
  padding: 28px;
  display: flex;
  flex-direction: column;
  min-height: 60vh;
  color: #1f2937;
}

h2 {
  margin: 0 0 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
  line-height: 1.25;
  font-weight: 500;
  color: #1f2937;
}

.question-icon {
  display: inline-flex;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: 50%;
  background: #eff6ff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  color: #2563eb;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.question-icon:hover {
  background: #dbeafe;
  color: #1d4ed8;
  transform: translateY(-1px);
}

input[type="file"] {
  width: min(100%, 680px);
  box-sizing: border-box;
  padding: 14px;
  border: 1px dashed #a8bddb;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.58);
  color: #475569;
  margin-bottom: 20px;
}

input[type="file"]::file-selector-button {
  margin-right: 14px;
  padding: 9px 14px;
  border: 0;
  border-radius: 10px;
  background: #e7efff;
  color: #1d4ed8;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

input[type="file"]::file-selector-button:hover {
  background: #d6e4ff;
}

.students-list {
  margin-top: 8px;
}

.students-list h3 {
  margin: 0 0 14px;
  font-size: 1.15rem;
  font-weight: 500;
  color: #334155;
}

.students-list ul {
  display: grid;
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.student-item {
  display: grid;
  grid-template-columns: minmax(150px, 1.4fr) repeat(auto-fit, minmax(130px, 1fr));
  align-items: center;
  gap: 8px 16px;
  margin: 0;
  padding: 14px 16px;
  border: 1px solid #dbe6f7;
  border-radius: 14px;
  background: rgba(239, 246, 255, 0.75);
  color: #334155;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.dark-theme .student-item {
  background: rgba(49, 49, 49, 0.82);
  border-color: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.student-name {
  color: #1e293b;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.student-password {
  color: #b4534b;
  overflow-wrap: anywhere;
}

.student-age,
.student-classroom {
  color: #64748b;
  overflow-wrap: anywhere;
}

.dark-theme h2,
.dark-theme .students-list h3,
.dark-theme .student-name {
  color: #f1f5f9;
}

.dark-theme input[type="file"] {
  background: rgba(49, 49, 49, 0.68);
  border-color: rgba(148, 163, 184, 0.28);
  color: #cbd5e1;
}

.dark-theme input[type="file"]::file-selector-button {
  background: rgba(59, 130, 246, 0.18);
  color: #bfdbfe;
}

.dark-theme input[type="file"]::file-selector-button:hover {
  background: rgba(59, 130, 246, 0.28);
}

.dark-theme .question-icon {
  background: rgba(59, 130, 246, 0.14);
  border-color: rgba(96, 165, 250, 0.35);
  color: #93c5fd;
}

.dark-theme .question-icon:hover {
  background: rgba(59, 130, 246, 0.24);
  color: #bfdbfe;
}

.dark-theme .student-password {
  color: #fca5a5;
}

.dark-theme .student-age,
.dark-theme .student-classroom {
  color: #cbd5e1;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  padding: 20px;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #f8fafc;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  text-align: center;
  width: min(520px, 100%);
  box-sizing: border-box;
  color: #1f2937;
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.3);
}

.modal-content h2 {
  justify-content: center;
  margin: 0 0 18px;
  font-size: 1.35rem;
  font-weight: 500;
}

.dark-theme .modal-content {
  background: #313131;
  border-color: rgba(148, 163, 184, 0.18);
  color: #f8fafc;
}

.dark-theme .modal-content h2 {
  color: #f8fafc;
}

.modal-content img {
  width: 100%;
  height: auto;
  margin-bottom: 18px;
  border-radius: 10px;
}

.close-modal {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.close-modal:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .main-content {
    padding: 22px 16px;
  }

  h2 {
    font-size: 1.5rem;
  }

  .student-item {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }

  .modal-content {
    padding: 18px;
  }
}
</style>
