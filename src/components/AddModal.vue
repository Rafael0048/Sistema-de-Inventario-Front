<script setup>
    import {ref} from 'vue'
    const openModal = ref(false)
    const loading = ref(false)
    const data = ref({})
    const props = defineProps({
        fields: {
            type: Array,
            required: true
        },
        store: {
            type: Object,
            required: true
        },
        nameSpace: {
             type: String,
             required: true
        },
        fatherId: {
            type : Object
        }

    })
   async function saveData(){
    try{
        loading.value = true
        if(props.fatherId){
            await props.store.addItem(data.value, props.fatherId)
        }else{
            await props.store.addItem(data.value)
        }
        loading.value = false
        openModal.value = false
    }
    catch(error){
        loading.value = false
        console.error('Error agregando un item:', error)
    }

    }
</script>
<template>
    <v-btn variant="outlined" color="primary" @click="openModal = true" class="mb-2 mt-2">Agregar</v-btn>
    <v-dialog v-model="openModal" max-width="500">
        <v-card>
            <v-card-title>Agregar {{ props.nameSpace }}</v-card-title>
            <v-card-text>
                <v-form>
                    <template v-for="field in props.fields" :key="field.value">
                        <v-label>{{ field.title }}</v-label>
                        <v-text-field variant="solo-filled"  v-model="data[field.value]"  :type="field.type" />

                    </template>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error"  @click="openModal = false">Cancelar</v-btn>
                <v-btn color="success" variant="outlined" @click="saveData()" :loading="loading">Guardar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style scoped>

</style>