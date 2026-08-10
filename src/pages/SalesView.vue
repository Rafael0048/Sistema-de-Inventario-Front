<script setup>
import { ref, onMounted } from 'vue';
import { useSaleStore } from '../stores/saleStore'; // Tu store de ventas

const saleStore = useSaleStore();

// Estados
const sales = ref([]);
const loading = ref(false);
const dialog = ref(false);
const selectedSale = ref(null);

// Encabezados para la tabla
const headers = [
    { title: 'ID Venta', key: 'saleId', align: 'start' },
    { title: 'Cliente', key: 'clientName', align: 'start' },
    { title: 'Fecha', key: 'date', align: 'start' },
    { title: 'Total', key: 'totalSale', align: 'end' },
    { title: 'Acciones', key: 'actions', align: 'center', sortable: false }
];

onMounted(async () => {
    await saleStore.getItem()
});



// Abrir el modal con el detalle de la venta seleccionada
const openDetail = (sale) => {
    selectedSale.value = sale;
    dialog.value = true;
};
</script>

<template>
    <v-container fluid class="pa-6">
        <!-- Encabezado de la Sección -->
        <div class="d-flex justify-space-between align-center mb-6">
            <div>
                <h1 class="text-h4 font-weight-bold">Ventas</h1>
                <p class="text-subtitle-2 text-grey">Historial de transacciones y detalles</p>
            </div>
            <v-btn color="primary" prepend-icon="mdi-refresh" variant="tonal" @click="fetchSales">
                Actualizar
            </v-btn>
        </div>

        <!-- Tabla de Ventas (Estilo Cards Flotantes) -->
        <v-card elevation="0" class="transparent-table">
            <v-data-table
                class="custom-table"
                :headers="headers"
                :items="saleStore.items"
                :loading="loading"
                hover
            >
                <!-- Formato para ID -->
                <template #[`item.saleId`]="{ item }">
                    <span class="font-weight-bold text-primary">#{{ item.saleId }}</span>
                </template>

                <!-- Formato para Cliente -->
                <template #[`item.clientName`]="{ item }">
                    <div class="d-flex align-center">
                        <v-avatar color="primary" size="32" class="mr-3">
                            <span class="text-caption font-weight-bold white--text">
                                {{ item.client?.name ? item.client.name.charAt(0).toUpperCase() : 'C' }}
                            </span>
                        </v-avatar>
                        <span class="font-weight-medium">{{ item.client?.name || 'Cliente Ocasional' }}</span>
                    </div>
                </template>

                <!-- Formato para Total -->
                <template #[`item.totalSale`]="{ item }">
                    <span class="font-weight-bold text-subtitle-1">${{ Number(item.totalSale).toFixed(2) }}</span>
                </template>

                <!-- Botón de Acción para Ver Detalle -->
                <template #[`item.actions`]="{ item }">
                    <v-btn 
                        icon="mdi-eye-outline" 
                        variant="text" 
                        color="primary" 
                        density="comfortable" 
                        @click="openDetail(item)"
                    />
                </template>
            </v-data-table>
        </v-card>

        <!-- MODAL / DIALOG: Detalle de la Venta -->
        <v-dialog v-model="dialog" max-width="650px" scrollable>
            <v-card v-if="selectedSale" rounded="xl" class="pa-2">
                <!-- Cabecera del Modal -->
                <v-card-title class="d-flex justify-space-between align-center pa-4">
                    <div>
                        <span class="text-h6 font-weight-bold">Detalle de Venta #{{ selectedSale.saleId }}</span>
                        <div class="text-caption text-grey">{{ selectedSale.date }}</div>
                    </div>
                    <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
                </v-card-title>

                <v-divider></v-divider>

                <!-- Cuerpo del Modal -->
                <v-card-text class="pa-4">
                    <!-- Resumen del Cliente y Pago -->
                    <v-row class="mb-4 bg-grey-lighten-4 rounded-lg pa-2">
                        <v-col cols="6">
                            <div class="text-caption text-grey">Cliente</div>
                            <div class="font-weight-medium">{{ selectedSale.client?.name || 'N/A' }}</div>
                        </v-col>
                        
                    </v-row>

                    <!-- Lista de Productos Asociados -->
                    <div class="text-subtitle-2 font-weight-bold mb-3">Productos Comprados</div>
                    
                    <v-list class="pa-0">
                        <v-list-item
                            v-for="mov in selectedSale.productosAsociados"
                            :key="mov.saleMid"
                            class="mb-2 border rounded-lg pa-3"
                        >
                            <template #prepend>
                                <v-avatar color="grey-lighten-3" rounded="lg" class="mr-3">
                                    <v-icon color="primary">mdi-cube-outline</v-icon>
                                </v-avatar>
                            </template>

                            <v-list-item-title class="font-weight-bold">
                                {{ mov.product?.name || `Producto #${mov.productId}` }}
                            </v-list-item-title>
                            
                            <v-list-item-subtitle class="text-caption">
                                Cantidad: <strong>{{ mov.quantity }}</strong> | Lote consumido: <strong>#{{ mov.lotId }}</strong>
                            </v-list-item-subtitle>

                            <template #append>
                                <span class="font-weight-bold text-body-2">${{ Number(mov.subTotal).toFixed(2) }}</span>
                            </template>
                        </v-list-item>
                    </v-list>

                    <v-divider class="my-4"></v-divider>
                    <div class="text-subtitle-2 font-weight-bold mb-3">Pagos Relacionados</div>
                    
                    <v-list class="pa-0">
                        <v-list-item
                            v-for="pay in selectedSale.payments"
                            :key="pay.paymentId"
                            class="mb-2 border rounded-lg pa-3"
                        >
                            
                            <v-list-item-title class="font-weight-bold">
                               Método de Pago: <span>{{ pay.method }} </span> | Estado del Pago: <span>{{ pay.status }} </span> 
                            </v-list-item-title>
                            
                            <v-list-item-subtitle class="text-caption">
                                Cantidad Pagada: <strong>${{ pay.dolarValue }}</strong> | Cantidad en Bolivares: <strong>Bs.{{ pay.bsValue }}</strong>
                            </v-list-item-subtitle>

                            
                        </v-list-item>
                    </v-list>
                    <v-divider class="my-4"></v-divider>

                    <!-- Total Final -->
                    <div class="d-flex justify-space-between align-center">
                        <span class="text-h6 font-weight-bold">Total Venta</span>
                        <span class="text-h5 font-weight-bold text-primary">${{ Number(selectedSale.totalSale).toFixed(2) }}</span>
                    </div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
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