import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../page/LoginPage.vue';
import SignupPage from '../page/SignupPage.vue';
import HomePage from '../page/HomePage.vue';
import AdminHome from '../page/AdminHome.vue';
import LecturerHome from '../page/LecturerHome.vue';
import NotiFication from '../page/NotiFicationPage.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/home', name: 'homepage', component: HomePage },
  { path: '/admin/home', name: 'adminhome', component: AdminHome }, 
  { path: '/lecturer/home', name: 'lecturerhome', component: LecturerHome },
  { path: '/StudentAttd', name: 'StudentAttd', component: () => import('../page/StudentAttd.vue') },
  {path: '/notification', component: NotiFication}, 
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
