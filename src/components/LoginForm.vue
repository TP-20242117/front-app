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

        <div class="register-link" v-if="role === 'profesor'">
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
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      username: '',
      password: '',
      role: 'alumno',
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    async login() {
      try {
        let response;
        if (this.role === 'profesor') {
          response = await auth.loginEducator({
            email: this.username,
            password: this.password,
          });

          if (response.data && response.data.error) {
            console.error('Error al iniciar sesión como profesor:', response.data.message);
            this.toast.error('Credenciales incorrectas');
            return;
          }
          localStorage.setItem('loginSuccessToast', 'true');
          localStorage.setItem('email',this.username)
          this.$router.push({ name: 'salones' });
        } else {
          response = await auth.loginStudent({
            username: this.username,
            password: this.password,
          });

          if (response.data && response.data.error) {
            console.error('Error al iniciar sesión como alumno:', response.data.message);
            this.toast.error('Credenciales incorrectas');
            return;
          }

          const studentsResponse = await studentService.getAllStudents();
          if (studentsResponse.data && Array.isArray(studentsResponse.data.data)) {
            const student = studentsResponse.data.data.find(
              (student) => student.name.toLowerCase() === this.username.toLowerCase()
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
              localStorage.setItem('loginSuccessToast', 'true');
              this.$router.push({ name: '/Tests' });
            } else {
              this.toast.error('Credenciales incorrectas');
            }
          } else {
            this.toast.error('Error al obtener la lista de estudiantes');
          }
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.toast.error('Credenciales incorrectas');
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
        localStorage.setItem('evaluationId', evaluationResponse.data.data.id);
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
  font-weight: bold;
  color: #007efe;
}

.input-box input {
  width: 100%;
  padding: 10px;
  border: 1px solid #007efe;
  border-radius: 5px;
}

.register-link a {
  color: #007efe;
  cursor: pointer;
}

button {
  background-color: #007efe;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}
</style>
