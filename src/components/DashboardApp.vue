<template>
  <div :class="['main-content', theme]">
    <div :class="['report-card', theme]">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Selecciona un salón
      </h2>

      <div class="mb-4">
        <label class="text-gray-700 dark:text-gray-300 mr-2">Salón:</label>
        <select v-model="selectedClassroom" @change="onClassroomChange" class="form-select">
          <option disabled value="">Selecciona un salón</option>
          <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
            {{ classroom.name }}
          </option>
        </select>
      </div>

      <div v-if="students.length">
        <h3 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Resumen de TDAH</h3>
        <canvas ref="barChart"></canvas>
      </div>

      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" :class="{ 'dark': theme === 'dark' }" @click.stop>
          <h4 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estudiantes con {{ selectedCategoryName }}
          </h4>
          <ul>
            <li v-for="student in selectedCategory" :key="student.id">
              {{ student.name }} - {{ student.hasTdah ? 'Con TDAH' : 'Sin TDAH' }}
            </li>
          </ul>
          <button @click="closeModal" class="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue";
import classroomService from "/services/classrooms";
import studentService from "/services/student";
import Chart from "chart.js/auto";
import emitter from '@/eventBus';

export default {
  data() {
    return {
      theme: localStorage.getItem("theme") || "light",
      previousTheme: null,
      classrooms: [],
      selectedClassroom: "",
      students: [],
      chart: null,
      selectedCategory: [],
      selectedCategoryName: "",
      showModal: false,
    };
  },
  mounted() {
    emitter.on('theme-changed', this.handleThemeChange);
    document.body.classList.toggle("dark-theme", this.theme === "dark");
    this.fetchClassrooms();
    this.previousTheme = localStorage.getItem("theme");
    this.renderBarChart();
  },
  methods: {
    handleThemeChange(newTheme) {
      console.log("Cambio de color detectado:", newTheme);
      this.theme = newTheme;
      this.previousTheme = newTheme;
      document.body.classList.toggle("dark-theme", newTheme === "dark");
      this.renderBarChart();
    },

    beforeDestroy() {
      emitter.off('theme-changed', this.handleThemeChange);
    },

    async fetchClassrooms() {
      const educatorId = localStorage.getItem("id");
      if (educatorId) {
        try {
          const response = await classroomService.getClassroomsByEducator(educatorId);
          this.classrooms = response.data.data;
          localStorage.setItem("classrooms", JSON.stringify(this.classrooms));
        } catch (error) {
          console.error("Error al obtener los salones:", error);
        }
      }
    },

    async onClassroomChange() {
      try {
        const response = await studentService.getStudentsBySalonId(this.selectedClassroom);
        this.students = response.data.data;

        await nextTick();
        this.renderBarChart();
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
      }
    },

    renderBarChart() {
      const canvas = this.$refs.barChart;
      if (!canvas) {
        console.warn("Canvas no disponible aún.");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.warn("No se pudo obtener el contexto del canvas.");
        return;
      }

      const tdahCount = this.students.filter(s => s.hasTdah).length;
      const noTdahCount = this.students.length - tdahCount;

      if (this.chart) {
        this.chart.destroy();
      }

      const isDark = document.body.classList.contains("dark-theme");
      const textColor = isDark ? "#ffffff" : "#000000";
      const gridColor = isDark ? "#4b5563" : "#e5e7eb";

      nextTick(() => {
        this.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Con TDAH", "Sin TDAH"],
            datasets: [{
              label: "Cantidad de estudiantes",
              data: [tdahCount, noTdahCount],
              backgroundColor: ["#f87171", "#34d399"],
              barThickness: 100,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: false,
                labels: {
                  color: textColor,
                }
              },
              tooltip: {
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                titleColor: isDark ? "#f3f4f6" : "#1f2937",
                bodyColor: isDark ? "#f3f4f6" : "#1f2937",
                borderColor: isDark ? "#6b7280" : "#d1d5db",
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => {
                    const dataIndex = context.dataIndex;
                    const label = context.dataset.data[dataIndex];
                    const recommendations = {
                      0: "Se recomienda una intervención temprana...",
                      1: "Fomentar la participación en actividades grupales...",
                    };
                    return `${label} estudiantes. Recomendación: ${recommendations[dataIndex]}`;
                  }
                }
              }
            },
            scales: {
              x: {
                ticks: {
                  color: textColor,
                  font: { size: 12 },
                },
                grid: {
                  display: false,
                },
              },
              y: {
                ticks: {
                  color: textColor,
                  font: { size: 12 },
                },
                grid: {
                  color: gridColor,
                },
              },
            }
          },
        });

        canvas.onclick = (e) => {
          const points = this.chart.getElementsAtEventForMode(e, "nearest", { intersect: true }, false);
          if (points.length) {
            const index = points[0].index;
            this.selectedCategory = this.students.filter(s => index === 0 ? s.hasTdah : !s.hasTdah);
            this.selectedCategoryName = index === 0 ? "TDAH" : "Sin TDAH";
            this.showModal = true;
          }
        };
      });
    },

    closeModal() {
      this.showModal = false;
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 100%;
  transition: background-color 0.3s, color 0.3s;
}

.modal-content.dark {
  background-color: #1f2937;
  color: #f3f4f6;
}

.dark-theme select.form-select {
  background-color: #555;
  color: #f3f4f6;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background-color: #3490dc;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #2779bd;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

canvas {
  width: 1000px;
  height: 800px;
  margin: 0 auto;
}
</style>
