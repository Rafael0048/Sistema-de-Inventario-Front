<script setup>
import { ref, onMounted, watch } from "vue";
import { useSaleStore } from "../stores/saleStore"; 

const saleStore = useSaleStore();
const sales = ref([]);
const loading = ref(false);
const dialog = ref(false);
const dialogPayment = ref(false);
const selectedSale = ref(null);
const payment = ref({
  dolarValue: 0,
  bsValue: 0,
  method: "",
  status: "",
  date: "",
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
    await saleStore.editPayment(pay.paymentId, {
      ...pay,
      status: payment.value.status
    });

    pay.status = payment.value.status; 
    const updatedSale = saleStore.items.find(s => s.saleId === selectedSale.value.saleId);
    if (updatedSale) {
      selectedSale.value.status = updatedSale.status;
    }
    cancelEdit();
  } catch (error) {
    console.error("Error actualizando el estado:", error);
  }
};
const dolarPrice = ref(0)
const isUserTypingBs = ref(false);
const headers = [
  { title: "ID Venta", key: "saleId", align: "start" },
  { title: "Cliente", key: "clientName", align: "start" },
  { title: "Fecha", key: "date", align: "start" },
  { title: "Total", key: "totalSale", align: "end" },
  { title: "Estado", key: "status", align: "center" },
  { title: "Acciones", key: "actions", align: "center", sortable: false },
];
const payMethods = ["Efectivo", "Pago móvil", "Transferencia", "Crédito"];
const statusOptions = ["Pendiente", "Confirmado", "Parcial"];

onMounted(async () => {
  await saleStore.getItem();
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
    await saleStore.addPayment(payment.value, selectedSale.value.saleId);
    dialogPayment.value = false;

    const updatedSale = saleStore.items.find(
      (s) => s.saleId === selectedSale.value.saleId
    );

    if (updatedSale) {
      selectedSale.value = { ...updatedSale };
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


const openDetail = (sale) => {
  selectedSale.value = sale;
  dialog.value = true;
};
</script>

<template>
  <v-container fluid class="pa-6">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Ventas</h1>
        <p class="text-subtitle-2 text-grey">
          Historial de transacciones y detalles
        </p>
      </div>
    </div>

    <v-card elevation="0" class="transparent-table">
      <v-data-table
        class="custom-table"
        :headers="headers"
        :items="saleStore.items"
        :loading="loading"
        hover
      >
      

        <template #[`item.clientName`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-3">
              <span class="text-caption font-weight-bold white--text">
                {{
                  item.client?.name
                    ? item.client.name.charAt(0).toUpperCase()
                    : "C"
                }}
              </span>
            </v-avatar>
            <span class="font-weight-medium">{{
              item.client?.name || "Cliente Ocasional"
            }}</span>
          </div>
        </template>

        <template #[`item.totalSale`]="{ item }">
          <span class="font-weight-bold text-subtitle-1"
            >${{ Number(item.totalSale).toFixed(2) }}</span
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
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="650px" scrollable>
      <v-card v-if="selectedSale" rounded="xl" class="pa-2">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div>
            <span class="text-h6 font-weight-bold"
              >Detalle de Venta #{{ selectedSale.saleId }}</span
            >
            <div class="text-caption text-grey">{{ selectedSale.date }}</div>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <v-row class="mb-4 bg-grey-lighten-4 rounded-lg pa-2">
            <v-col cols="6">
              <div class="text-caption text-grey">Cliente</div>
              <div class="font-weight-medium">
                {{ selectedSale.client?.name || "N/A" }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-grey">Estado</div>
              <div class="font-weight-medium">
                {{ selectedSale.status || "N/A" }}
              </div>
            </v-col>
          </v-row>

          <div class="text-subtitle-2 font-weight-bold mb-3">
            Productos Comprados
          </div>

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
              v-for="pay in selectedSale.payments"
              :key="pay.paymentId"
              class="mb-2 border rounded-lg pa-3"
            >
              <v-list-item-title class="d-flex align-center justify-space-between pt-2">
  <div class="d-flex align-center gap-2 flex-grow-1 mr-2">
    <span>Método de Pago: <strong>{{ pay.method }}</strong> | Estado:</span>

    <span v-if="editingPaymentId !== pay.paymentId" class="font-weight-bold ml-1">
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

  <div>
    <v-btn
      v-if="editingPaymentId !== pay.paymentId"
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
            <span class="text-h6 font-weight-bold">Total Venta</span>
            <span class="text-h5 font-weight-bold text-primary"
              >${{ Number(selectedSale.totalSale).toFixed(2) }}</span
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
