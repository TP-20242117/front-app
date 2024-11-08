<template>
  <div class="stop-signal-task">
    <div v-if="!taskStarted" class="instructions-screen">
      <h1>Instrucciones</h1>
      <p>El objetivo de este test es evaluar tu capacidad de respuesta y autocontrol.</p>
      <p>Durante la prueba, verás flechas en pantalla y deberás presionar las teclas de dirección correspondientes.</p>
      <h2>Ejemplo:</h2>
      <p>⬅️ Deberás presionar la tecla izquierda</p>
      <p>➡️ Deberás presionar la tecla derecha</p>
      <button @click="startTask">Empezar</button>
    </div>

    <div v-if="taskStarted">
      <h2>Presiona la tecla de flecha correspondiente</h2>
      <div class="game-container">
        <div class="arrow-container">
          <span v-if="showArrow && currentDirection === 'left'" class="arrow">⬅️</span>
          <span v-if="showArrow && currentDirection === 'right'" class="arrow">➡️</span>
        </div>

        <p v-if="showResult" :class="result === 'correct' ? 'correct' : result === 'wrong' ? 'wrong' : 'missed'" class="result-text">
          <i v-if="result === 'correct'" class="pi pi-check icon"></i>
          <i v-if="result === 'wrong'" class="pi pi-times icon"></i>
          <i v-if="result === 'missed'" class="pi pi-exclamation-triangle icon"></i>
          <span>{{ result === 'correct' ? 'Correcto' : result === 'wrong' ? 'Incorrecto' : 'No presionaste :(' }}</span>
        </p>

        <div class="timer">Tiempo restante: {{ timer }} segundos</div>
      </div>
      <div v-if="timeUp" class="result-screen">
        <h1>Tiempo agotado</h1>
        <p>Acertaste: {{ correctAnswers }} veces</p>
        <p>Errores: {{ wrongAnswers }} veces</p>
        <p>Flechas omitidas: {{ missedArrows }} veces</p>
        <p>Tiempo de reacción promedio: {{ averageResponseTime }} ms</p>
        <button @click="goToTaskSelection">Volver a la selección de tareas</button>
      </div>
    </div>
  </div>
</template>

<script>
import ResultService from "/services/result";

export default {
  data() {
    return {
      taskStarted: false,
      directions: ["left", "right"],
      currentDirection: "",
      result: null,
      intervalId: null,
      timer: 60,
      timerInterval: null,
      correctAnswers: 0,
      wrongAnswers: 0,
      missedArrows: 0,
      timeUp: false,
      showArrow: false,
      showResult: false,
      hasAnswered: false,
      responseTimes: [],
      startTime: null,
    };
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress);
    clearInterval(this.intervalId);
    clearInterval(this.timerInterval);
  },
  methods: {
    startTask() {
      this.resetGame();
      this.taskStarted = true;
      this.startTimer();
      this.showNextArrow();
    },

    showNextArrow() {
      if (this.timeUp) return;

      this.generateRandomDirection();
      this.showArrow = true;
      this.startTime = new Date();
      this.result = null;
      this.hasAnswered = false;

      setTimeout(() => {
        this.showArrow = false;
        if (!this.hasAnswered) {
          this.result = "missed";
          this.missedArrows++;
        }
        this.showResult = true;

        setTimeout(() => {
          this.showResult = false;
          if (!this.timeUp) {
            this.showNextArrow();
          }
        }, 1000);
      }, 1000);
    },

    generateRandomDirection() {
      const randomIndex = Math.floor(Math.random() * this.directions.length);
      this.currentDirection = this.directions[randomIndex];
    },

    handleKeyPress(event) {
      if (
        !this.timeUp &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        const responseTime = new Date() - this.startTime;

        if (
          (event.key === "ArrowLeft" && this.currentDirection === "left") ||
          (event.key === "ArrowRight" && this.currentDirection === "right")
        ) {
          if (!this.hasAnswered) {
            this.result = "correct";
            this.correctAnswers++;
            this.responseTimes.push(responseTime);
            this.hasAnswered = true;
          }
        } else {
          this.result = "wrong";
          this.wrongAnswers++;
          this.hasAnswered = true;
        }
      }
    },

    startTimer() {
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
      this.missedArrows = 0;
      this.responseTimes = [];
      this.timer = 60;
      this.timeUp = false;
      this.showArrow = false;
      this.showResult = false;
    },

    goToTaskSelection() {
      this.submitSSTResult();
      this.markTestAsCompleted(1);
      this.$router.push("/tests");
    },

    submitSSTResult() {
      const evaluationId = localStorage.getItem('evaluationId');
      const sstData = {
        evaluationId: parseInt(evaluationId),
        averageResponseTime: parseInt(this.averageResponseTime),
        correctStops: this.correctAnswers,
        incorrectStops: this.wrongAnswers,
        ignoredArrows: this.missedArrows,
      };

      ResultService.createSSTResult(sstData)
        .then((response) => {
          console.log("SST result submitted successfully:", response);
        })
        .catch((error) => {
          console.error("Failed to submit SST result:", error);
        });
    },

    markTestAsCompleted(testIndex) {
      localStorage.setItem(`test-${testIndex}-completed`, JSON.stringify(true));
    },
  },
  computed: {
    averageResponseTime() {
      const totalResponseTime = this.responseTimes.reduce(
        (acc, time) => acc + time,
        0
      );
      return this.responseTimes.length
        ? (totalResponseTime / this.responseTimes.length).toFixed(0)
        : 0;
    },
  },
};
</script>
<style scoped>
.stop-signal-task {
  text-align: center;
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

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 200px;
}

.arrow-container {
  font-size: 72px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.result-text {
  font-size: 24px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column; 
  align-items: center;  
}

.correct {
  color: green;
}

.wrong {
  color: red;
}

.missed {
  color: orange;
}

.timer {
  font-size: 24px;
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
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

.waiting-symbol {
  font-size: 72px;
  color: #aaa;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}
</style>
