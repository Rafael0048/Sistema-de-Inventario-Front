import { createRouter, createWebHistory } from 'vue-router'
import Products from '../pages/ProductsView.vue'
import Clients from '../pages/ClientesView.vue'
import Login from '../pages/Login.vue'
import Home from '../pages/Home.vue'
import SalesForm from '../pages/SalesForm.vue'
import SalesView from '../pages/SalesView.vue'
import UsersView from '../pages/UsersView.vue'
import LotsMovements from '../pages/LotsMovements.vue'
import { useAuthStore } from '../stores/authStore.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/productos',
      name: 'Productos',
      component: Products,
      meta: { requiresAuth: true, roles: ['Vendedor', 'Administrador'] }
    },
    {
      path: '/clientes',
      name: 'Clientes',
      component: Clients,
      meta: { requiresAuth: true, roles: ['Vendedor', 'Administrador'] }
    },
    {
      path: '/registrarVenta',
      name: 'RegistrarVenta',
      component: SalesForm,
      meta: { requiresAuth: true, roles: ['Vendedor', 'Administrador'] }
    },
    {
      path: '/ventas',
      name: 'Ventas',
      component: SalesView,
      meta: { requiresAuth: true, roles: ['Vendedor', 'Administrador'] }
    },
    {
      path: '/usuarios',
      name: 'Usuarios',
      component: UsersView,
      meta: { requiresAuth: true, roles: ['Administrador'] } 
    },
    {
      path : '/movimientos',
      component : LotsMovements,
      meta: { requiresAuth: true, roles: ['Administrador'] },

    }
  ]
})

// Guardia global de navegación
router.beforeEach((to, from) => {
  const authStore = useAuthStore()

  // 1. Si intenta ir al Login teniendo la sesión activa, se envía a Home
  if (to.name === 'Login' && authStore.isAuthenticated) {
    return { name: 'Home' }
  }

  // 2. Si la ruta requiere autenticación y el usuario no está logueado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login' }
  }

  // 3. Si la ruta requiere roles específicos y el usuario no posee el rol
  if (to.meta.roles && !authStore.hasRole(to.meta.roles)) {
    return { name: 'Home' }
  }

  // 4. Si todo está correcto, no retornas nada (o retornas true) para permitir la navegación
  return true
})

export default router