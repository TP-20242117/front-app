<template>
    <div :class="['main-content', theme]">
      <h2>Cargar Excel de Estudiantes</h2>
      <input
        type="file"
        @change="handleFileUpload"
        accept=".xlsx, .xls"
        ref="fileInput"
        :disabled="students.length > 0"
      />
      <div v-if="students.length > 0" class="students-list">
        <h3>Lista de Estudiantes</h3>
        <ul>
          <li v-for="(student, index) in students" :key="index">
            {{ student.name }} - {{ student.password }} - {{ student.classroom }} - {{ student.age }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import * as XLSX from 'xlsx';
  
  export default {
    data() {
      return {
        students: [],
        theme: localStorage.getItem('theme') || 'light',
      };
    },
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        const expectedClassroom = this.$route.params.name;
  
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
  
            // Comprobar si todos los salones son iguales
            const classrooms = json.map(student => student.Salon);
            const uniqueClassrooms = new Set(classrooms);
  
            // Verificar que hay solo un salón y que coincide con el salón esperado
            if (uniqueClassrooms.size > 1) {
              alert('El archivo contiene estudiantes de diferentes salones. Por favor, cargue un archivo con estudiantes de un solo salón.');
              return;
            } else if (!uniqueClassrooms.has(expectedClassroom)) {
              alert(`El salón en el archivo (${Array.from(uniqueClassrooms).join(', ')}) no coincide con el salón esperado: ${expectedClassroom}.`);
              return;
            }
  
            // Asignar los datos procesados a la lista de estudiantes
            this.students = json.map(student => ({
              name: student.Alumno,
              password: student['Clave Alumno'],
              classroom: student.Salon,
              age: student.Edad
            }));
  
            // Mostrar el arreglo en la consola
            console.log(this.students);
  
            // Restablecer el campo de entrada
            this.$refs.fileInput.value = '';
          };
          reader.readAsArrayBuffer(file);
        }
      },
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
  
  .students-list li {
    margin: 5px 0;
    padding: 10px;
    background-color: #f1f1f1;
    border-radius: 5px;
  }
  </style>
  