import{ createRouter, createWebHistory} from 'vue-router' ;
import Login from './page/LoginPage.vue'
import Homepage from './page/HomePage.vue'
import Home from './page/NewHomePage.vue'

const routes = [
    {path: '/login', component: Login},
    {path: '/homepage', component: Homepage},
    {path: '/home', component: Home}
];


const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router ;