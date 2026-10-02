<template>
  <div class="stroop-task">
    <div v-if="!taskStarted" class="instructions-screen">
      <h1>Instrucciones</h1>
      <p>
        El objetivo de esta evaluación es identificar el <strong>color de la tinta</strong> de la palabra mostrada, no el <strong>significado</strong> de la palabra.
      </p>
      <h2>Ejemplo:</h2>
      <p :style="{ color: exampleColor.code }">{{ exampleColor.name }}</p>
      <p>Tendrás que presionar el color azul, y luego continuar con el color que te salga.</p>
      <button @click="startTask">Iniciar Tarea</button>
    </div>
    <div v-if="showCountdown" class="countdown-screen">
      <h1>La tarea comenzará en...</h1>
      <div class="countdown-number">{{ countdown }}</div>
    </div>

    <div v-if="taskStarted" class="task-active">
      <h2>Seleccione el color</h2>
      <h1 :style="{ color: displayedColor.code }">{{ displayedColor.name }}</h1>

      <div class="color-buttons">
        <button
          v-for="color in colors"
          :key="color.name"
          :style="{ backgroundColor: color.code }"
          @click="checkAnswer(color)"
        ></button>
      </div>

      <p v-if="result !== null" :class="result ? 'correct' : 'wrong'">
        {{ result ? 'Correcto' : 'Incorrecto' }}
      </p>

      <div class="timer">
        Tiempo restante: {{ timer }} segundos
      </div>

      <div v-if="showErrorScreen" class="error-screen">
        <h1>¡Te has equivocado!</h1>
        <p>Intenta de nuevo seleccionando el color correcto.</p>
      </div>

      <div v-if="timeUp" class="result-screen">
        <h1>Tiempo agotado</h1>
        <p>Acertaste: {{ correctAnswers }} veces</p>
        <p>Errores: {{ wrongAnswers }} veces</p>
        <p>Tiempo de respuesta promedio: {{ averageResponseTime }} ms</p>
        <button @click="goToInstructions">Volver a la pantalla inicial</button>
      </div>
    </div>
  </div>
</template>

<script>
import  ResultService  from '/services/result';

export default {
  data() {
    return {
      countdown: 3,
      countdownInterval: null,
      showCountdown: false,
      taskStarted: false,
      colors: [
        { name: 'ROJO', code: '#ff0000' },
        { name: 'NEGRO', code: '#000000' },
        { name: 'NARANJA', code: '#ff9900' },
        { name: 'VERDE', code: '#00cc99' },
        { name: 'AZUL', code: '#0000ff' },
        { name: 'AMARILLO', code: '#ffff00' },
        { name: 'MORADO', code: '#800080' },
        { name: 'ROSADO', code: '#ff69b4' }
      ],
      displayedColor: {},
      result: null,
      showErrorScreen: false,
      timer: 60,
      timerInterval: null,
      correctAnswers: 0,
      wrongAnswers: 0,
      timeUp: false,
      responseTimes: [],
      startTime: null,
      exampleColor: { name: 'ROJO', code: '#0000ff' }
    };
  },
  methods: {
    startTask() {
      this.showCountdown = true;
      this.countdownInterval = setInterval(() => {
        if (this.countdown > 1) {
          this.countdown--;
        } else {
          clearInterval(this.countdownInterval);
          this.taskStarted = true;
          this.resetGame();
          this.startTimer();
          this.showCountdown = false;
          this.countdown = 3; // Resetear para la próxima vez
        }
      }, 1000);
    },
    generateRandomColor() {
      const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
      const randomText = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.displayedColor = { name: randomText.name, code: randomColor.code };
      this.startTime = new Date();
    },
    checkAnswer(color) {
      const responseTime = new Date() - this.startTime;
      this.responseTimes.push(responseTime);

      if (color.code === this.displayedColor.code) {
        this.result = true;
        this.correctAnswers++;
        setTimeout(() => {
          this.result = null;
          this.generateRandomColor();
        }, 1000);
      } else {
        this.result = false;
        this.wrongAnswers++;
        this.showErrorScreen = true;

        setTimeout(() => {
          this.showErrorScreen = false;
          this.result = null;
          this.generateRandomColor();
        }, 1000);
      }
    },
    startTimer() {
      this.timer = 60;
      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          this.timeUp = true;
          clearInterval(this.timerInterval);
        }
      }, 1000);
    },
    resetGame() {
      this.correctAnswers = 0;
      this.wrongAnswers = 0;
      this.responseTimes = [];
      this.timer = 60;
      this.timeUp = false;
      this.generateRandomColor();
    },
    goToInstructions() {
      this.markTestAsCompleted(0);
      this.submitStroopResults();
      this.$router.push('/tests');
    },
    markTestAsCompleted(testIndex) {
      localStorage.setItem(`test-${testIndex}-completed`, JSON.stringify(true));
    },
    async submitStroopResults() {
      const evaluationId = localStorage.getItem('evaluationId');

      if (evaluationId) {
        const stroopData = {
          evaluationId: parseInt(evaluationId),
          averageResponseTime: parseInt(this.averageResponseTime),
          correctAnswers: this.correctAnswers,
          incorrectAnswers: this.wrongAnswers
        };

        try {
          await ResultService.createStroopResult(stroopData);
          console.log('Resultados de Stroop enviados correctamente');
        } catch (error) {
          console.error('Error al enviar los resultados de Stroop:', error);
        }
      } else {
        console.error('No se encontró el evaluationId en el localStorage');
      }
    }
  },
  computed: {
    averageResponseTime() {
      const totalResponseTime = this.responseTimes.reduce((acc, time) => acc + time, 0);
      return this.responseTimes.length ? (totalResponseTime / this.responseTimes.length).toFixed(0) : 0;
    }
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
    clearInterval(this.countdownInterval);
  }
};
</script>

<style scoped>
.stroop-task {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px 48px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
  color: #1f2937;
}

.instructions-screen,
.countdown-screen,
.result-screen,
.error-screen {
  width: min(760px, 92vw);
  margin: 0 auto;
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.task-active {
  width: min(900px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.instructions-screen {
  text-align: center;
  padding: 40px 32px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.instructions-screen h1 {
  font-size: clamp(2.2rem, 2.6vw, 2.8rem);
  margin-bottom: 20px;
  color: #1d4ed8;
  font-weight: 600;
}

.instructions-screen h2 {
  font-size: 1.3rem;
  margin: 24px 0 12px;
  color: #334155;
}

.instructions-screen p {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 18px;
  color: #475569;
}

.instructions-screen button {
  width: auto;
  height: auto;
  padding: 14px 28px;
  font-size: 1.02rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.24);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.instructions-screen button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.3);
}

h1 {
  font-size: clamp(2.5rem, 4vw, 4rem);
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.color-buttons {
  display: grid;
  grid-template-columns: repeat(4, minmax(60px, 72px));
  gap: 18px;
  justify-content: center;
  margin-top: 28px;
}

button {
  width: 72px;
  height: 72px;
  margin: 0;
  border: 4px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

button:hover {
  transform: translateY(-2px) scale(1.03);
  border-color: rgba(255, 255, 255, 1);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.16);
}

.correct {
  color: #16a34a;
  font-weight: 700;
  font-size: 1.2rem;
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 163, 74, 0.12);
  border: 1px solid rgba(22, 163, 74, 0.28);
  border-radius: 999px;
  padding: 8px 18px;
  min-width: 150px;
  margin-left: auto;
  margin-right: auto;
}

.wrong {
  color: #dc2626;
  font-weight: 700;
  font-size: 1.2rem;
  margin-top: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 999px;
  padding: 8px 18px;
  min-width: 150px;
  margin-left: auto;
  margin-right: auto;
}

.error-screen,
.result-screen,
.countdown-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.74);
  backdrop-filter: blur(4px);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  text-align: center;
  padding: 24px;
}

.error-screen {
  background: rgba(220, 38, 38, 0.82);
}

.error-screen h1,
.result-screen h1,
.countdown-screen h1 {
  font-size: clamp(2rem, 5vw, 3.2rem);
  margin-bottom: 14px;
}

.error-screen p,
.result-screen p,
.countdown-screen p {
  font-size: clamp(1.1rem, 2vw, 1.6rem);
  margin: 8px 0;
}

.timer {
  font-size: 1.3rem;
  margin: 24px 0 12px;
  font-weight: 700;
  color: #1e293b;
}

.result-screen button {
  background-color: white;
  color: #111827;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  width: auto !important;
  padding: 14px 26px;
  margin-top: 18px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
}

.result-screen button:hover {
  background-color: #f8fafc;
}

.countdown-screen {
  background: rgba(15, 23, 42, 0.82);
}

.countdown-screen h1 {
  font-size: clamp(2.2rem, 2.6vw, 2.8rem);
  font-weight: 600;
}

.countdown-number {
  font-size: clamp(4rem, 10vw, 7rem);
  font-weight: 700;
  margin-top: 20px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
</style>
