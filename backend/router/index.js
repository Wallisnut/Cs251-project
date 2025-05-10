import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../../frontend/src/page/LoginPage.vue';
import SignupPage from '../../frontend/src/page/SignupPage.vue';
import HomePage from '../../frontend/src/page/HomePage.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/home', name: 'homepage', component: HomePage  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
