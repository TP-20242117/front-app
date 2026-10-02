<template>
  <div class="cpt-task">
    <div v-if="!taskStarted" class="instructions-screen">
      <h1>Instrucciones</h1>
      <p>
        El objetivo de esta evaluación es medir tu <strong>atención</strong> y <strong>velocidad de respuesta</strong>.
        Durante la prueba, verás letras en pantalla y deberás presionar espacio cuando la letra que corresponde en el momento aparezca.
      </p>
      <h2>Ejemplo:</h2>
      <p>Presione la letra: A</p>
      <p>Deberás presionar espacio cuando la letra A en el momento que aparezca.</p>
      <button @click="startTask">Iniciar Tarea</button>
    </div>
    <!-- Pantalla de cuenta regresiva -->
    <div v-if="showCountdown" class="countdown-screen">
      <h1>La tarea comenzará en...</h1>
      <div class="countdown-number">{{ countdown }}</div>
    </div>
    <div v-if="taskStarted && !showCountdown" class="task-active">
      <h2 v-if="!timeUp">Presiona espacio cuando aparezca la letra "{{ targetLetter }}"</h2>
      <h1 v-if="!timeUp">{{ currentLetter }}</h1>

      <div class="timer" v-if="!timeUp">
        Tiempo restante: {{ timer }} segundos
      </div>

      <div v-if="showErrorScreen" class="error-screen">
        <h1>¡Te has equivocado!</h1>
        <p>Intenta de nuevo presionando la tecla de espacio cuando aparezca la letra "{{ targetLetter }}".</p>
      </div>

      <div v-if="timeUp" class="result-screen">
        <h1>Resultados</h1>
        <p>Errores de omisión: {{ omissionErrors }}</p>
        <p>Errores de comisión: {{ commissionErrors }}</p>
        <p v-if="reactionTimes.length > 0">Tiempo de reacción promedio: {{ averageReactionTime }} ms</p>
        <button @click="goToTaskSelection">Volver a seleccionar tarea</button>
      </div>
    </div>
  </div>
</template>

<script>
import ResultService from '/services/result';

export default {
  data() {
    return {
      taskStarted: false,
      letters: 'ABCDEFGHIJ'.split(''),
      targetLetter: '',
      currentLetter: '',
      commissionErrors: 0,
      omissionErrors: 0,
      reactionTimes: [],
      averageReactionTime: null,
      timer: 60,
      timeUp: false,
      intervalId: null,
      timerInterval: null,
      showErrorScreen: false,
      letterStartTime: null,
      responded: false,
      taskEnded: false,
      countdown: 3,
      countdownInterval: null,
      showCountdown: false
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
          this.showCountdown = false;
          this.countdown = 3; // Resetear para la próxima vez
          
          // Iniciar la tarea directamente después del contador
          this.generateTargetLetter();
          this.startTimer();
          this.startLetterChange();
          window.addEventListener('keydown', this.handleKeyPress);
        }
      }, 1000);
    },
    startLetterChange() {
      this.intervalId = setInterval(() => {
        if (!this.timeUp && !this.taskEnded) {
          this.checkOmissionError();
          this.generateRandomLetter();
        }
      }, 500);
    },
    generateRandomLetter() {
      const randomIndex = Math.floor(Math.random() * this.letters.length);
      this.currentLetter = this.letters[randomIndex];
      this.letterStartTime = Date.now();
      this.responded = false;
    },
    generateTargetLetter() {
      const randomIndex = Math.floor(Math.random() * this.letters.length);
      this.targetLetter = this.letters[randomIndex];
    },
    handleKeyPress(event) {
      if (event.code === 'Space' && !this.timeUp && !this.responded && !this.taskEnded) {
        this.checkAnswer();
        this.responded = true;
      }
    },
    checkAnswer() {
      const currentTime = Date.now();
      const reactionTime = currentTime - this.letterStartTime;

      if (this.currentLetter === this.targetLetter) {
        this.reactionTimes.push(reactionTime);
        this.generateTargetLetter();
      } else {
        this.commissionErrors++;
        this.showErrorScreen = true;
        setTimeout(() => {
          this.showErrorScreen = false;
        }, 500);
      }
    },
    checkOmissionError() {
      if (this.currentLetter === this.targetLetter && !this.responded) {
        this.omissionErrors++;
      }
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          this.endTask();
        }
      }, 1000);
    },
    async endTask() {
      this.timeUp = true;
      this.taskEnded = true;
      clearInterval(this.intervalId);
      clearInterval(this.timerInterval);

      if (this.reactionTimes.length > 0) {
        const totalReactionTime = this.reactionTimes.reduce((acc, time) => acc + time, 0);
        this.averageReactionTime = (totalReactionTime / this.reactionTimes.length).toFixed(2);
      } else {
        this.averageReactionTime = "No hubo respuestas correctas";
      }

      const evaluationId = localStorage.getItem('evaluationId');
      const cptData = {
        evaluationId: parseInt(evaluationId),
        averageResponseTime: this.reactionTimes.length > 0 ? parseFloat(this.averageReactionTime) : 0,
        omissionErrors: this.omissionErrors,
        commissionErrors: this.commissionErrors
      };

      try {
        await ResultService.createCPTResult(cptData);
        console.log('Resultados enviados correctamente');
      } catch (error) {
        console.error('Error al enviar los resultados:', error);
      }
    },
    goToTaskSelection() {
      this.markTestAsCompleted(2);
      this.$router.push('/tests');
    },
    markTestAsCompleted(testIndex) {
      localStorage.setItem(`test-${testIndex}-completed`, JSON.stringify(true));
    },
    beforeUnmount() {
      clearInterval(this.intervalId);
      clearInterval(this.timerInterval);
      clearInterval(this.countdownInterval);
      window.removeEventListener('keydown', this.handleKeyPress);
    }
  }
};
</script>

<style scoped>
.cpt-task {
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
.task-active,
.result-screen,
.error-screen {
  width: min(760px, 92vw);
  margin: 0 auto;
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
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
  margin: 0 0 18px;
  color: #475569;
}

.instructions-screen strong {
  color: #0f172a;
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

.task-active {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 32px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.task-active h2 {
  font-size: 1.35rem;
  margin: 0 0 18px;
  color: #334155;
  font-weight: 600;
}

.task-active h1 {
  font-size: clamp(3.5rem, 9vw, 7rem);
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #1f2937;
}

.timer {
  font-size: 1.3rem;
  margin: 24px 0 12px;
  font-weight: 700;
  color: #1e293b;
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

.dark-theme .cpt-task {
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  color: #e2e8f0;
}

.dark-theme .instructions-screen,
.dark-theme .task-active {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.dark-theme .instructions-screen h1,
.dark-theme .task-active h1 {
  color: #e2e8f0;
}

.dark-theme .instructions-screen h2,
.dark-theme .task-active h2 {
  color: #cbd5e1;
}

.dark-theme .instructions-screen p,
.dark-theme .timer {
  color: #cbd5e1;
}

.dark-theme .instructions-screen strong {
  color: #f8fafc;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
</style>
