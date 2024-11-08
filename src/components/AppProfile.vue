<template>
  <div :class="['profile-container', theme]">
    <h1>Hola {{ profile.name }}</h1>
    <div class="profile-card">
      <div class="profile-img-container">
        <img class="profile-img" src="../assets/user.png" alt="Profile picture" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="fullName">Nombre Completo</label>
          <input v-model="profile.name" id="fullName" type="text" placeholder="Ingresa tu nombre completo" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input v-model="profile.password" id="password" type="text" placeholder="Ingresa tu contraseña" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue';
import studentService from '/services/student';

export default {
  setup() {
    const profile = reactive({
      name: '',
      password: '',
    });

    const theme = localStorage.getItem('theme') || 'light';

    const getStudentById = async (studentId) => {
      try {
        const response = await studentService.getStudentById(studentId);
        if (response.data && response.data.error === false) {
          profile.name = response.data.data.name;
          profile.password = response.data.data.password;
        } else {
          console.error('Error al obtener los datos del estudiante:', response.data.message);
        }
      } catch (error) {
        console.error('Hubo un error al obtener los datos del estudiante:', error);
      }
    };

    onMounted(() => {
      const studentId = localStorage.getItem('studentId');
      if (studentId) {
        getStudentById(studentId);
      }
    });

    return { profile, theme };
  },
  mounted() {
    document.body.classList.toggle('dark-theme', this.theme === 'dark');
  },
};
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: 'Arial', sans-serif;
  color: #333;
}

h1 {
  font-size: 2rem;
  color: #0066ff;
  margin-bottom: 20px;
}

.profile-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
}

.profile-img-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.form-row {
  width: 100%;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 15px;
}

label {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 5px;
}

input {
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #0066ff;
  outline: none;
}

.edit-button {
  background-color: #0066ff;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.edit-button:hover {
  background-color: #0055cc;
}

.dark-theme .profile-card {
  background-color: #2c2c2c;
  color: #ddd;
  border: 1px solid #444;
}

.dark-theme input {
  background-color: #3c3c3c;
  color: #ddd;
  border: 1px solid #555;
}

.dark-theme .edit-button {
  background-color: #007efe;
}

.dark-theme .edit-button:hover {
  background-color: #0055cc;
}
</style>
