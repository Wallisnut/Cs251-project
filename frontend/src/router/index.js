import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../page/LoginPage.vue';
import SignupPage from '../page/SignupPage.vue';
import HomePage from '../page/HomePage.vue';
import AdminHome from '../page/AdminHome.vue';
import LecturerHome from '../page/LecturerHome.vue';
import NotiFication from '../page/NotiFicationPage.vue'
import Summary from '../page/Summary.vue';
import PersonalSummary from '../page/PersonalSummary.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/home', name: 'homepage', component: HomePage },
  { path: '/admin/home', name: 'adminhome', component: AdminHome }, 
  { path: '/lecturer/home', name: 'lecturerhome', component: LecturerHome },
  { path: '/StudentAttd', name: 'StudentAttd', component: () => import('../page/StudentAttd.vue') },
  {path: '/notification', component: NotiFication}, 
  { path: '/admin/home', name: 'adminhome', component: AdminHome },
  { path: '/course_summary', name: 'course_summary', component: Summary },
  { path: '/personal_summary', name: 'personal_summary', component: PersonalSummary }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
