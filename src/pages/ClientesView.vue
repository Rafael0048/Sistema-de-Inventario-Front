
<script setup>
import { useClientStore } from '../stores/clientStore'
import {ref, onMounted} from 'vue'
import TableBase from '@/components/TableBase.vue'
const clientStore = useClientStore()
const headers = ref([
    { title: 'ID', value: 'clientId' },
    { title: 'Nombre', value: 'name' },
    { title: 'Apellido', value: 'lastName' },
    { title: 'Teléfono', value: 'phone' },
    { title: 'Identificación', value: 'identification' },
    {title : 'Acciones', value: 'actions'}
])
const fields = ref([
    { title: 'Nombre', value: 'name', type: 'text' },
    { title: 'Apellido', value: 'lastName', type: 'text' },
    { title: 'Teléfono', value: 'phone', type: 'text' },
    { title: 'Identificación', value: 'identification', type: 'text' }
])

onMounted(() => {
    clientStore.getItem()
})
</script>
<template>
  <TableBase :items="clientStore.items" :headers="headers" :fields = "fields" :store="clientStore"  :nameSpace="'Clientes'" />

</template>
<style scoped>

</style>