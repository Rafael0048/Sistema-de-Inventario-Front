<script setup>
    import { useAlertStore } from '../stores/alertStore';
    const alertStore = useAlertStore()
   
</script>
<template>
    <v-dialog v-model="alertStore.alertStatus.openAlert" max-width="400">
        <v-card :color="alertStore.alertStatus.alertType">
            <v-card-title >
                {{ alertStore.alertStatus.title }}
            </v-card-title>
            <v-card-text >
                {{ alertStore.alertStatus.text }}
            </v-card-text>
            <v-card-actions>
                <v-btn variant="tonal" @click="alertStore.alertStatus.openAlert= false">
                    Aceptar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style scoped>

</style>