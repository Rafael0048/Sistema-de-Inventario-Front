<script setup>
   import {ref, onMounted} from 'vue'
   import {useProductStore} from '@/stores/productStore.js'
   import AddModal from '@/components/AddModal.vue'
    const props = defineProps({
        items: {
            type: Array,
            required: true
        },
        headers: {
            type: Array,
            required: true
        }
    })
  
</script>

<template>
    <v-card>
        <v-card-title>Table Test</v-card-title>
            <AddModal />
            <v-data-table
                :items="props.items" :headers="props.headers">
                <template v-slot:item.actions="{ item }">
                    <v-btn icon>
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon>
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </template>
                <template v-slot:item.lot="{ item }">
                    <v-btn>Ver lotes</v-btn>
                </template>
            </v-data-table>
    </v-card>
</template>

<style scoped>
 
    

</style>