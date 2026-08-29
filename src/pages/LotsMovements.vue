<script setup>
import { ref, computed, onMounted,watch } from 'vue';
import { useLotStore } from '../stores/lotStore';
import { useRoute } from 'vue-router';

const route = useRoute();

const productFilter = route.query.product;
const lotStore = useLotStore();
const loading = ref(false);
const search = ref('')
const itemsPerPage = ref(10)
const filters = ref({
  search: '',
  type: null,
  userName: null,
  product : productFilter || null
});

const movementTypes = ['ENTRADA', 'VENTA', 'MERMA', 'INGRESO', 'AJUSTE'];

const headers = [
  { title: 'ID', key: 'movementId', sortable: true },
  {title : 'Producto', key:'lot.product.name',sortable:true},
  { title: 'Tipo', key: 'movementType', sortable: true },
  { title: 'Cantidad', key: 'quantity', sortable: true },
  { title: 'Motivo', key: 'motive', sortable: false },
  { title: 'Usuario', key: 'userId', sortable: true },
  { title: 'Fecha', key: 'timeStamp', sortable: true },
];
let timeoutId = null

const loadItems = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true  
  clearTimeout(timeoutId)

  timeoutId = setTimeout(async () => {
    try {
     await lotStore.getLotMovement(page,itemsPerPage,filters.value,sortBy)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      loading.value = false
    }
  }, 400) 
}




const getChipColor = (type) => {
  switch (type) {
    case 'ENTRADA':
    case 'INGRESO':
      return 'success';
    case 'VENTA':
      return 'info';
    case 'MERMA':
      return 'error';
    default:
      return 'warning';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
};
watch(filters.value,async(newVal)=>{
 await loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], filters : newVal  });
},{deep:true})


</script>

<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold primary--text">Movimientos de Inventario</h1>
          <p class="text-subtitle-1 text-medium-emphasis mb-0">Historial y trazabilidad de entradas, salidas y ajustes</p>
        </div>
        
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card border elevation="0" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="success-lighten-4" size="48" class="me-4">
              <v-icon color="success" size="28">mdi-arrow-down-bold</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Entradas</div>
              <div class="text-h5 font-weight-bold text-success">+{{ lotStore.metrics.totalEntradas }} unidades</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card border elevation="0" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="info-lighten-4" size="48" class="me-4">
              <v-icon color="info" size="28">mdi-cart-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Total Ventas</div>
              <div class="text-h5 font-weight-bold text-info">{{ lotStore.metrics.totalVentas }} unidades</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card border elevation="0" class="pa-4">
          <div class="d-flex align-center">
            <v-avatar color="error-lighten-4" size="48" class="me-4">
              <v-icon color="error" size="28">mdi-alert-circle-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-medium-emphasis">Mermas y Ajustes (-)</div>
              <div class="text-h5 font-weight-bold text-error">{{ lotStore.metrics.totalMermas }} unidades</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card border elevation="0" class="pa-4 mb-6">
      <v-row >
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.search"
            density="compact"
            variant="outlined"
            label="Buscar por motivo o usuario"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            autocomplete="off"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.type"
            :items="movementTypes"
            density="compact"
            variant="outlined"
            label="Tipo de Movimiento"
            clearable
            prepend-inner-icon="mdi-format-list-bulleted-type"
            hide-details
            autocomplete="off"
          />
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.userName"
            density="compact"
            variant="outlined"
            label="Filtrar por Usuario"
            prepend-inner-icon="mdi-account-circle-outline"
            clearable
            hide-details
            autocomplete="off"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.product"
            density="compact"
            variant="outlined"
            label="Filtrar por producto"
            prepend-inner-icon="mdi-package-variant"
            clearable
            hide-details
            autocomplete="off"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card border elevation="0">
      <v-data-table-server  class="custom-table flex-grow-1 d-flex flex-column"
        :headers="headers"
        :items="lotStore.movements"
        :loading="loading"
        :items-per-page-text="`Movimientos por página `"
        :no-data-text="`No se han encontrado movimientos `" 
        :items-length="lotStore.movementsCount"
        @update:options="loadItems"
        density="comfortable"

      >
        <template #item.movementId="{ item }">
          <span class="font-weight-medium">#{{ item.movementId }}</span>
        </template>


        <template #item.movementType="{ item }">
          <v-chip
            :color="getChipColor(item.movementType)"
            size="small"
            variant="tonal"
            class="font-weight-medium"
          >
            {{ item.movementType }}
          </v-chip>
        </template>

        <template #item.quantity="{ item }">
          <span :class="item.quantity > 0 ? 'text-success font-weight-bold' : 'text-error font-weight-bold'">
            {{ item.quantity > 0 ? `+${item.quantity}` : item.quantity }}
          </span>
        </template>

        <template #item.userId="{ item }">
          <div class="d-flex align-center">
            <v-icon size="small" class="me-1">mdi-account-circle-outline</v-icon>
            <span>{{ item.user.userName }}</span>
          </div>
        </template>

       
      </v-data-table-server>
    </v-card>
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