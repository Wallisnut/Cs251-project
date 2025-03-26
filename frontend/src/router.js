import{ createRouter, createWebHistory} from 'vue-router' ;
import Login from './page/Homepage.vue'
import Homepage from './page/Homepage.vue'

const routes = [
    {path: '/login', component: Login},
    {path: '/homepage', component: Homepage}
];


const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router ;