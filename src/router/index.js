import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/LoginForm.vue';
import Register from '../components/RegisterForm.vue';
import RegisterTeacher from '../components/RegisterTeacher.vue';
import Tests from '../components/TestGrid.vue';
import MainLayout from '../components/MainLayout.vue';
import StroopTask from '../components/StroopTask.vue';
import CPTTask from '../components/ContinuousPerformanceTask.vue';
import StopSignalTask from '../components/StopSignalTask.vue';
import Profile from '../components/AppProfile.vue';
import Faq from '../components/AppFAQ.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/register-teacher',
    name: 'register-teacher',
    component: RegisterTeacher,
  },
  {
    path: '/tests',
    component: MainLayout,
    children: [
      {
        path: '',
        name: '/Tests',
        component: Tests,
      },
      {
        path: '/stroop',
        name: 'StroopTask',
        component: StroopTask,
      },
      {
        path: '/cpt',
        name: 'CPTTask',
        component: CPTTask,
      },
      {
        path: '/stop-signal',
        name: 'StopSignalTask',
        component: StopSignalTask,
      },
      {
        path: '/profile',
        name: 'Profile',
        component: Profile,
      },
      {
        path: '/faq',
        name: 'FAQ',
        component: Faq,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
