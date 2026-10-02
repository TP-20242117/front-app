<template>
  <div :class="['sidebar', theme]">
    <ul>
      <li>
        <router-link to="/dashboard" exact-active-class="active" exact>
          <i class="pi pi-home"></i> Menú Principal
        </router-link>
      </li>
      <li>
        <router-link to="/profile-educator" exact-active-class="active" exact>
          <i class="pi pi-user"></i> Perfil
        </router-link>
      </li>
      <li>
        <router-link to="/tests-alumnos" exact-active-class="active" exact>
          <i class="pi pi-users"></i> Alumnos
        </router-link>
      </li>
      <li>
        <router-link to="/salones" exact-active-class="active" exact>
          <i class="pi pi-building"></i> Salones
        </router-link>
      </li>
      <li>
        <router-link to="/faq-educator" exact-active-class="active" exact>
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
import emitter from '@/eventBus'; 

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
      emitter.emit('theme-changed', this.theme);
    },
    setRating(star) {
      this.rating = star;
    },
    submitFeedback() {
      const feedbackData = {
              rating: parseInt(this.rating),
              comment: this.suggestion,
              educatorId: parseInt(localStorage.getItem("id"))
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
  z-index: 20;
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
  inset: 0;
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: rgba(244, 246, 249, 0.98);
  padding: 28px 26px 22px;
  border-radius: 24px;
  text-align: center;
  width: min(520px, calc(100% - 28px));
  box-shadow: 0 28px 48px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.modal-content h3 {
  margin: 0 0 18px;
  color: #1f2937;
  font-size: clamp(1.8rem, 3vw, 2.3rem);
  line-height: 1.25;
  font-weight: 600;
}

.stars {
  margin-bottom: 18px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.stars i {
  font-size: 32px;
  color: #d1d5db;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease, filter 0.2s ease;
}

.stars i:hover {
  transform: translateY(-1px) scale(1.05);
}

.stars i.pi-star-fill {
  color: #fbbf24;
  filter: drop-shadow(0 6px 14px rgba(251, 191, 36, 0.28));
}

textarea {
  width: 100%;
  min-height: 96px;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 18px;
  border: 1px solid #dbe3f0;
  resize: none;
  font: inherit;
  background: #f8fbff;
  color: #1f2937;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

textarea::placeholder {
  color: #64748b;
}

textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.modal-buttons button {
  margin: 0;
  min-width: 140px;
  padding: 12px 22px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.modal-buttons button:hover {
  transform: translateY(-1px);
}

.modal-buttons button:first-child {
  background: linear-gradient(180deg, #1f6fe5 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 12px 24px rgba(29, 78, 216, 0.22);
}

.modal-buttons button:last-child {
  background: #e2e8f0;
  color: #334155;
}

.dark-theme .modal-content {
  background: rgba(49, 49, 49, 0.96);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 28px 48px rgba(2, 6, 23, 0.38);
}

.dark-theme .modal-content h3 {
  color: #f8fafc;
}

.dark-theme textarea {
  background-color: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.dark-theme textarea::placeholder {
  color: #cbd5e1;
}

.dark-theme .modal-buttons button:last-child {
  background: rgba(148, 163, 184, 0.15);
  color: #f8fafc;
}

.dark-theme .stars i {
  color: rgba(255, 255, 255, 0.35);
}

.dark-theme .stars i.pi-star-fill {
  color: #fbbf24;
}
</style>
