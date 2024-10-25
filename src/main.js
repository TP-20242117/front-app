import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const app = createApp(App);

app.use(router);
app.use(PrimeVue);
app.mount('#app');
