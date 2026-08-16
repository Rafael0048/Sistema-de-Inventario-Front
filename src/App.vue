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
      <v-list >
        <v-list-item
            v-for="(item, index) in items"
            :key="index"
            :title="item.title"
            :prepend-icon="item.icon"
            :to="item.to"
          />
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
      <router-view class="h-dvh " />
      <AlertModal/>
    </v-main>
  </v-app>
  <v-dialog v-model="openModal" max-width="500" >
    <v-card class="pa-4">
      <v-card-title>
        ¿Realmente quieres salir?
      </v-card-title>
      <v-card-actions>
        <v-btn variant="outlined" color="primary" @click="openModal=false">
          Cancelar
        </v-btn>
        <v-btn variant="tonal" color="error" @click="logOut()">
          Salir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <AlertModal></AlertModal>
</template>

<script setup>
import { ref } from 'vue'
import AlertModal from './components/AlertModal.vue';
import router from '@/router'
import { useAlertStore } from './stores/alertStore.js';
const alertStore = useAlertStore()
const drawer = ref(true) 
const items = ref([
  { title: 'Home', icon: 'mdi-home' , to:'/' },
  { title: 'Productos', icon: 'mdi-information', to:'/productos' },
  { title: 'Login', icon: 'mdi-login-variant', to:'/login' },
  { title: 'Clientes', icon: 'mdi-card-account-details', to:'/clientes' },
  { title: 'Vender', icon: 'mdi-store-plus', to:'/registrarVenta' },
    { title: 'Ventas', icon: 'mdi-cash-register', to:'/ventas' },
    { title: 'Usuarios', icon: 'mdi-account-group', to:'/usuarios' },


])
const openModal = ref(false)
function logOut(){
  localStorage.clear('userToken')
  alertStore.showAlert('success',`Se ha cerrado la sesion`, '')
  openModal.value = false
  router.push('/login')



}
</script>