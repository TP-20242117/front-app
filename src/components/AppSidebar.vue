<template>
  <div :class="['sidebar', theme]">
    <ul>
      <li>
        <router-link to="/tests" exact-active-class="active" exact>
          <i class="pi pi-home"></i> Mis Pruebas
        </router-link>
      </li>
      <li>
        <router-link to="/profile" exact-active-class="active" exact>
          <i class="pi pi-user"></i> Perfil
        </router-link>
      </li>
      <li>
        <router-link to="/faq" exact-active-class="active" exact>
          <i class="pi pi-question-circle"></i> Preguntas Frecuentes
        </router-link>
      </li>
    </ul>
    <div class="bottom-section">
      <button class="toggle-theme" @click="toggleTheme">
        <span><i class="pi" :class="themeIcon"></i></span>
      </button>
      <button class="logout" @click="showModal = true"><i class="pi pi-sign-out"></i> Salir</button>
    </div>
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>¿Cómo calificarías tu experiencia?</h3>
        <div class="stars">
          <i
            v-for="star in 5"
            :key="star"
            class="pi"
            :class="rating >= star ? 'pi-star-fill' : 'pi-star'"
            @click="setRating(star)"
          ></i>
        </div>
        <textarea v-model="suggestion" placeholder="¿Alguna sugerencia?"></textarea>
        <div class="modal-buttons">
          <button @click="submitFeedback">Enviar</button>
          <button @click="cancelFeedback">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import feedbackService from "/services/feedback";
export default {
  data() {
    return {
      theme: localStorage.getItem('theme') || 'light',
      showModal: false,
      rating: 0,
      suggestion: '',
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
    setRating(star) {
      this.rating = star;
    },
    submitFeedback() {
      const feedbackData = {
              rating: parseInt(this.rating),
              comment: this.suggestion,
              studentId: parseInt(localStorage.getItem("studentId"))
            } 
      feedbackService.createFeedback(feedbackData);
      this.closeAndLogout();
    },
    cancelFeedback() {
      this.showModal = false;
      this.rating = 0;
      this.suggestion = '';
    },
    closeAndLogout() {
      localStorage.clear();
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
  height: 90vh;
  width: 220px;
  background-color: #dddddd;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  width: 300px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.modal-content h3 {
  margin-bottom: 20px;
}

.stars {
  margin-bottom: 20px;
}

.stars i {
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
  margin: 0 5px;
}

.stars i.pi-star-fill {
  color: #ffc107;
}

textarea {
  width: 100%;
  height: 80px;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  resize: none;
}

.modal-buttons button {
  margin: 0 10px;
  padding: 10px 15px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.modal-buttons button:first-child {
  background-color: #007efe;
  color: white;
}

.modal-buttons button:last-child {
  background-color: #ccc;
}

.dark-theme .modal-content {
  background-color: #2c2c2c;
  color: white;
}

.dark-theme textarea {
  background-color: #444;
  color: white;
  border: 1px solid #666;
}
</style>
