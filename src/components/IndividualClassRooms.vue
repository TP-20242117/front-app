<template>
  <div :class="['main-content', theme]">
    <h2>{{ students.length > 0 ? 'Lista de Estudiantes' : 'Cargar Excel de Estudiantes' }}</h2>
    
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
    };
  },
  methods: {
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
            password: student['Clave Alumno'],
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
          this.students = [];
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 60vh;
}

h2 {
  margin-bottom: 20px;
}

input[type="file"] {
  margin-bottom: 20px;
}

.students-list {
  margin-top: 20px;
}

.students-list h3 {
  margin-bottom: 10px;
}

.students-list ul {
  list-style-type: none;
  padding: 0;
}

.student-item {
  margin: 5px 0;
  padding: 10px;
  background-color: #e8f0fe;
  border: 1px solid #c1d3fc;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
}

.student-name {
  font-weight: bold;
}

.student-password {
  color: #ff4d4d;
}

.student-age,
.student-classroom {
  font-style: italic;
}
</style>
