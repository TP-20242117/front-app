<template>
  <div :class="['main-content', theme]">
    <h2>Mis Pruebas</h2>
    <div class="tests-container">
      <div class="tests-grid">
        <div
          v-for="test in tests"
          :key="test.name"
          :class="['test-card', { completed: test.completed }]">
          <router-link
            v-if="!test.completed"
            :to="test.route"
            class="test-link">
            <div class="test-card-content">
              <img :src="test.image" :alt="test.name" />
              <p class="test-name">{{ test.name }}</p>
            </div>
          </router-link>
          <div v-else class="test-disabled">
            <div class="test-card-content">
              <img :src="test.image" :alt="test.name" />
              <p class="test-name">{{ test.name }} (Completada)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EvaluationServices from '/services/evaluation';
import ResultServices from '/services/result';
import PredictServices from '/services/predict';
import StudentServices from '/services/student';
import { useToast } from 'vue-toastification';

export default {
  data() {
    return {
      tests: [
        {
          name: 'Prueba de colores',
          route: '/stroop',
          image: require('../assets/Stroop_Task.png'),
          completed: false,
        },
        {
          name: 'Prueba de dirección',
          route: '/stop-signal',
          image: require('../assets/Stop_Task.png'),
          completed: false,
        },
        {
          name: 'Prueba de la letra',
          route: '/cpt',
          image: require('../assets/CPT_Task.png'),
          completed: false,
        },
      ],
      theme: localStorage.getItem('theme') || 'light',
    };
  },
  mounted() {
    const toast = useToast();
    if (localStorage.getItem('loginSuccessToast') === 'true') {
      toast('Inicio de sesión correcto', {
        type: 'success',
        timeout: 1000, 
      });

      localStorage.removeItem('loginSuccessToast');
    }
    this.loadTestStatus();
    document.body.classList.toggle('dark-theme', this.theme === 'dark');
    this.checkAndUpdateEvaluationStatus();
  },
  methods: {
    loadTestStatus() {
      this.tests.forEach((test, index) => {
        const status = localStorage.getItem(`test-${index}-completed`);
        if (status) {
          this.tests[index].completed = JSON.parse(status);
        }
      });
    },
    markTestCompleted(testIndex) {
      this.tests[testIndex].completed = true;
      localStorage.setItem(`test-${testIndex}-completed`, JSON.stringify(true));
    },
    async checkAndUpdateEvaluationStatus() {
      const evaluationId = localStorage.getItem('evaluationId');
      if (evaluationId) {
        try {
          const response = await EvaluationServices.getAllEvaluations();
          const evaluations = response.data.data;

          const evaluation = evaluations.find((e) => e.id == evaluationId);

          if (evaluation) {
            await this.checkTestResults(evaluationId);

            const allTestsCompleted = this.tests.every(test => test.completed);
            if (allTestsCompleted) {
              await this.updateEvaluationToCompleted(evaluationId);

              this.callPredictService();
            }
          }
        } catch (error) {
          console.error('Error al obtener las evaluaciones:', error);
        }
      }
    },
    async checkTestResults(evaluationId) {
      try {
        const stroopResult = await ResultServices.getStroopResultsByEvaluation(evaluationId);
        if (stroopResult.data.data && stroopResult.data.data.length > 0) {
          this.tests[0].completed = true;
          localStorage.setItem('test-0-completed', 'true');
        }

        const sstResult = await ResultServices.getSSTResultsByEvaluation(evaluationId);
        if (sstResult.data.data && sstResult.data.data.length > 0) {
          this.tests[1].completed = true;
          localStorage.setItem('test-1-completed', 'true');
        }

        const cptResult = await ResultServices.getCPTResultsByEvaluation(evaluationId);
        if (cptResult.data.data && cptResult.data.data.length > 0) {
          this.tests[2].completed = true;
          localStorage.setItem('test-2-completed', 'true');
        }
      } catch (error) {
        console.error('Error al verificar los resultados de las pruebas:', error);
      }
    },
    async updateEvaluationToCompleted(evaluationId) {
      try {
        const evaluationData = { type: 'Completo' };
        await EvaluationServices.updateEvaluation(evaluationId, evaluationData);
        console.log('Evaluación actualizada a Completado');
      } catch (error) {
        console.error('Error al actualizar la evaluación:', error);
      }
    },
    async callPredictService() {
      try {
        const studentId = localStorage.getItem('studentId');
        
        const currentStudent = await StudentServices.getStudentById(studentId);
        
        if (currentStudent.data && currentStudent.data.data.hasTdah !== null) {
          console.log('El estudiante ya tiene un valor para "hasTdah". No se enviará la predicción.');
          return;
        }
      
        const stroopResults = this.tests[0].completed ? await ResultServices.getStroopResultsByEvaluation(localStorage.getItem('evaluationId')) : [];
        const cptResults = this.tests[1].completed ? await ResultServices.getCPTResultsByEvaluation(localStorage.getItem('evaluationId')) : [];
        const sstResults = this.tests[2].completed ? await ResultServices.getSSTResultsByEvaluation(localStorage.getItem('evaluationId')) : [];
      
        const data = {
          stroopResults: stroopResults.data.data || [],
          cptResults: cptResults.data.data || [],
          sstResults: sstResults.data.data || []
        };
      
        const response = await PredictServices.predict(data);
        console.log('Resultado de la predicción:', response.data);
      
        if (response.data && response.data.hasTdah !== undefined) {
          const studentData = {
            hasTdah: response.data.hasTdah
          };
        
          await this.updateStudent(studentId, studentData);
          console.log('Estudiante actualizado con TDAH:', studentData);
        }
      } catch (error) {
        console.error('Error al llamar al servicio predict:', error);
      }
    },
    async updateStudent(studentId, studentData) {
      try {
        await StudentServices.updateStudent(studentId, studentData);
        console.log('Estudiante actualizado exitosamente');
      } catch (error) {
        console.error('Error al actualizar el estudiante:', error);
      }
    }
  },
};
</script>

<style scoped>
.main-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

h2 {
  margin: 0 0 24px;
  color: #1d4ed8;
  font-size: clamp(2.2rem, 2.6vw, 2.8rem);
  font-weight: 600;
}

.tests-container {
  flex: 1;
  display: flex;
  width: 100%;
}

.tests-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 760px;
  margin-left: 80px;
}

.test-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 18px 20px;
  border-radius: 22px;
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
  text-align: left;
  color: inherit;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  display: flex;
  align-items: center;
  min-height: 130px;
  width: 100%;
}

.test-card.completed {
  background: linear-gradient(135deg, rgba(187, 247, 208, 0.8) 0%, rgba(220, 252, 231, 0.92) 100%);
  border-color: rgba(34, 197, 94, 0.22);
}

.test-disabled {
  pointer-events: none;
  width: 100%;
}

.test-card-content {
  display: flex;
  align-items: center;
  gap: 18px;
  width: 100%;
}

.test-card img {
  width: 170px;
  height: 92px;
  border-radius: 16px;
  object-fit: cover;
  background: #eff6ff;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
}

.test-card .test-name {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
}

.test-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.12);
}

.dark-theme .main-content {
  background: transparent;
  color: white;
}

.dark-theme .test-card {
  background: rgba(30, 41, 59, 0.9);
  color: #f1f1f1;
  border-color: rgba(148, 163, 184, 0.12);
  box-shadow: 0 14px 28px rgba(2, 6, 23, 0.32);
}

.dark-theme .test-card.completed {
  background: linear-gradient(135deg, rgba(22, 101, 52, 0.75) 0%, rgba(20, 83, 45, 0.9) 100%);
}

.dark-theme .test-card .test-name {
  color: #f8fafc;
}

.test-name {
  margin: 0;
  color: inherit;
  text-decoration: none;
}

.test-link {
  display: block;
  color: inherit;
  text-decoration: none;
  width: 100%;
}

.test-link:hover {
  background-color: transparent;
}

.vue-toastification-container {
  z-index: 10000 !important;
}
</style>
