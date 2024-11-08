<template>
  <div :class="['main-content', theme]">
    
    
    <div :class="['report-card', theme]">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Reporte de Test Recientes</h2>
        
      </div>

      <div class="iframe-container">
        <iframe
          class="powerbi-iframe"
          src="https://app.powerbi.com/view?r=eyJrIjoiZGIwMGZjMTAtNmViYS00Mzk1LWE2OTktOThiNWM0N2IwZDRmIiwidCI6IjBlMGNiMDYwLTA5YWQtNDlmNS1hMDA1LTY4YjliNDlhYTFmNiIsImMiOjR9"
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
