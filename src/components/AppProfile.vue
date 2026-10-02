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
  align-items: center;
  flex-direction: column;
  min-height: 100%;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  font-family: 'Arial', sans-serif;
  color: #1e293b;
  padding: 40px 20px 60px;
}

h1 {
  font-size: clamp(2.2rem, 2.6vw, 2.8rem);
  color: #1d4ed8;
  margin: 0 0 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.profile-card {
  width: 100%;
  max-width: 490px;
  padding: 32px 28px 24px;
  border-radius: 26px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.10);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.profile-img-container {
  display: flex;
  justify-content: center;
  margin-bottom: 22px;
  padding: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(191, 219, 254, 0.9), rgba(219, 234, 254, 0.7));
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.18);
}

.profile-img {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
}

.form-row {
  width: 100%;
  margin-bottom: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;
}

label {
  font-size: 0.96rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #334155;
}

input {
  padding: 12px 14px;
  font-size: 1rem;
  border: 1px solid #dbe6ff;
  border-radius: 12px;
  width: 100%;
  background: #f8fbff;
  color: #1f2937;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.edit-button {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  margin-top: 8px;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.25);
}

.edit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.28);
}

.dark-theme .profile-container {
  background: #313131;
}

.dark-theme .profile-card {
  background: #313131;
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 18px 40px rgba(15, 17, 20, 0.32);
}

.dark-theme label {
  color: #e2e8f0;
}

.dark-theme input {
  background: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.dark-theme .edit-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
</style>
