<template>
  <div :class="['main-content', theme]">
    <div :class="['report-card', theme]">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Selecciona un salón
      </h2>

      <div class="select-wrap">
        <label>Salón:</label>
        <select v-model="selectedClassroom" @change="onClassroomChange" class="form-select">
          <option disabled value="">Selecciona un salón</option>
          <option v-for="classroom in classrooms" :key="classroom.id" :value="classroom.id">
            {{ classroom.name }}
          </option>
        </select>
      </div>

      <div v-if="students.length">
        <h3>Resumen de TDAH</h3>
        <div class="canvas-wrap">
          <canvas ref="barChart"></canvas>
        </div>
      </div>
      <div v-else-if="selectedClassroom" class="text-center mt-5">
        <h1 class="text-xl font-semibold text-red-500 dark:text-red-400">
          No hay alumnos registrados en este salón.
        </h1>
      </div>

      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" :class="{ 'dark': theme === 'dark' }" @click.stop>
          <h4 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estudiantes con indicios de {{ selectedCategoryName }}
          </h4>
          <ul class="overflow-y-auto max-h-60 pr-2">
            <li v-for="student in selectedCategory" :key="student.id">
              {{ student.name }} - {{ student.hasTdah ? 'Tiene indicios de TDAH' : 'Sin indicios de TDAH' }}
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
      renderingChart: false,
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
      if (this.renderingChart) {
        return;
      }

      this.renderingChart = true;

      try {
        const canvas = this.$refs.barChart;
        if (!canvas) {
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }

        const filteredStudents = this.students.filter(s => s.hasTdah !== null);
        const tdahCount = filteredStudents.filter(s => s.hasTdah === true).length;
        const noTdahCount = filteredStudents.filter(s => s.hasTdah === false).length;

        if (this.chart) {
          try {
            this.chart.stop();
          } catch (error) {
            console.warn('No se pudo detener la animación del gráfico:', error);
          }

          try {
            this.chart.destroy();
          } catch (error) {
            console.warn('No se pudo destruir el gráfico anterior:', error);
          }

          this.chart = null;
        }

        const isDark = document.body.classList.contains("dark-theme");
        const textColor = isDark ? "#ffffff" : "#000000";
        const gridColor = isDark ? "#4b5563" : "#e5e7eb";

        nextTick(() => {
          this.chart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: ["Con indicios de TDAH", "Sin indicios de TDAH"],
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
              animation: false,
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
              this.selectedCategory = filteredStudents.filter(s => index === 0 ? s.hasTdah : !s.hasTdah);
              this.selectedCategoryName = index === 0 ? "TDAH" : "Sin TDAH";
              this.showModal = true;
            }
          };
        });
      } finally {
        this.renderingChart = false;
      }
    },

    closeModal() {
      this.showModal = false;
    }
  }
};
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 80px);
  padding: 32px 20px 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
}

.main-content.dark {
  background: #313131;
}

.report-card {
  width: min(980px, 100%);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 28px 28px 24px;
  transition: all 0.25s ease;
}

.report-card.dark {
  background: #313131;
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 48px rgba(15, 17, 20, 0.32);
}

.report-card h2 {
  margin: 0 0 20px;
  font-size: clamp(1.5rem, 2vw, 2rem);
  color: #1d4ed8;
  font-weight: 700;
}

.report-card.dark h2,
.report-card.dark h3,
.report-card.dark label,
.report-card.dark .modal-content {
  color: #e2e8f0;
}

.select-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

label {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
}

.form-select {
  border: 1px solid #dbe3f0;
  border-radius: 14px;
  padding: 12px 16px;
  min-width: min(320px, 100%);
  background: #f8fbff;
  color: #0f172a;
  font: inherit;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.18);
}

.report-card.dark .form-select {
  background: rgba(15, 23, 42, 0.7);
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.25);
}

.report-card h3 {
  margin: 0 0 18px;
  font-size: 1.2rem;
  color: #334155;
  font-weight: 700;
}

.canvas-wrap {
  background: rgba(248, 250, 252, 0.75);
  border-radius: 20px;
  padding: 18px 16px 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.report-card.dark .canvas-wrap {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(148, 163, 184, 0.12);
}

canvas {
  display: block;
  width: 100% !important;
  max-width: 900px;
  height: 360px !important;
  margin: 0 auto;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
}

.modal-content {
  background: rgba(255, 255, 255, 0.98);
  color: #111827;
  padding: 1.7rem 1.5rem 1.4rem;
  border-radius: 20px;
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.18);
  max-width: 500px;
  width: min(500px, 100%);
  max-height: 80vh;
  overflow-y: auto;
  transition: background-color 0.3s, color 0.3s;
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.modal-content.dark {
  background: rgba(31, 41, 55, 0.98);
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.15);
}

.modal-content h4 {
  margin: 0 0 16px;
  font-size: 1.2rem;
  font-weight: 700;
  color: inherit;
}

.modal-content ul {
  list-style: none;
  padding: 0;
  margin: 0 0 18px;
  display: grid;
  gap: 10px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 6px;
}

.modal-content li {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  padding: 10px 12px;
  color: inherit;
}

.btn {
  padding: 0.75rem 1.1rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  border: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.2);
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.15);
  color: #334155;
}

.report-card.dark .btn-secondary {
  color: #f8fafc;
}

.modal-content ul::-webkit-scrollbar {
  width: 6px;
}

.modal-content ul::-webkit-scrollbar-thumb {
  background-color: rgba(107, 114, 128, 0.6);
  border-radius: 999px;
}
</style>
