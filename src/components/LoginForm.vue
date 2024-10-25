<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Iniciar Sesión</h2>
      <div class="tabs">
        <button
          :class="{ active: role === 'alumno' }"
          @click="role = 'alumno'"
        >
          Alumno
        </button>
        <button
          :class="{ active: role === 'profesor' }"
          @click="role = 'profesor'"
        >
          Profesor
        </button>
      </div>
      <form @submit.prevent="login">
        <div class="input-box">
          <label :for="role === 'profesor' ? 'email' : 'username'">
            {{ role === 'profesor' ? 'Email' : 'Nombre' }}
          </label>
          <input
            :type="role === 'profesor' ? 'email' : 'text'"
            :id="role === 'profesor' ? 'email' : 'username'"
            v-model="username"
            :placeholder="role === 'profesor' ? 'Ingresa tu email' : 'Ingresa tu nombre'"
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
        <div class="register-link">
          <p>
            ¿No tienes una cuenta?
            <a @click.prevent="goToRegister">Regístrate</a>
          </p>
        </div>
        <button type="submit">Inicia Sesión</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      role: 'alumno',
    };
  },
  methods: {
    login() {
      if (this.role === 'profesor') {
        this.$router.push({ name: 'salones' });
      } else{
        console.log('Nombre o Email:', this.username, 'Contraseña:', this.password, 'Rol:', this.role);
        this.$router.push({ name: '/Tests' });
      }
      
    },
    goToRegister() {
      if (this.role === 'profesor') {
        this.$router.push({ name: 'register-teacher' });
      } else {
        this.$router.push({ name: 'register' });
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #d2e1f9;
}

.login-box {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h2 {
  color: #007efe;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tabs button {
  background-color: #f0f0f0;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-bottom: 3px solid transparent;
  color: #333;
  transition: 0.3s;
  margin: 0 10px;
}

.tabs button:hover {
  background-color: #e0e0e0;
}

.tabs button.active {
  background-color: #007efe;
  border-bottom: 3px solid #005bb5;
  color: white;
}

.input-box {
  margin-bottom: 20px;
  text-align: left;
}

.input-box label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #007efe;
}

.input-box input {
  width: 100%;
  padding: 10px;
  border: 1px solid #007efe;
  border-radius: 5px;
  outline: none;
}

.input-box input:focus {
  border-color: #005bb5;
}

.register-link {
  margin-bottom: 20px;
}

.register-link a {
  color: #007efe;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

button {
  background-color: #007efe;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #005bb5;
}
</style>
