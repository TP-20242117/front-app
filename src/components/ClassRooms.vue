<template>
  <div :class="['main-content', theme]">
    <h2>Cargar Salones</h2>
    
    <form @submit.prevent="addClassroom">
      <input type="text" v-model="newClassroom.name" placeholder="Nombre del Salón" required />
      <button type="submit">Agregar Salón</button>
    </form>

    <div v-if="classrooms.length > 0" class="classrooms-list">
      <h3>Lista de Salones</h3>
      <div class="classrooms-grid">
        <router-link
          v-for="(classroom, index) in classrooms"
          :key="index"
          :to="`/salon/${classroom.name}`"  
          class="classroom-card"
        >
          <img :src="classroom.image" alt="Salón" />
          <p class="classroom-name">{{ classroom.name }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import classroomService from '/services/classrooms';

export default {
  data() {
    return {
      classrooms: [],
      newClassroom: {
        name: '',
      },
      defaultImage: require('../assets/salon.jpg'),
      theme: localStorage.getItem('theme') || 'light',
    };
  },
  created() {
    this.fetchClassrooms();
  },
  methods: {
    async fetchClassrooms() {
      try {
        const response = await classroomService.getAllClassrooms();
      
        const classroomsData = response.data.data;
      
        if (!response.data.error && Array.isArray(classroomsData)) {
          const educatorId = localStorage.getItem('id');
        
          this.classrooms = classroomsData
            .filter(classroom => classroom.educatorId === parseInt(educatorId))
            .map(classroom => ({
              ...classroom,
              image: this.defaultImage
            }));
        } else {
          console.error('Error al cargar los salones:', response.data.message || 'Respuesta no válida');
        }
      } catch (error) {
        console.error('Error al cargar los salones:', error);
      }
    },

    async addClassroom() {
      if (this.newClassroom.name) {
        const educatorId = localStorage.getItem('id');
        const classroomData = {
          name: this.newClassroom.name,
          educatorId: educatorId ? parseInt(educatorId) : null,
        };
      
        try {
          const response = await classroomService.createClassroom(classroomData);
        
          if (response && !response.error) {
            this.classrooms.push({ 
              name: this.newClassroom.name, 
              image: this.defaultImage 
            });
            this.newClassroom.name = '';
          } else {
            console.error('Error al agregar el salón:', response.message || 'Error desconocido');
          }
        } catch (error) {
          console.error('Error al agregar el salón:', error.response ? error.response.data : error.message);
        }
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
  height: auto;
}

h2 {
  margin-bottom: 20px;
}

form {
  margin-bottom: 20px;
}

input {
  margin-right: 10px;
  margin-bottom: 10px;
}

button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.classrooms-list {
  margin-top: 20px;
}

.classrooms-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.classroom-card {
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 200px;
  text-align: center;
  text-decoration: none;
  color: inherit;
}

.classroom-card img {
  max-width: 100%;
  border-radius: 5px;
  margin-bottom: 10px;
}

.classroom-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.dark-theme .main-content {
  background-color: #121212;
  color: white;
}

.dark-theme .classroom-card {
  background-color: #273852;
  color: #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dark-theme button {
  background-color: #007bff;
}

.dark-theme button:hover {
  background-color: #0056b3;
}
</style>
