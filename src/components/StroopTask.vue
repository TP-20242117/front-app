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

    <div v-if="taskStarted">
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
      setTimeout(() => {
        this.taskStarted = true;
        this.resetGame();
        this.startTimer();
      }, 3000); 
      
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
  }
};
</script>

<style scoped>
.stroop-task {
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
  width: auto;
  height: auto;
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

h1 {
  font-size: 48px;
}

.color-buttons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

button {
  width: 50px;
  height: 50px;
  margin: 0 10px;
  border: none;
  cursor: pointer;
}

.correct {
  color: green;
}

.wrong {
  color: red;
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

.timer {
  font-size: 24px;
  margin: 20px 0;
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
  width: auto !important;
}

.result-screen button:hover {
  background-color: #f0f0f0;
}
</style>
