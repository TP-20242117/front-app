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
    <div v-if="taskStarted && !showCountdown">
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
  text-align: center;
}

h1 {
  font-size: 72px;
}

.instructions-screen {
  text-align: center;
  margin: 20px;
}

.instructions-screen h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

.instructions-screen p {
  font-size: 18px;
  margin-bottom: 20px;
  margin-left: 40px;
}

.instructions-screen button {
  padding: 10px 20px;
  font-size: 18px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
}

.instructions-screen button:hover {
  background-color: #45a049;
}

.timer {
  font-size: 24px;
  margin: 20px 0;
}

.error-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.error-screen h1 {
  font-size: 48px;
}

.error-screen p {
  font-size: 24px;
}

.result-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.result-screen h1 {
  font-size: 48px;
}

.result-screen p {
  font-size: 24px;
}

.result-screen button {
  background-color: white;
  color: black;
  font-size: 15px;
  border: none;
  cursor: pointer;
  border-radius: 50px;
}

.result-screen button:hover {
  background-color: #f0f0f0;
}
.countdown-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-size: 24px;
}

.countdown-number {
  font-size: 72px;
  font-weight: bold;
  margin-top: 20px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
