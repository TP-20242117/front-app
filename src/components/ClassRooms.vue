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
import { useToast } from 'vue-toastification';

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
    const toast = useToast();
    if (localStorage.getItem('loginSuccessToast') === 'true') {
      toast('Inicio de sesión correcto', {
        type: 'success',
        timeout: 1000, 
      });

      localStorage.removeItem('loginSuccessToast');
    }
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
  padding: 28px 28px 40px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 76px);
  color: #1f2937;
  transition: background-color 0.3s ease, color 0.3s ease;
}

h2 {
  margin: 0 0 18px;
  font-size: clamp(2rem, 2vw + 1rem, 2.5rem);
  line-height: 1.2;
  font-weight: 600;
  color: #1f2937;
}

form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 0 0 24px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(6px);
}

h3 {
  margin: 0 0 18px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
}

input {
  flex: 1 1 260px;
  max-width: 420px;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid #dbe3f0;
  background: #f8fbff;
  color: #1f2937;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, color 0.3s ease;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.dark-theme input::placeholder {
  color: #cbd5e1;
}

input::placeholder {
  color: #64748b;
}

.dark-theme input {
  background-color: rgba(15, 23, 42, 0.7);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.22);
}

input {
  background-color: #fff;
  color: black;
  border: 1px solid #ccc;
}

button {
  min-height: 48px;
  padding: 12px 22px;
  background: linear-gradient(180deg, #1f6fe5 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 12px 22px rgba(29, 78, 216, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(29, 78, 216, 0.24);
  filter: brightness(1.02);
}

.classrooms-list {
  margin-top: 8px;
}

.classrooms-grid {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
}

.classroom-card {
  background: rgba(255, 255, 255, 0.85);
  padding: 14px 14px 18px;
  border-radius: 22px;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
  width: 220px;
  text-align: center;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.classroom-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 36px rgba(30, 64, 175, 0.12);
  border-color: rgba(59, 130, 246, 0.3);
}

.classroom-card img {
  max-width: 100%;
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
}

.classroom-name {
  font-weight: 600;
  margin: 0;
  color: #1e293b;
  font-size: 1.05rem;
}

.dark-theme .main-content {
  background-color: #121212;
  color: #f8fafc;
}

.dark-theme h2,
.dark-theme h3,
.dark-theme .classroom-name {
  color: #f8fafc;
}

.dark-theme form {
  background: rgba(49, 49, 49, 0.8);
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 30px rgba(2, 6, 23, 0.2);
}

.dark-theme h3 {
  color: #e2e8f0;
}

.dark-theme .classroom-card {
  background: rgba(49, 49, 49, 0.9);
  border-color: rgba(148, 163, 184, 0.12);
  box-shadow: 0 16px 34px rgba(2, 6, 23, 0.28);
}

.dark-theme .classroom-card:hover {
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.18);
}

.dark-theme button {
  background: linear-gradient(180deg, #2b7de9 0%, #1d4ed8 100%);
}

.dark-theme button:hover {
  filter: brightness(1.05);
}

.vue-toastification-container {
  z-index: 10000 !important;
}
</style>
