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
justify-content: center;
align-items: center;
flex-direction: column;
height: auto;
font-family: 'Arial', sans-serif;
}

.profile-card {
width: 400px;
padding: 20px;
border: 1px solid #ccc;
border-radius: 10px;
box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
display: flex;
flex-direction: column;
align-items: center;
background-color: white;
color: black;
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
display: flex;
justify-content: space-between;
width: 100%;
margin-bottom: 20px;
}

.form-group {
display: flex;
flex-direction: column;
width: 48%;
}

input {
width: 100%;
padding: 5px;
border: 1px solid #ccc;
border-radius: 5px;
margin-top: 5px;
}

.edit-button {
background-color: #0066ff;
color: white;
border: none;
padding: 10px 20px;
border-radius: 5px;
cursor: pointer;
margin-top: 20px;
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
