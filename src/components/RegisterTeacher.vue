<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Registrarte</h2>
      <form @submit.prevent="register">
        <div class="input-box">
          <label for="name">Nombre Completo</label>
          <input
            type="text"
            id="name"
            v-model="name"
            placeholder="Ingresa su nombre completo"
            required
          />
        </div>
        <div class="input-box">
          <label for="email">Correo</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Ingresa tu correo"
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
        <div class="input-box">
          <label for="confirmPassword">Repite la contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Ingresa la contraseña nuevamente"
            required
          />
        </div>
        <div class="login-link">
          <p>¿Ya tienes una cuenta? <router-link to="/">Inicia Sesión</router-link></p>
        </div>
        <button type="submit">Crear cuenta</button>
      </form>
    </div>
  </div>
</template>

<script>
import auth from '/services/auth';

export default {
  data() {
    return {
      name: '', 
      email: '',
      password: '',
      confirmPassword: '', // Este campo se mantiene solo para validación
    };
  },
  methods: {
    register() {
      // Validación de contraseñas
      if (this.password !== this.confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }

      // Solo enviamos los datos necesarios al backend
      const educatorData = {
        name: this.name, // Cambiado aquí también
        email: this.email,
        password: this.password,
      };

      auth.registerEducator(educatorData)
        .then(response => {
          console.log('Registro exitoso:', response);
          // Aquí puedes redirigir al usuario o mostrar un mensaje de éxito
        })
        .catch(error => {
          console.error('Error en el registro:', error);
          alert('Ocurrió un error al registrar al educador.'); // Puedes personalizar el mensaje
        });
    },
  },
};
</script>
  
  <style scoped>
  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #d2e1f9;
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
    color: #007efe;
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
  </style>
  