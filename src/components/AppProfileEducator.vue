<template>
  <div :class="['profile-container', theme]">
    <h1>Hola {{ profile.name }}</h1>
    <div class="profile-card">
      <div class="profile-img-container">
        <img class="profile-img" src="../assets/user.png" alt="Profile picture" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="name">Nombre Completo</label>
          <input v-model="profile.name" id="name" type="text" />
        </div>
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input v-model="profile.email" id="email" type="email" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input v-model="profile.password" id="password" type="text" />
        </div>
      </div>
      <button class="edit-button" @click="saveProfile">Guardar</button>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import educatorService from '/services/educator'; 
import { onMounted } from 'vue';

export default {
setup() {
  const profile = reactive({
    name: '',
    email: '',
    password: '',
  });

  const theme = localStorage.getItem('theme') || 'light';
  const educatorId = localStorage.getItem('id');

  const fetchProfile = async () => {
    try {
      const response = await educatorService.getEducatorById(educatorId);
      const data = response.data.data;
      profile.name = data.name;
      profile.email = data.email;
      profile.password = data.password;
    } catch (error) {
      console.error('Error al cargar los datos del educador:', error);
    }
  };

  const saveProfile = async () => {
    try {
      const updatedData = {
        name: profile.name,
        email: profile.email,
        password: profile.password,
      };
      await educatorService.updateEducator(educatorId, updatedData);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  onMounted(fetchProfile);

  return { profile, theme, saveProfile };
},
mounted() {
  document.body.classList.toggle('dark-theme', this.theme === 'dark');
}
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
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 18px;
  margin-bottom: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

label {
  font-size: 0.96rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #334155;
}

input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dbe6ff;
  border-radius: 12px;
  margin-top: 0;
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
  border-radius: 12px;
  cursor: pointer;
  margin-top: 10px;
  width: 100%;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.edit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.28);
}

.dark-theme .profile-container {
  background: #313131;
}

.dark-theme .profile-card {
  background: rgba(30, 41, 59, 0.9);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 18px 40px rgba(2, 6, 23, 0.38);
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
