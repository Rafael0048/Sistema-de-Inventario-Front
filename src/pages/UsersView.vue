
<script setup>
import {useUserStore} from '../stores/userStore'
import {ref, onMounted} from 'vue'
import TableBase from '@/components/TableBase.vue'
import { useAuthStore } from '../stores/authStore'
const userStore = useUserStore()
const authStore = useAuthStore()
const headers = ref([
    { title: 'ID', value: 'userId' },
    { title: 'Nombre', value: 'name' },
    { title: 'Usuario', value: 'userName' },
    {title : 'Rol', value: 'role'},
    authStore.hasRole('Administrador')?{title : 'Acciones', value: 'actions'}:{}
])
const fields = ref([
    { title: 'Usuario', value: 'userName', type: 'text' },
    { title: 'Nombre', value: 'name', type: 'text' },
    { title: 'Contraseña', value: 'password', type: 'password' },
    {title : 'Rol', value: 'role', type: 'select', options: ['Administrador', 'Vendedor']},
])

onMounted(() => {
    userStore.getItem()
})
</script>
<template>
  <TableBase :items="userStore.items" :headers="headers" :fields = "fields" :store="userStore"  :nameSpace="'Usuarios'" />

</template>
<style scoped>

</style>