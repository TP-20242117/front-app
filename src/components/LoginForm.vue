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
import auth from '/services/auth';
import studentService from '/services/student';
import evaluationService from '/services/evaluation';

export default {
  data() {
    return {
      username: '',
      password: '',
      role: 'alumno',
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      try {
        let response;
        if (this.role === 'profesor') {
          response = await auth.loginEducator({
            email: this.username,
            password: this.password
          });
        } else {
          response = await auth.loginStudent({
            username: this.username,
            password: this.password
          });
          
          if (response.data && response.data.error) {
            throw new Error(response.data.message);
          }
          
          const studentsResponse = await studentService.getAllStudents();
          if (studentsResponse.data && Array.isArray(studentsResponse.data.data)) {
            const student = studentsResponse.data.data.find(student =>
              student.name.toLowerCase() === this.username.toLowerCase()
            );
            
            if (student) {
              localStorage.setItem('studentId', student.id);
              localStorage.setItem('evaluationUpdateDone', 'false');
              console.log('ID del estudiante guardado en localStorage:', student.id);

              const evaluationId = await this.getEvaluationId(student.id);

              if (!evaluationId) {
                await this.createEvaluationOnLogin(student.id);
              } else {
                localStorage.setItem('evaluationId', evaluationId);
                console.log('ID de la evaluación guardado en localStorage:', evaluationId);
              }

              this.$router.push({ name: '/Tests' });
            } else {
              this.errorMessage = 'No se encontró un estudiante con ese nombre.';
            }
          } else {
            this.errorMessage = 'Error al obtener la lista de estudiantes.';
          }
        }
        
        this.errorMessage = '';
        if (this.role === 'profesor') {
          this.$router.push({ name: 'salones' });
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        if (error.response && error.response.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
        } else if (error.message) {
          this.errorMessage = error.message || 'Credenciales incorrectas. Inténtalo de nuevo.';
        } else {
          this.errorMessage = 'Ocurrió un error al iniciar sesión. Inténtalo más tarde.';
        }
      }
    },

    async getEvaluationId(studentId) {
      try {
        const response = await evaluationService.getAllEvaluations();
        if (response.data.data && Array.isArray(response.data.data)) {
          const evaluation = response.data.data.find(evaluation => evaluation.studentId === studentId);
          return evaluation ? evaluation.id : null;
        }
        return null;
      } catch (error) {
        console.error("Error al obtener las evaluaciones:", error);
        return null;
      }
    },

    async createEvaluationOnLogin(studentId) {
      const evaluationData = {
        type: "in progress",
        date: new Date().toISOString(),
        duration: 180,
        studentId: studentId
      };

      try {
        const evaluationResponse = await evaluationService.createEvaluation(evaluationData);
        console.log("Evaluación creada:", evaluationResponse);
        localStorage.setItem('evaluationId', evaluationResponse.data.data.id);
        console.log('ID de la evaluación guardado en localStorage:', evaluationResponse.data.data.id);
      } catch (error) {
        console.error("Error al crear la evaluación:", error);
      }
    },

    goToRegister() {
      if (this.role === 'profesor') {
        this.$router.push({ name: 'register-teacher' });
      } else {
        this.$router.push({ name: 'register' });
      }
    }
  }
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

.error-message {
  color: red;
  margin-bottom: 10px;
}
</style>
