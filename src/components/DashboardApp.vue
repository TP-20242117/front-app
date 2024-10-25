<template>
  <div :class="['main-content', theme]">
    <h1 class="text-2xl font-bold text-center mb-6">Hola Jonatan</h1>
    
    <div :class="['report-card', theme]">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Reporte de Test Recientes</h2>
        <button class="export-btn px-4 py-2 rounded-lg transition-colors duration-300">
          Export PDF
        </button>
      </div>

      <div class="iframe-container">
        <iframe
          class="powerbi-iframe"
          src="https://app.powerbi.com/view?r=eyJrIjoiMjkyYjM1MDktNjgyMS00Mzc3LWJmZTEtOTIxM2RjMGEwMWVmIiwidCI6Ijc0MzBjOGJlLWQ1ZTMtNDgxYi1hNTcwLTZjOGI0MzRkZGY4OCIsImMiOjZ9"
          frameborder="0"
          allowfullscreen="true"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      theme: localStorage.getItem('theme') || 'light',
    };
  },
  mounted() {
    document.body.classList.toggle('dark-theme', this.theme === 'dark');
  },
  watch: {
    theme(newValue) {
      document.body.classList.toggle('dark-theme', newValue === 'dark');
    }
  },
};
</script>

<style scoped>
.main-content {
  padding: 20px;
}

.report-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
}

.dark-theme .report-card {
  background-color: #1f2937;
  color: white;
}

.text-gray-700 {
  color: #4a5568;
}

.dark-theme .text-gray-700 {
  color: #d1d5db;
}

.export-btn {
  background-color: #2563eb;
  color: white;
}

.export-btn:hover {
  background-color: #1d4ed8;
}

.dark-theme .export-btn {
  background-color: #4b5563;
  color: white;
}

.dark-theme .export-btn:hover {
  background-color: #6b7280;
}

.iframe-container {
  position: relative;
  width: 100%;
  padding-top: 40%;
  overflow: hidden;
  height: 0;
  margin-top: 1rem;
}

.powerbi-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
