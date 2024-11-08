<template>
    <div :class="['main-layout', theme]">
      <Header />
      <div class="layout-content">
        <Sidebar />
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Header from './AppHeader.vue';
  import Sidebar from './AppSidebarTeacher.vue';
  import { ref, onMounted } from 'vue';
  
  export default {
    components: {
      Header,
      Sidebar,
    },
    setup() {
      const theme = ref(localStorage.getItem('theme') || 'light');
  
      onMounted(() => {
        document.body.classList.toggle('dark-theme', theme.value === 'dark');
      });
  
      return {
        theme
      };
    },
  };
  </script>
  
  <style scoped>
  .main-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .layout-content {
    margin-top: 10vh;
    display: flex;
    flex: 1;
  }
  
  .sidebar {
    width: 250px;
  }
  
  .main-content {
    flex: 1;
    padding: 20px;
    background-color: #f9f9f9;
    margin-left: 170px;
  }
  
  .dark-theme .main-content {
    background-color: #313131;
    color: white;
  }
  
  .dark-theme .layout-content {
    background-color: #121212;
  }
  </style>
  