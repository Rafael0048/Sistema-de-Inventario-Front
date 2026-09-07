
<script setup>
import {useProductStore} from '@/stores/productStore'
import {ref, onMounted, computed} from 'vue'
import TableBase from '@/components/TableBase.vue'
import { useLotStore } from '../stores/lotStore'
import { useAuthStore } from '../stores/authStore'
import {useProviderStore} from '@/stores/providerStore'
const providerStore = useProviderStore()
const authStore = useAuthStore()
const lotStore = useLotStore()
const productStore = useProductStore()
const providers = computed(() => 
  (providerStore.items || []).map(p => ({
    title: p.name || p.providerName, // Ajusta según la propiedad de tu modelo
    value: p.providerId || p.id
  }))
);

const headers = ref([
    { title: 'ID', value: 'productId' },
    { title: 'Nombre', value: 'name' },
    { title: 'Altura', value: 'height' },
    { title: 'Ancho', value: 'width' },
    { title: 'Largo', value: 'length' },
    { title: 'Precio', value: 'price' },
    {title : 'Cantidad' , value: 'quantity'},
    { title: 'Lote', value: 'lot' },
  authStore.hasRole('Administrador')?{title : 'Acciones', value: 'actions'}:{}
])
const fields = ref([
    { title: 'Nombre', value: 'name', type: 'text' },
    { title: 'Altura', value: 'height', type: 'text' },
    { title: 'Ancho', value: 'width', type: 'text' },
    { title: 'Largo', value: 'length', type: 'text' }
])
const subTableHeaders = ref([
    { title: 'ID', value: 'lotId' },
    {title : 'Proveedor', value: 'provider.name'},
    { title: 'Cantidad inicial', value: 'initialQuantity' },
    { title: 'Cantidad actual', value: 'actualQuantity' },
    { title: 'Estado', value: 'status' },
    { title: 'Fecha de compra', value: 'date' },
    {title : 'Precio', value: 'price'},
  authStore.hasRole('Administrador')?{title : 'Acciones', value: 'actions'}:{}
])
const subFields = computed(() => [
  { title: 'Cantidad', value: 'quantity', type: 'number' },
  { title: 'Fecha de compra', value: 'date', type: 'date' },
  { title: 'Precio', value: 'price', type: 'number' },
  { 
    title: 'Proveedor', 
    value: 'providerId', 
    type: 'select', 
    options: providers.value 
  }
]);
onMounted(async () => {
  await productStore.getItem()
  await providerStore.getItem()
})
</script>
<template>
  <TableBase :items="productStore.items" :headers="headers" :fields = "fields" :store="productStore" :subTableHeaders="subTableHeaders" :nameSpace="'Productos'" :subNameSpace="'Lotes'" :subFields="subFields" :subStore="lotStore" />

</template>
<style scoped>

</style>