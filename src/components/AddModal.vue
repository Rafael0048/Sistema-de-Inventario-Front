<script setup>
    import {ref} from 'vue'
    const openModal = ref(false)

</script>
<template>
    <v-btn color="primary" @click="openModal = true">Agregar</v-btn>
    <v-dialog v-model="openModal" max-width="500">
        <v-card>
            <v-card-title>Agregar Producto</v-card-title>
            <v-card-text>
                <v-form>
                    <v-text-field label="Nombre" required></v-text-field>
                    <v-text-field label="Altura" required></v-text-field>
                    <v-text-field label="Ancho" required></v-text-field>
                    <v-text-field label="Largo" required></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="openModal = false">Cancelar</v-btn>
                <v-btn color="primary">Guardar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style scoped>

</style>