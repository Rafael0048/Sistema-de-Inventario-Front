<template>
  <v-app>
    <v-app-bar color="primary">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>My files</v-toolbar-title>
      
      <template v-if="$vuetify.display.mdAndUp">
        <v-btn icon="mdi-magnify" variant="text"></v-btn>
        <v-btn icon="mdi-filter" variant="text"></v-btn>
      </template>
      <v-btn icon="mdi-dots-vertical" variant="text"></v-btn>
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
    </v-navigation-drawer>

    <v-main>
      <router-view class="h-dvh" />
      <AlertModal/>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import AlertModal from './components/AlertModal.vue';
const drawer = ref(false) 
const items = ref([
  { title: 'Home', icon: 'mdi-home' , to:'/' },
  { title: 'Productos', icon: 'mdi-information', to:'/productos' },
  { title: 'Login', icon: 'mdi-phone', to:'/login' },
    { title: 'Clientes', icon: 'mdi-ticket', to:'/clientes' },
])
</script>