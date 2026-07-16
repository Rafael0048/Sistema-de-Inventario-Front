<script setup>
 import {ref, onMounted} from 'vue'
 import AddModal from './AddModal.vue'
 const props = defineProps({
        items: {
            type: Array,
            required: true
        },
        headers: {
            type: Array,
            required: true
        },
        fields: {
            type: Array,
            required: true
        },
        store: {
            type: Object,
            required: true
        },
        subTableHeaders: {
            type: Array,
        },
        father : {
            type : Object,
            required : true
        }
       
    })
    
    function editItemModal(item){
        data.value = item
        openModal.value = true
    }
    function deleteItemModal(item){
        data.value = item
        openDeleteModal.value = true
    }

    async function editItem(item){
        try{
            await props.store.editItem(item)
            loading.value = false
            openModal.value = false
        }catch(error){
            console.error('Error editando un item:', error)
            loading.value = false
            openModal.value = false
        }
    }
    async function deleteItem(item){
        try{
            await props.store.deleteItem(item)
            loading.value = false
            openDeleteModal.value = false
        }catch(error){
            console.error('Error eliminando un item:', error)
            loading.value = false
            openDeleteModal.value = false
        }
    }
</script>
<template>
     <v-card >
            <AddModal  :fields="props.fields" :store="props.store" :fatherId="props.father"/>

<v-data-table
                    :items="props.items" :headers="props.headers">
                    <template v-slot:item.actions="{ item }">
                        <v-hover v-slot="{ isHovering, props }" >
                        <v-btn icon @click="editItemModal(item)" :color="isHovering ? 'primary' : undefined" v-bind="props">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        </v-hover>
                        <v-hover v-slot="{ isHovering, props }" >
                        <v-btn icon @click="deleteItemModal(item)" :color="isHovering ? 'error' : undefined" v-bind="props">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        </v-hover>
                    </template>
                   
                </v-data-table>
                </v-card>  
</template>
<style scoped>

</style>