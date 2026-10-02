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
  min-height: 100vh;
  background-color: #dfeafc;
  padding: 24px;
}

.login-box {
  width: min(100%, 650px);
  background: rgba(255, 255, 255, 0.78);
  border-radius: 30px;
  padding: 36px 52px 30px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.5);
  text-align: center;
}

h2 {
  margin: 0 0 28px;
  color: #1d4ed8;
  font-size: clamp(2.2rem, 3vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin: 0 auto 28px;
  background: #edf3ff;
  border-radius: 16px;
  padding: 8px;
  width: 100%;
  max-width: 400px;
}

.tabs button {
  flex: 1;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #1d4ed8;
  font-size: 1.05rem;
  font-weight: 600;
  padding: 16px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tabs button.active {
  background: linear-gradient(180deg, #1f6fe5 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(29, 78, 216, 0.2);
}

form {
  margin-top: 12px;
}

.input-box {
  margin-bottom: 22px;
  text-align: left;
}

.input-box label {
  display: block;
  margin-bottom: 8px;
  color: #1d4ed8;
  font-size: 1.1rem;
  font-weight: 700;
}

.input-box input {
  width: 100%;
  height: 54px;
  border: 2px solid rgba(59, 130, 246, 0.45);
  border-radius: 12px;
  background: rgba(255,255,255,0.3);
  padding: 0 16px;
  font-size: 1rem;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-box input::placeholder {
  color: #8ea4c7;
}

.input-box input:focus {
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12);
}

.register-link {
  margin: 6px 0 18px;
  text-align: left;
}

.register-link p {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.register-link a {
  color: #1d4ed8;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}

button[type='submit'] {
  width: 100%;
  background: linear-gradient(180deg, #1f6fe5 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 18px;
  padding: 18px 20px;
  font-size: 1.15rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(29, 78, 216, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button[type='submit']:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 22px rgba(29, 78, 216, 0.24);
}
</style>
