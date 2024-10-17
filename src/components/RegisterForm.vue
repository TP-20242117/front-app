<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Registrarte</h2>
      <form @submit.prevent="register">
        <div class="input-box">
          <label for="fullname">Nombre Completo</label>
          <input
            type="text"
            id="fullname"
            v-model="fullname"
            placeholder="Ingresa tu nombre completo"
            required
          />
        </div>

        <div class="input-box">
          <label for="gender">Género</label>
          <select id="gender" v-model="gender" required>
            <option disabled value="">Selecciona tu género</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="otro">Otro</option>
            <option value="no-especificar">Prefiero no decirlo</option>
          </select>
        </div>

        <div class="input-box">
          <label for="birthdate">Fecha de Nacimiento</label>
          <input
            type="date"
            id="birthdate"
            v-model="birthdate"
            required
          />
        </div>

        <div class="input-box">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>

        <div class="login-link">
          <p>
            ¿Ya tienes una cuenta? 
            <router-link to="/">Inicia Sesión</router-link>
          </p>
        </div>

        <button type="submit">Crear cuenta</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      fullname: '',
      gender: '',
      birthdate: '',
      password: ''
    };
  },
  methods: {
    register() {
      console.log('Nombre Completo:', this.fullname, 'Género:', this.gender, 'Fecha de Nacimiento:', this.birthdate, 'Contraseña:', this.password);
    }
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #D2E1F9;
}

.register-box {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  width: 400px;
}

h2 {
  color: #007EFE;
  margin-bottom: 20px;
}

.input-box {
  margin-bottom: 20px;
  text-align: left;
}

.input-box label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #007EFE;
}

.input-box input, .input-box select {
  width: 100%;
  padding: 10px;
  border: 1px solid #007EFE;
  border-radius: 5px;
  outline: none;
}

.input-box input:focus, .input-box select:focus {
  border-color: #007EFE;
}

.login-link {
  margin-bottom: 20px;
}

.login-link a {
  color: #007EFE;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

button {
  background-color: #007EFE;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

button:hover {
  background-color: #005bb5;
}
</style>
