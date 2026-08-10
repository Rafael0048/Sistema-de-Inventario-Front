/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Products from '../pages/ProductsView.vue'
import Clients from '../pages/ClientesView.vue'
import Login from '../pages/Login.vue'
import Home from '../pages/Home.vue'
import SalesForm from '../pages/SalesForm.vue'
import SalesView from '../pages/SalesView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path : '/login',
      component : Login
    },
    {
      path : '/productos',
      component : Products
    },
    {
      path : '/clientes',
      component : Clients
    },
    {
      path : '/registrarVenta',
      component : SalesForm
    },
    {
      path :'/ventas',
      component : SalesView
    }
  ],
})

export default router
