<template>
    <div :class="['sidebar', theme]">
      <ul>
        <li>
          <router-link to="/dashboard" exact-active-class="active" exact>
            <i class="pi pi-home"></i> Menú Principal
          </router-link>
        </li>
        <li>
          <router-link to="/profile" exact-active-class="active" exact>
            <i class="pi pi-user"></i> Perfil
          </router-link>
        </li>
        <li>
          <router-link to="/tests-alumnos" exact-active-class="active" exact>
            <i class="pi pi-users"></i> Alumnos
          </router-link>
        </li>
        <li>
          <router-link to="/faq" exact-active-class="active" exact>
            <i class="pi pi-question-circle"></i> Preguntas Frecuentes
          </router-link>
        </li>
        <li>
          <router-link to="/compare-students" exact-active-class="active" exact>
            <i class="pi pi-chart-line"></i> Comparar Alumnos
          </router-link>
        </li>
      </ul>
      <div class="bottom-section">
        <button class="toggle-theme" @click="toggleTheme">
          <span><i class="pi" :class="themeIcon"></i></span>
        </button>
        <button class="logout" @click="exit"><i class="pi pi-sign-out"></i> Salir</button>
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
    computed: {
      themeIcon() {
        return this.theme === 'dark' ? 'pi-sun' : 'pi-moon';
      },
    },
    methods: {
      toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.theme);
        document.body.classList.toggle('dark-theme', this.theme === 'dark');
      },
      exit(){
        this.$router.push({ name: 'Login' });
      }
    },
    mounted() {
      document.body.classList.toggle('dark-theme', this.theme === 'dark');
    },
  };
  </script>
  
  <style scoped>
  .sidebar {
    height: auto;
    width: 220px;
    background-color: #dddddd;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    margin: 25px 0;
  }
  
  a {
    text-decoration: none;
    color: #333;
    font-size: 16px;
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 10px;
    transition: background-color 0.3s, color 0.3s;
  }
  
  a i {
    margin-right: 10px;
    font-size: 20px;
  }
  
  a:hover {
    background-color: #e0f0ff;
    color: #007efe;
  }
  
  .active {
    background-color: #007efe;
    color: white;
  }
  
  .bottom-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .toggle-theme,
  .logout {
    background: #007efe;
    color: white;
    border: none;
    cursor: pointer;
    margin-top: 20px;
    padding: 10px;
    width: 100%;
    border-radius: 10px;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  .toggle-theme:hover,
  .logout:hover {
    background-color: #005bb5;
  }
  
  .toggle-theme span {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }
  
  .dark-theme {
    background-color: #121212;
    color: white;
  }
  
  .dark-theme .sidebar {
    background-color: #1e1e1e;
  }
  
  .dark-theme a {
    color: #ddd;
  }
  
  .dark-theme a:hover {
    background-color: #333;
  }
  </style>
  