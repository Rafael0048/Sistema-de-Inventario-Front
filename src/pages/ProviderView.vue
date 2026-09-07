
<script setup>
import { useProviderStore } from '../stores/providerStore'
import {ref, onMounted} from 'vue'
import TableBase from '@/components/TableBase.vue'
import { useAuthStore } from '../stores/authStore'
import { usePurchaseStore } from '../stores/purchaseStore'
const authStore = useAuthStore()
const providerStore = useProviderStore()
const purchaseStore = usePurchaseStore()
const headers = ref([
    { title: 'ID', value: 'providerId' },
    { title: 'Nombre', value: 'name' },
    { title: 'Dirección', value: 'direction' },
    { title: 'Teléfono', value: 'phone' },
    {title : 'Compras', value: 'purchases'},
    {title : 'Deuda', value: 'debt'},
   authStore.hasRole('Administrador')?{title : 'Acciones', value: 'actions'}:{}
])
const fields = ref([
    { title: 'Nombre', value: 'name', type: 'text' },
    { title: 'Dirección', value: 'direction', type: 'text' },
    { title: 'Teléfono', value: 'phone', type: 'text' },
])

const subTableHeaders = ref([
    { title: 'ID', value: 'purchaseId' },
    { title: 'Estado', value: 'status' },
    { title: 'Fecha de compra', value: 'date' },
    {title : 'Total de la venta', value: 'totalPurchase'},
  authStore.hasRole('Administrador')?{title : 'Acciones', value: 'actions'}:{}
])


onMounted(() => {
    providerStore.getItem()
})
</script>
<template>
  <TableBase :items="providerStore.items" :headers="headers" :fields = "fields" :store="providerStore"  :nameSpace="'Proveedores'" :subTableHeaders="subTableHeaders" :subNameSpace="'Compras'" :subStore="purchaseStore"  />

</template>
<style scoped>

</style>