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
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(238,244,255,0.95) 100%);
  padding: 22px 18px 18px;
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  border-right: 1px solid rgba(148, 163, 184, 0.2);
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  margin: 12px 0;
}

a {
  text-decoration: none;
  color: #334155;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  transition: all 0.25s ease;
}

a i {
  margin-right: 10px;
  font-size: 18px;
}

a:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #1d4ed8;
  transform: translateX(2px);
}

.active {
  background: linear-gradient(90deg, #1f6fe5 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 8px 18px rgba(29, 78, 216, 0.18);
}

.bottom-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.toggle-theme,
.logout {
  width: 100%;
  background: linear-gradient(180deg, #1f6fe5 0%, #1d4ed8 100%);
  color: white;
  border: none;
  cursor: pointer;
  padding: 11px 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 16px rgba(29, 78, 216, 0.15);
}

.toggle-theme:hover,
.logout:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 18px rgba(29, 78, 216, 0.22);
}

.toggle-theme span {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}

.dark-theme {
  background-color: #0f172a;
  color: white;
}

.dark-theme .sidebar {
  background: linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.12);
}

.dark-theme a {
  color: #dfeaf8;
}

.dark-theme a:hover {
  background-color: rgba(96, 165, 250, 0.12);
  color: #bfdbfe;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: rgba(255, 255, 255, 0.98);
  padding: 30px 26px 24px;
  border-radius: 22px;
  text-align: center;
  width: min(420px, calc(100% - 32px));
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.modal-content h3 {
  margin: 0 0 18px;
  color: #1f2937;
  font-size: 1.5rem;
  line-height: 1.35;
}

.stars {
  margin-bottom: 18px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.stars i {
  font-size: 30px;
  color: #d1d5db;
  cursor: pointer;
  transition: transform 0.2s ease, color 0.2s ease;
}

.stars i:hover {
  transform: translateY(-1px) scale(1.05);
}

.stars i.pi-star-fill {
  color: #fbbf24;
  text-shadow: 0 4px 12px rgba(251, 191, 36, 0.35);
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

textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  outline: none;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.modal-buttons button {
  margin: 0;
  padding: 11px 18px;
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
  box-shadow: 0 10px 20px rgba(29, 78, 216, 0.22);
}

.modal-buttons button:last-child {
  background: #e2e8f0;
  color: #334155;
}

.dark-theme .modal-content {
  background: rgba(31, 41, 55, 0.98);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 22px 44px rgba(2, 6, 23, 0.35);
}

.dark-theme .modal-content h3 {
  color: #f8fafc;
}

.dark-theme textarea {
  background-color: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.dark-theme .modal-buttons button:last-child {
  background: rgba(148, 163, 184, 0.15);
  color: #f8fafc;
}
</style>
