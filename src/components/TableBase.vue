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

</script>

<template>
    <div>

        <v-card class="pa-2">
            <v-card-title class="text-center text-uppercase">{{ props.nameSpace }}</v-card-title>
            <div class="pa-4">
                <AddModal  :fields="props.fields" :store="props.store" :nameSpace="props.nameSpace" />
            </div>
                <v-data-table
                  :items="props.items" :headers="props.headers" :no-data-text="`No se han encontrado ${props.nameSpace} `" :items-per-page-text="`${props.nameSpace} por página `">
                    <template v-slot:item.actions="{ item }">
                        <v-hover v-slot="{ isHovering, props }" >
                        <v-btn variant="plain" icon @click="editItemModal(item)" :color="isHovering ? 'primary' : undefined" v-bind="props">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        </v-hover>
                        <v-hover v-slot="{ isHovering, props }" >
                        <v-btn variant="plain" icon @click="deleteItemModal(item)" :color="isHovering ? 'error' : undefined" v-bind="props">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        </v-hover>
                    </template>
                    <template v-slot:item.lot="{ item }">
                        <v-btn variant="tonal" @click="()=>{viewSubTable(item.lot); subTableFather = item} ">Ver lotes</v-btn>
                    </template>
                </v-data-table>
        </v-card>
         <v-dialog v-model="openModal" max-width="500">
            <v-card>
                <v-card-title>Editar {{ data.name }}</v-card-title>
                <v-card-text>
                    <v-form>
                       <v-text-field v-for="field in props.fields" :key="field.value" v-model="data[field.value]" :label="field.title" :type="field.type" />
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="openModal = false">Cancelar</v-btn>
                    <v-btn color="primary" @click="editItem(data)" :loading="loading.value">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
         <v-dialog v-model="openDeleteModal" max-width="500">
            <v-card>
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
            <v-card>
                <v-card-title>{{ props.subNameSpace }} de {{ subTableFather.name }}</v-card-title>
                <v-card-text>
                    <SubTable :items="subTableData" :headers="subTableHeaders" :store="props.subStore" :fields="props.subFields" :father="subTableFather" :nameSpace=" props.subNameSpace"  />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="openSubTableModal = false">Cerrar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
                 
</template>

<style scoped>
 
    

</style>