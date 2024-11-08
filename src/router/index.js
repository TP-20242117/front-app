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
import salones from '../components/ClassRooms.vue';
import IndividualClassRooms from '../components/IndividualClassRooms.vue';
import MainLayoutTeacher from '../components/MainLayoutTeacher.vue';
import StudentsTest from '../components/StudentsTest.vue';
import DashboardApp from '../components/DashboardApp.vue';
import CompareStudents from '../components/CompareStudents.vue';
import ProfileEducator from '../components/AppProfileEducator.vue';
import FaqEducator from '../components/AppFAQEducator.vue';

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
  {
    path: '/professor',
    component: MainLayoutTeacher,
    children: [
      {
        path: '/salones',
        name: 'salones',
        component: salones,
      },
      {
        path: '/salon/:name',
        name: 'IndividualClassRooms',
        component: IndividualClassRooms,
        props: true, 
      },
      {
        path: '/tests-alumnos',
        name: 'tests-alumnos',
        component: StudentsTest,
      },
      {
        path: '/profile-educator',
        name: 'Profile-educator',
        component: ProfileEducator,
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardApp,
      },
      {
        path: '/compare-students',
        name: 'compare-students',
        component: CompareStudents,
      },
      {
        path: '/faq-educator',
        name: 'FAQEducator',
        component: FaqEducator,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
