<template>
  <div :class="['profile-container', theme]">
    <h1>Hola Jonatan</h1>
    <div class="profile-card">
      <div class="profile-img-container">
        <img class="profile-img" src="../assets/user.png" alt="Profile picture" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="fullName">Nombre Completo</label>
          <input v-model="profile.fullName" id="fullName" type="text" />
        </div>
        <div class="form-group">
          <label for="phone">Número</label>
          <input v-model="profile.phone" id="phone" type="text" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="gender">Género</label>
          <input v-model="profile.gender" id="gender" type="text" />
        </div>
        <div class="form-group">
          <label for="age">Edad</label>
          <input v-model="profile.age" id="age" type="text" />
        </div>
      </div>
      <button class="edit-button">Guardar</button>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';

export default {
  setup() {
    const profile = reactive({
      fullName: 'Enrique Aldhair',
      phone: '939498334',
      gender: 'M',
      age: '20'
    });


    const theme = localStorage.getItem('theme') || 'light';
    
    return { profile, theme };
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
  height: 80vh;
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
