<script setup>
   import {ref, onMounted} from 'vue'
   import {useProductStore} from '@/stores/productStore.js'
   import AddModal from '@/components/AddModal.vue'
   import SubTable from '@/components/SubTable.vue'
   const openModal = ref(false)
   const openDeleteModal = ref(false)
   const data = ref({})
   const loading = ref(false)
   const subTableData = ref([])
   const openSubTableModal = ref(false)
    const search = ref('')
    const itemsPerPage = ref(10)
   const subTableFather = ref({})
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
        nameSpace:{
            type: String,
            required: true
        },
        subNameSpace:{
            type: String,
        },
        subFields: {
            type: Array
        },
        subStore : {
            type : Object
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
    function viewSubTable(item){

        subTableData.value = item
        openSubTableModal.value = true
    }
  

let timeoutId = null


const loadItems = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true  
  clearTimeout(timeoutId)

  timeoutId = setTimeout(async () => {
    try {
     await props.store.getItem(page,itemsPerPage,search,sortBy)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      loading.value = false
    }
  }, 400) 
}

</script>

<template>
    <div >

        <v-card color="background" class="pa-2 h-100 d-flex flex-column">
            <v-card-title class="text-center text-uppercase">
                {{ props.nameSpace }}
            </v-card-title>
            
            <div class="pa-4 d-flex align-center justify-space-between">
                <AddModal :fields="props.fields" :store="props.store" :nameSpace="props.nameSpace" />
                <v-text-field append-inner-icon="mdi-magnify" max-width="350px" label="Buscar" v-model="search" variant="solo-filled" hide-details density="compact"/>
            </div>
                
            

            <v-data-table-server 
                class="custom-table flex-grow-1 d-flex flex-column"
                :items="props.items" 
                :headers="props.headers" 
                :no-data-text="`No se han encontrado ${props.nameSpace} `" 
                :items-per-page-text="`${props.nameSpace} por página `"
                density="comfortable"
                :items-length="props.store.itemCount"
                :loading="loading"
                :search="search"
                @update:options="loadItems"
            >
            
                <template v-slot:item.actions="{ item }">
                    <v-hover v-slot="{ isHovering, props }">
                        <v-btn variant="plain" icon @click="editItemModal(item)" :color="isHovering ? 'primary' : undefined" v-bind="props">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                    </v-hover>
                    <v-hover v-slot="{ isHovering, props }">
                        <v-btn variant="plain" icon @click="deleteItemModal(item)" :color="isHovering ? 'error' : undefined" v-bind="props">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-hover>
                </template>

                <template v-slot:item.lot="{ item }">
                    <v-btn variant="tonal" @click="()=>{viewSubTable(item.lot); subTableFather = item}">Ver lotes</v-btn>
                </template>
            </v-data-table-server>
        </v-card>

        <!-- Modales -->
        <v-dialog v-model="openModal" max-width="500">
            <v-card>
                <v-card-title>Editar {{ data.name }}</v-card-title>
                <v-card-text>
                    <v-form>
                        <template v-for="field in props.fields" :key="field.value">
                            <v-label>
                                {{ field.title }}
                            </v-label>
                            <v-text-field   v-model="data[field.value]" :placeholder="field.title" :type="field.type" variant="solo-filled"/>
                        </template>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" @click="openModal = false">Cancelar</v-btn>
                    <v-btn color="success" variant="outlined" @click="editItem(data)" :loading="loading.value">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="openDeleteModal" max-width="500">
            <v-card >
                <v-card-title>Eliminar {{ data.name }}</v-card-title>
                <v-card-text>
                    <p>¿Estás seguro de que quieres eliminar este elemento?</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="openDeleteModal = false">Cancelar</v-btn>
                    <v-btn color="error" variant="outlined" @click="deleteItem(data)" :loading="loading.value">Eliminar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="openSubTableModal" max-width="800">
            <v-card color="background">
                <v-card-title>{{ props.subNameSpace }} de {{ subTableFather.name }}</v-card-title>
                <v-card-text>
                    <SubTable :items="subTableData" :headers="subTableHeaders" :store="props.subStore" :fields="props.subFields" :father="subTableFather" :nameSpace="props.subNameSpace" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" variant="outlined" @click="openSubTableModal = false">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
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