
<script setup>
import {useProductStore} from '@/stores/productStore'
import {ref, onMounted} from 'vue'
import TableBase from '@/components/TableBase.vue'
const productStore = useProductStore()
const headers = ref([
    { title: 'ID', value: 'productId' },
    { title: 'Nombre', value: 'name' },
    { title: 'Altura', value: 'height' },
    { title: 'Ancho', value: 'width' },
    { title: 'Largo', value: 'length' },
    { title: 'Precio', value: 'price' },
    { title: 'Lote', value: 'lot' },
    {title : 'Acciones', value: 'actions'}
])
const fields = ref([
    { title: 'Nombre', value: 'name', type: 'text' },
    { title: 'Altura', value: 'height', type: 'text' },
    { title: 'Ancho', value: 'width', type: 'text' },
    { title: 'Largo', value: 'length', type: 'text' }
])
const subTableHeaders = ref([
    { title: 'ID', value: 'lotId' },
    { title: 'Cantidad', value: 'quantity' },
    { title: 'Fecha de compra', value: 'date' },
    {title : 'Precio', value: 'price'}
])
const subFields = ref([
    { title: 'Cantidad', value: 'quantity', type: 'number' },
    { title: 'Fecha de compra', value: 'date', type: 'date'  },
    {title : 'Precio', value: 'price', type: 'number'}
])
onMounted(() => {
    productStore.getItem()
})
</script>
<template>
  <TableBase :items="productStore.products" :headers="headers" :fields = "fields" :store="productStore" :subTableHeaders="subTableHeaders" :nameSpace="'Productos'" :subNameSpace="'Lotes'" :subFields="subFields" />

</template>
<style scoped>

</style>