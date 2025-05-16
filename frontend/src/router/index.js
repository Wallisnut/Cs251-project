import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../page/LoginPage.vue';
import SignupPage from '../page/SignupPage.vue';
import HomePage from '../page/HomePage.vue';
import AdminHome from '../page/AdminHome.vue';
import Notification from '../page/NotiFicationPage.vue';
import NotificationProf from '../page/NotiFicationProf.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/home', name: 'homepage', component: HomePage },
  { path: '/admin/home', name: 'adminhome', component: AdminHome },
  { path: '/notification', name: 'notificationPage', component: Notification },
  { path: '/notificationProf', name: 'notificationProf', component: NotificationProf } 
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
