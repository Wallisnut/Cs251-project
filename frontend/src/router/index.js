import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../page/LoginPage.vue';
import SignupPage from '../page/SignupPage.vue';
import HomePage from '../page/HomePage.vue';
import AdminHome from '../page/AdminHome.vue';
import Summary from '@/page/Summary.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/home', name: 'homepage', component: HomePage },
  { path: '/admin/home', name: 'adminhome', component: AdminHome },
  { path: '/course_summary', name: 'course_summary', component: Summary }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
