<script setup>
import { ref, onMounted, watch } from "vue";
import { usePurchaseStore } from "../stores/purchaseStore";
import { useAuthStore } from '../stores/authStore'
import { useRoute } from 'vue-router';
const authStore = useAuthStore()
const purchaseStore = usePurchaseStore();
const loading = ref(false);
const dialog = ref(false);
const dialogPayment = ref(false);
const selectedPurchase = ref(null);
const route = useRoute();

const productFilter = route.query.product;
const providerFilter = route.query.provider;
let timeoutId = '';
const payment = ref({
  dolarValue: 0,
  bsValue: 0,
  method: "",
  status: "",
  date: "",
});
const filters = ref({
  search: '',
  product :  productFilter || null,
  provider : providerFilter || null
});
const editingPaymentId = ref(null); 

const startEdit = (pay) => {
  editingPaymentId.value = pay.paymentId;
  payment.value.status = pay.status; 
};

const cancelEdit = () => {
  editingPaymentId.value = null;
};

const saveStatus = async (pay) => {
  try {
    await purchaseStore.editPayment(pay.providerPaymentId, {
      ...pay,
      status: payment.value.status
    });

    pay.status = payment.value.status; 
    const updatedPurchase = purchaseStore.items.find(p => p.purchaseId === selectedPurchase.value.purchaseId);
    if (updatedPurchase) {
        
      selectedPurchase.value.status = updatedPurchase.status;
    }
    cancelEdit();
  } catch (error) {
    console.error("Error actualizando el estado:", error);
  }
};
const itemsPerPage = ref(10)

const dolarPrice = ref(0)
const isUserTypingBs = ref(false);
const headers = [
  { title: "ID Compra", key: "purchaseId", align: "start" },
  { title: "Proveedor", key: "provider.name", align: "start" },
  { title: "Fecha", key: "date", align: "start" },
  { title: "Total", key: "totalPurchase", align: "end" },
  { title: "Estado", key: "status", align: "center" },
  { title: "Acciones", key: "actions", align: "center", sortable: false },
];
const payMethods = ["Efectivo", "Pago móvil", "Transferencia", "Crédito"];
const statusOptions = ["Pendiente", "Confirmado", "Parcial"];

onMounted(async () => {
  fetch('https://ve.dolarapi.com/v1/dolares/oficial')
        .then(response => response.json())
        .then(data => {
            dolarPrice.value = data.promedio; 
        })
        .catch(error => {
            console.error('Error al obtener el precio del dólar:', error);
        });
});
watch(
  () => payment.value.dolarValue,
  (newDolar) => {
    if (isUserTypingBs.value) return; 

    const usd = parseFloat(newDolar) || 0;
    payment.value.bsValue = (usd * dolarPrice.value).toFixed(2);
  },
);

watch(
  () => payment.value.bsValue,
  (newBs) => {
    if (!isUserTypingBs.value) return;

    const bs = parseFloat(newBs) || 0;
    payment.value.dolarValue =
      dolarPrice.value > 0 ? parseFloat((bs / dolarPrice.value).toFixed(2)) : 0;
  },
);
const formatBsOnBlur = () => {
  isUserTypingBs.value = false;
  const bs = parseFloat(payment.value.bsValue) || 0;
  payment.value.bsValue = bs.toFixed(2);
};

async function addPayment() {
  try {
    console.log(selectedPurchase.value);
    await purchaseStore.addPayment(payment.value, selectedPurchase.value);
    dialogPayment.value = false;

    const updatedPurchase = purchaseStore.items.find(
      (p) => p.purchaseId === selectedPurchase.value.purchaseId
    );

    if (updatedPurchase) {
      selectedPurchase.value = { ...updatedPurchase };
    }

    payment.value = {
      dolarValue: 0,
      bsValue: "0.00",
      method: "Efectivo",
      status: "Confirmado",
      date: new Date().toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("Error al registrar el pago:", error);
  }
}


const openDetail = (purchase) => {
  selectedPurchase.value = purchase;
  dialog.value = true;
};

const loadItems = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true  
  clearTimeout(timeoutId)

  timeoutId = setTimeout(async () => {
    try {
     await purchaseStore.getItem(null,page,itemsPerPage,filters.value,sortBy)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      loading.value = false
    }
  }, 400) 
}
watch(filters.value,async(newVal)=>{
 await loadItems({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], filters : newVal  });
},{deep:true})
</script>

<template>
  <v-container fluid class="pa-6">
      
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Compras</h1>
        <p class="text-subtitle-2 text-grey">
          Historial de transacciones y detalles
        </p>
      </div>
    </div>
    <v-card border elevation="0" class="pa-4 mb-6">
      <v-row >
        <v-col cols="12" sm="6" md="6">
          <v-text-field
            v-model="filters.provider"
            density="compact"
            variant="outlined"
            label="Buscar por nombre de proveedor"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            autocomplete="off"
          />
        </v-col>

    
       
        <v-col cols="12" sm="6" md="6">
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

    <v-card elevation="0" class="transparent-table">
      <v-data-table-server 
        class="custom-table"
        :headers="headers"
        :items="purchaseStore.items"
        :loading="loading"
        :no-data-text="`No se han encontrado compras `" 
                :items-per-page-text="`Compras por página `"
                density="comfortable"
                :items-length="purchaseStore.itemCount"
                @update:options="loadItems"
        hover
      >
      

        <template #[`item.provider.name`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-3">
              <span class="text-caption font-weight-bold white--text">
                {{
                  item.provider?.name
                    ? item.provider.name.charAt(0).toUpperCase()
                    : "C"
                }}
              </span>
            </v-avatar>
            <span class="font-weight-medium">{{
              item.provider?.name || "Proveedor Ocasional"
            }}</span>
          </div>
        </template>

        <template #[`item.totalPurchase`]="{ item }">
          <span class="font-weight-bold text-subtitle-1"
            >${{ Number(item.totalPurchase).toFixed(2) }}</span
          >
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn
            icon="mdi-eye-outline"
            variant="text"
            color="primary"
            density="comfortable"
            @click="openDetail(item)"
          />
        </template>
      </v-data-table-server >
    </v-card>

    <v-dialog v-model="dialog" max-width="650px" scrollable>
      <v-card v-if="selectedPurchase" rounded="xl" class="pa-2">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div>
            <span class="text-h6 font-weight-bold"
              >Detalle de Compra #{{ selectedPurchase.purchaseId }}</span
            >
            <div class="text-caption text-grey">{{ selectedPurchase.date }}</div>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-row class="mb-4 bg-grey-lighten-4 rounded-lg pa-2">
            <v-col cols="6">
              <div class="text-caption text-grey">Proveedor</div>
              <div class="font-weight-medium">
                {{ selectedPurchase.provider?.name || "N/A" }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">Estado</div>
              <div class="font-weight-medium">
                {{ selectedPurchase.status || "N/A" }}
              </div>
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mb-3">
            Productos Comprados
          </div>

          <v-list class="pa-0">
            <v-list-item
              v-for="mov in selectedPurchase.movements"
              :key="mov.purchaseMid"
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
                Cantidad: <strong>{{ mov.quantity }}</strong> | Lote consumido:
                <strong>#{{ mov.lotId }}</strong>
              </v-list-item-subtitle>

              <template #append>
                <span class="font-weight-bold text-body-2"
                  >${{ Number(mov.subTotal).toFixed(2) }}</span
                >
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-4"></v-divider>
          <div class="text-subtitle-2 font-weight-bold mb-3">
            Pagos Relacionados
          </div>

          <v-list class="pa-0">
            <v-list-item
              v-for="pay in selectedPurchase.payments"
              :key="pay.paymentId"
              class="mb-2 border rounded-lg pa-3"
            >
              <v-list-item-title class="d-flex align-center justify-space-between pt-2">
  <div class="d-flex align-center gap-2 flex-grow-1 mr-2">
    <span>Método de Pago: <strong>{{ pay.method }}</strong> | Estado:</span>

    <span v-if="editingPaymentId !== pay.paymentId " class="font-weight-bold ml-1">
      {{ pay.status }}
    </span>

    <v-select
      v-else
      v-model="payment.status"
      :items="statusOptions"
      variant="outlined"
      density="compact"
      hide-details
      class="max-w-200 ml-2"
    />
  </div>

  <div v-if="authStore.hasRole('Administrador')">
    <v-btn
      v-if="editingPaymentId !== pay.paymentId "
      icon="mdi-pencil"
      variant="text"
      color="primary"
      density="comfortable"
      @click="startEdit(pay)"
    />

    <div v-else class="d-flex align-center">
      <v-btn
        icon="mdi-check"
        variant="text"
        color="success"
        density="comfortable"
        @click="saveStatus(pay)"
      />
      <v-btn
        icon="mdi-close"
        variant="text"
        color="error"
        density="comfortable"
        @click="cancelEdit"
      />
    </div>
  </div>
</v-list-item-title>

              <v-list-item-subtitle class="text-caption pt-2">
                Cantidad Pagada: <strong>${{ pay.dolarValue }}</strong> |
                Cantidad en Bolivares: <strong>Bs.{{ pay.bsValue }}</strong>
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption pt-2">
                Fecha del pago: <strong>{{ pay.date }}</strong>
              </v-list-item-subtitle>


            </v-list-item>
          </v-list>
          <v-btn
            variant="outlined"
            color="primary"
            class="mt-4"
            @click="dialogPayment = true"
            >Agregar Pago</v-btn
          >
          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-bold">Total Compra</span>
            <span class="text-h5 font-weight-bold text-primary"
              >${{ Number(selectedPurchase.totalPurchase).toFixed(2) }}</span
            >
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogPayment" max-width="650px" scrollable>
      <v-card title="Agregar Pago " class="pa-6">
        <v-label text="Método de Pago" />

        <v-select
          v-model="payment.method"
          :items="payMethods"
          variant="solo-filled"
        />
        <v-label text="Estado del Pago" />

        <v-select
          v-model="payment.status"
          :items="statusOptions"
          variant="solo-filled"
        />
        <v-label text="Fecha del Pago" />

        <v-text-field
          v-model="payment.date"
          type="date"
          variant="solo-filled"
        />
        <v-label text="Monto Pagado" />

        <v-text-field
          v-model.number="payment.dolarValue"
          type="number"
          step="0.01"
          variant="solo-filled"
        />
        <v-label text="Monto Pagado en Bolivares" />

        <v-text-field
          v-model="payment.bsValue"
          type="number"
          step="0.01"
          variant="solo-filled"
          @focus="isUserTypingBs = true"
          @blur="formatBsOnBlur"
        />
        <v-card-actions class="d-flex justify-end">
          <v-btn variant="text" color="primary" @click="dialogPayment = false"
            >Cancelar</v-btn
          >
          <v-btn variant="outlined" color="primary" @click="addPayment"
            >Agregar Pago</v-btn
          >
        </v-card-actions>
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
