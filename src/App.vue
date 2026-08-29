<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Sistema de Inventario y Ventas</v-toolbar-title>
      
      <template v-if="$vuetify.display.mdAndUp">
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      :location="$vuetify.display.mobile ? 'bottom' : undefined"
    >
      <v-list>
        <template v-for="(item, index) in items" :key="index">
          <v-list-item
            v-if="authStore.hasRole(item.requiredRole)"
            :title="item.title"
            :prepend-icon="item.icon"
            :to="item.to"
          />
        </template>
      </v-list>

      <template #append>
        <div class="pa-4">
          <v-btn
            prepend-icon="mdi-logout"
            color="error"
            variant="tonal"
            block
            @click="openModal = true"
          >
            Salir
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view class="h-dvh" />
      <AlertModal />
    </v-main>

    <v-dialog v-model="openModal" max-width="500">
      <v-card class="pa-4">
        <v-card-title>
          ¿Realmente quieres salir?
        </v-card-title>
        <v-card-actions>
          <v-btn variant="outlined" color="primary" @click="openModal = false">
            Cancelar
          </v-btn>
          <v-btn variant="tonal" color="error" @click="logOut">
            Salir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import AlertModal from './components/AlertModal.vue'
import router from '@/router'
import { useAlertStore } from './stores/alertStore.js'
import { useAuthStore } from './stores/authStore.js'

const authStore = useAuthStore()
const alertStore = useAlertStore()

const drawer = ref(true)
const openModal = ref(false)

const items = ref([
  { title: 'Home', icon: 'mdi-home', to: '/', requiredRole: ['Vendedor', 'Administrador'] },
  { title: 'Productos', icon: 'mdi-information', to: '/productos', requiredRole: ['Vendedor', 'Administrador'] },
  { title: 'Clientes', icon: 'mdi-card-account-details', to: '/clientes', requiredRole: ['Vendedor', 'Administrador'] },
  { title: 'Vender', icon: 'mdi-store-plus', to: '/registrarVenta', requiredRole: ['Vendedor', 'Administrador'] },
  { title: 'Ventas', icon: 'mdi-cash-register', to: '/ventas', requiredRole: ['Vendedor', 'Administrador'] },
  { title: 'Movimientos', icon: 'mdi-account-group', to: '/movimientos', requiredRole: 'Administrador' },
  { title: 'Usuarios', icon: 'mdi-account-group', to: '/usuarios', requiredRole: 'Administrador' },
])

function logOut() {
  authStore.logout()
  openModal.value = false
  router.push('/login')
}
</script>