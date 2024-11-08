<template>
  <div :class="['main-content', theme]">
    <h2>Mis Pruebas</h2>
    <div class="tests-container">
      <div class="tests-grid">
        <div
          v-for="test in tests"
          :key="test.name"
          :class="['test-card', { completed: test.completed }]"
        >
          <router-link
            v-if="!test.completed"
            :to="test.route"
            class="test-link"
          >
            <img :src="test.image" :alt="test.name" />
            <p class="test-name">{{ test.name }}</p>
          </router-link>
          <div v-else class="test-disabled">
            <img :src="test.image" :alt="test.name" />
            <p class="test-name">{{ test.name }} (Completada)</p>
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

export default {
  data() {
    return {
      tests: [
        {
          name: 'Prueba Stroop',
          route: '/stroop',
          image: require('../assets/Stroop_Task.png'),
          completed: false,
        },
        {
          name: 'Prueba Stop Signal Task',
          route: '/stop-signal',
          image: require('../assets/Stop_Task.png'),
          completed: false,
        },
        {
          name: 'Prueba Continuous Performance Task',
          route: '/cpt',
          image: require('../assets/CPT_Task.png'),
          completed: false,
        },
      ],
      theme: localStorage.getItem('theme') || 'light',
    };
  },
  mounted() {
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
        const stroopResults = this.tests[0].completed ? [{ 
          averageResponseTime: 587, 
          correctAnswers: 36, 
          incorrectAnswers: 0 
        }] : [];

        const cptResults = this.tests[1].completed ? [{ 
          averageResponseTime: 418, 
          omissionErrors: 3, 
          commissionErrors: 2 
        }] : [];

        const sstResults = this.tests[2].completed ? [{ 
          averageResponseTime: 658, 
          correctStops: 30, 
          incorrectStops: 2, 
          ignoredArrows: 3 
        }] : [];

        const data = {
          stroopResults: stroopResults,
          cptResults: cptResults,
          sstResults: sstResults
        };

        const response = await PredictServices.predict(data);
        console.log('Resultado de la predicción:', response.data);
      } catch (error) {
        console.error('Error al llamar al servicio predict:', error);
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
  align-items: center;
}

.tests-grid {
  display: flex;
  gap: 20px;
}

.test-card {
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 200px;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, background-color 0.3s;
}

.test-card.completed {
  background-color: lightgreen;
}

.test-disabled {
  pointer-events: none;
}

.test-card img {
  max-width: 100%;
  border-radius: 5px;
  margin-bottom: 10px;
}

.test-card:hover {
  transform: scale(1.05);
}

.dark-theme .main-content {
  background-color: #121212;
  color: white;
}

.dark-theme .test-card {
  background-color: #273852;
  color: #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dark-theme .test-card.completed {
  background-color: #007efe;
  color: white;
}

.dark-theme .test-disabled {
  color: #ccc;
}

.dark-theme .test-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.5);
}

.test-name {
  margin: 10px 0 0 0;
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
</style>
