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

        <canvas id="barChart"></canvas>
      </div>

      


      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h4 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Estudiantes con {{ selectedCategoryName }}</h4>
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

export default {
  data() {
    return {
      theme: localStorage.getItem("theme") || "light",
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
    document.body.classList.toggle("dark-theme", this.theme === "dark");
    this.fetchClassrooms();
  },
  methods: {
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
        console.log("Salón seleccionado:", this.selectedClassroom);
        const response = await studentService.getStudentsBySalonId(this.selectedClassroom);
        this.students = response.data.data;

        await nextTick();
        this.renderBarChart();
      } catch (error) {
        console.error("Error al obtener estudiantes:", error);
      }
    },
    
    renderBarChart() {
      const ctx = document.getElementById("barChart")?.getContext("2d");
      if (!ctx) {
        console.warn("Canvas no disponible aún.");
        return;
      }

      const tdahCount = this.students.filter(s => s.hasTdah).length;
      const noTdahCount = this.students.length - tdahCount;

      if (this.chart) this.chart.destroy();

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
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const dataIndex = context.dataIndex;
                  const label = context.dataset.data[dataIndex];
                  const recommendations = {
                    0: "Se recomienda una intervención temprana, realizar evaluaciones periódicas y fomentar actividades que mejoren la concentración.",
                    1: "Fomentar la participación en actividades grupales y evaluar el apoyo educativo para mejorar el rendimiento académico."
                  };
                  return `${label} estudiantes. Recomendación: ${recommendations[dataIndex]}`;
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 12,
                },
                maxRotation: 0,
                minRotation: 0,
              },
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                font: {
                  size: 12,
                },
              },
            },
          },

          onClick: (e) => {
  const points = this.chart.getElementsAtEventForMode(e, "nearest", { intersect: true }, false);
  if (points.length) {
    const index = points[0].index;
    if (index === 0) {

      this.selectedCategory = this.students.filter(s => s.hasTdah);
      this.selectedCategoryName = "TDAH";
      this.showModal = true;  
    } else if (index === 1) {
     
      this.selectedCategory = this.students.filter(s => !s.hasTdah);
      this.selectedCategoryName = "Sin TDAH";
      this.showModal = true; 
    }
  }
}
        },
      });
    },

    closeModal() {
      this.showModal = false;
    }
  },
  watch: {
    theme(newVal) {
      document.body.classList.toggle("dark-theme", newVal === "dark");
    },
  },
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
canvas#barChart {
  width: 1000px;
  height: 800px;
  margin: 0 auto;
}
</style>
