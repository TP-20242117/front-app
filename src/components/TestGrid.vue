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
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 60vh;
}

h2 {
  margin-bottom: 20px;
}

.tests-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
}

.tests-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
  align-items: center;
  margin-left: 100px;
}

.test-card {
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: left;
  color: inherit;
  transition: transform 0.3s ease, background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 120px;
  cursor: pointer;
  width: 100%;
}

.test-card.completed {
  background-color: lightgreen;
}

.test-disabled {
  pointer-events: none;
}

.test-card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.test-card img {
  max-width: 200px;
  border-radius: 5px;
  object-fit: contain;
}

.test-card .test-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: inherit;
  line-height: 1.4;
}

.test-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

.dark-theme .main-content {
  background-color: #121212;
  color: white;
}

.dark-theme .test-card {
  background-color: #2c3e50;
  color: #f1f1f1;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dark-theme .test-card.completed {
  background-color: #2c3e50;
}

.dark-theme .test-card:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
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
  transition: background-color 0.2s;
}

.test-link:hover {
  background-color: transparent;
}

.vue-toastification-container {
  z-index: 10000 !important;
}
</style>
