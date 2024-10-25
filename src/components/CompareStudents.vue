<template>
    <div class="container">
      <div class="dropdowns">
        <div class="dropdown">
          <select v-model="selectedStudent1" @change="loadReports(1)">
            <option disabled value="">Nombre del alumno</option>
            <option v-for="student in students" :key="student" :value="student">
              {{ student }}
            </option>
          </select>
        </div>
  
        <div class="dropdown">
          <select v-model="selectedStudent2" @change="loadReports(2)">
            <option disabled value="">Nombre del alumno</option>
            <option v-for="student in students" :key="student" :value="student">
              {{ student }}
            </option>
          </select>
        </div>
      </div>
  
      <div v-if="reportUrls1.length" class="reports">
        <h3>Estudiante 1: {{ selectedStudent1 }}</h3>
        <div class="report-grid">
          <div v-for="(report, index) in reportUrls1" :key="index" class="report">
            <iframe :src="report" width="500" height="300"></iframe>
          </div>
        </div>
      </div>
  
      <div v-if="reportUrls2.length" class="reports">
        <h3>Estudiante 2: {{ selectedStudent2 }}</h3>
        <div class="report-grid">
          <div v-for="(report, index) in reportUrls2" :key="index" class="report">
            <iframe :src="report" width="500" height="300"></iframe>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        students: ["Kendal Ramirez", "Paulo Costa", "Alonso Contreras"],
        selectedStudent1: "",
        selectedStudent2: "",
        reportUrls1: [],
        reportUrls2: [],
        powerBiBaseUrl: "https://app.powerbi.com/view?r=eyJrIjoiMjkyYjM1MDktNjgyMS00Mzc3LWJmZTEtOTIxM2RjMGEwMWVmIiwidCI6Ijc0MzBjOGJlLWQ1ZTMtNDgxYi1hNTcwLTZjOGI0MzRkZGY4OCIsImMiOjZ9"
      };
    },
    methods: {
      loadReports(studentNumber) {
        const reportUrls = this.generateReportUrls();
    
        if (studentNumber === 1) {
          this.reportUrls1 = reportUrls;
        } else if (studentNumber === 2) {
          this.reportUrls2 = reportUrls;
        }
      },
    
      generateReportUrls() {
        return Array(3).fill(this.powerBiBaseUrl);
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .dropdowns {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .dropdown {
    flex: 1;
    margin-right: 20px;
  }
  
  .reports {
    margin-top: 40px;
  }
  
  .report-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .report {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    min-height: 320px;
  }
  
  iframe {
    border: none;
    max-width: 100%;
    max-height: 100%;
  }
  </style>
  