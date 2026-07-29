<script setup>
 import {ref, onMounted} from 'vue'
 import AddModal from './AddModal.vue'
 const items = ref({})
 const props = defineProps({
    
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
        },
        nameSpace : {
            type : String,
            required: true
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
    onMounted(async()=>{
        await props.store.getItem(props.father)
    })
</script>
<template>
     <v-card color="background">
            <AddModal  :fields="props.fields" :store="props.store" :fatherId="props.father" :nameSpace = "props.nameSpace" />

<v-data-table
                   class="custom-table" :items="props.store.items" :headers="props.headers" :no-data-text="`No se han encontrado ${props.nameSpace} `" :items-per-page-text="`${props.nameSpace} por página `" >
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
     .custom-table {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  background: #18181c !important; 
  overflow: hidden;
}

:deep(.v-data-table-header) {
  background-color: #202026 !important;
}

:deep(.v-data-table-header th) {
  color: #a1a1aa !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding: 16px !important;
}

/* --- FILAS Y CELDAS --- */
:deep(.v-data-table__td) {
  color: #e4e4e7 !important;
  font-size: 0.875rem !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
  padding: 14px 16px !important;
  transition: background-color 0.2s ease;
}

:deep(.v-data-table__tr:hover .v-data-table__td) {
  background-color: rgba(255, 255, 255, 0.03) !important;
}

/* --- FOOTER / PAGINACIÓN --- */
:deep(.v-data-table-footer) {
  background-color: #18181c !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #a1a1aa !important;
}
</style>