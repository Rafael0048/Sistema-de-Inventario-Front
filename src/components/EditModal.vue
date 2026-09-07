<script setup>
    import {ref} from 'vue'
    const modelValue = defineModel({ type: Boolean, default: false });
    const loading = ref(false)
    const props = defineProps({
        data : {
            type : Object,
            required : true
        },
        fields : {
            type : Array,
            required : true
        },
        store : {
                type : Object,
                required: true
            }
        
    })
    async function editItem(item){
        try{
            await props.store.editItem(item)
            loading.value = false
            modelValue.value = false
        }catch(error){
            console.error('Error editando un item:', error)
            loading.value = false
            modelValue.value = false
        }
    }
</script>
<template>
  <v-dialog v-model="modelValue" max-width="500">
            <v-card>
                <v-card-title>Editar {{ props.data.name }}</v-card-title>
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
                    <v-btn color="error" @click="modelValue = false">Cancelar</v-btn>
                    <v-btn color="success" variant="outlined" @click="editItem(data)" :loading="loading.value">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
</template>