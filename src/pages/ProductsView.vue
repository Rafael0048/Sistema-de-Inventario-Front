
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
onMounted(() => {
    productStore.getProducts()
})
</script>
<template>
  <TableBase :items="productStore.products" :headers="headers" />

</template>
<style scoped>

</style>