<script setup>
import {ref} from 'vue'
    const modelValue = defineModel({ type: Boolean, default: false });
    const loading = ref(false)
    const props = defineProps({
        data : {
            type : Object,
            required : true
        },
        store : {
                type : Object,
                required: true
            }
        
    })
     async function deleteItem(item){
        try{
            await props.store.deleteItem(item)
            loading.value = false
            modelValue.value = false
        }catch(error){
            console.error('Error eliminando un item:', error)
            loading.value = false
            modelValue.value = false
        }
    }
</script>
<template>
    <v-dialog v-model="modelValue" max-width="500">
            <v-card >
                <v-card-title>Eliminar {{ data.name }}</v-card-title>
                <v-card-text>
                    <p>¿Estás seguro de que quieres eliminar este elemento?</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="modelValue = false">Cancelar</v-btn>
                    <v-btn color="error" variant="outlined" @click="deleteItem(data)" :loading="loading.value">Eliminar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
</template>