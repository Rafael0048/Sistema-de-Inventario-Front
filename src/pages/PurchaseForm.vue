<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useProviderStore } from '../stores/providerStore';
import { usePurchaseStore } from '../stores/purchaseStore';
import AddModal from '@/components/AddModal.vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const productStore = useProductStore();
const providerStore = useProviderStore();
const purchaseStore = usePurchaseStore();

const loading = ref(false);
const selectedProvider = ref(null);
const selectedProductInput = ref(null);

const payment = ref({
  dolarValue: 0,
  bsValue: 0,
  method: '',
  status: ''
});

const cartItems = ref([]);
const isUserTypingBs = ref(false);
const payMethods = ['Efectivo', 'Pago móvil', 'Transferencia'];
const statusOptions = ['Pendiente', 'Confirmado', 'Parcial'];
const dolarPrice = ref(0);

const formatBsOnBlur = () => {
  isUserTypingBs.value = false;
  const bs = parseFloat(payment.value.bsValue) || 0;
  payment.value.bsValue = bs.toFixed(2);
};

onMounted(async () => {
  fetch('https://ve.dolarapi.com/v1/dolares/oficial')
    .then(response => response.json())
    .then(data => {
      dolarPrice.value = data.promedio;
    })
    .catch(error => {
      console.error('Error al obtener el precio del dólar:', error);
    });

  await productStore.getItem(null, null, null, null, true);
  await providerStore.getItem();
});

const addProductToCart = (product) => {
  if (!product) return;

  const existingItem = cartItems.value.find(item => item.productId === product.productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Al comprar, tomamos el costo o precio base si existe
    const initialPrice = product.cost || product.price || 0;

    cartItems.value.push({
      productId: product.productId,
      name: product.name,
      quantity: 1,
      totalQuantity: product.quantity, // Referencia de stock actual
      price: initialPrice,
    });
  }

  selectedProductInput.value = null;
};

const removeItem = (index) => {
  cartItems.value.splice(index, 1);
};

const totalPurchase = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.quantity * item.price), 0);
});

watch(totalPurchase, (newTotal) => {
  payment.value.dolarValue = newTotal;
  payment.value.bsValue = (newTotal * dolarPrice.value).toFixed(2);
}, { immediate: true });

watch(() => payment.value.dolarValue, (newDolar) => {
  if (isUserTypingBs.value) return;
  const usd = parseFloat(newDolar) || 0;
  payment.value.bsValue = (usd * dolarPrice.value).toFixed(2);
});

watch(() => payment.value.bsValue, (newBs) => {
  if (!isUserTypingBs.value) return;
  const bs = parseFloat(newBs) || 0;
  payment.value.dolarValue = dolarPrice.value > 0
    ? parseFloat((bs / dolarPrice.value).toFixed(2))
    : 0;
});

const handleSubmit = async () => {
  if (!selectedProvider.value) return alert('Selecciona un proveedor');
  if (cartItems.value.length === 0) return alert('Agrega al menos un producto');

  loading.value = true;

  const purchasePayload = {
    date: new Date().toISOString().split('T')[0],
    totalPurchase: totalPurchase.value,
    providerId: selectedProvider.value.providerId,
    method: payment.value.method,
    status: payment.value.status,
    dolarValue: payment.value.dolarValue,
    bsValue: payment.value.bsValue,
    items: cartItems.value.map(item => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      price: item.price
    })),
    userId: authStore.activeUser.id
  };

  try {
    await purchaseStore.addItem(purchasePayload);
    
    selectedProvider.value = null;
    selectedProductInput.value = null;
    cartItems.value = [];
    payment.value = { dolarValue: 0, bsValue: 0, method: '', status: '' };
  } catch (error) {
    console.error('Error al procesar la compra:', error);
  } finally {
    loading.value = false;
  }
};

const providerFields = [
  { title: 'Nombre', value: 'name', type: 'text' },
  { title: 'Dirección', value: 'direction', type: 'text' },
  { title: 'Teléfono', value: 'phone', type: 'text' }
];
</script>

<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12" md="7" lg="8">
        <v-card class="pa-6" elevation="2" rounded="lg">
          <h2 class="text-h5 font-weight-bold mb-4">Registro de Compra a Proveedor</h2>

          <v-row>
            <v-col cols="12" sm="6">
              <v-autocomplete 
                v-model="selectedProvider"
                label="Proveedor" 
                :items="providerStore.items"
                item-title="name"
                return-object
                variant="solo-filled"
                clearable
                autocomplete="off"
              />
            </v-col>
            <v-col cols="12" md="6">
              <AddModal :fields="providerFields" :store="providerStore" :nameSpace="'Proveedor'" />
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <h3 class="text-subtitle-1 font-weight-bold mb-2">Agregar Productos</h3>
          <v-autocomplete
            v-model="selectedProductInput"
            @update:model-value="addProductToCart"
            label="Buscar y seleccionar producto..." 
            :items="productStore.items"
            item-title="name"
            return-object
            variant="solo-filled"
            prepend-inner-icon="mdi-magnify"
            clearable
            autocomplete="off"
          />

          <div class="mt-4">
            <div 
              v-for="(item, index) in cartItems" 
              :key="item.productId" 
              class="d-flex align-center ga-3 mb-3 pa-3 rounded-lg border bg-grey-lighten-5"
            >
              <div class="flex-grow-1">
                <div class="font-weight-bold text-body-1">{{ item.name }}</div>
                <div class="text-caption text-grey"> Stock actual: {{ item.totalQuantity }}</div>
                <div class="text-caption text-grey">Subtotal: ${{ (item.quantity * item.price).toFixed(2) }}</div>
              </div>

              <div style="width: 100px;">
                <v-text-field
                  v-model.number="item.quantity"
                  label="Cant."
                  type="number"
                  min="1"
                  variant="solo-filled"
                  hide-details
                />
              </div>

              <div style="width: 130px;">
                <v-text-field
                  v-model.number="item.price"
                  label="Costo U. ($)"
                  type="number"
                  step="0.01"
                  variant="solo-filled"
                  hide-details
                />
              </div>

              <v-btn 
                icon="mdi-delete-outline" 
                color="error" 
                variant="text" 
                @click="removeItem(index)" 
              />
            </div>

            <div v-if="cartItems.length === 0" class="text-center text-grey py-6 border rounded-lg">
              No hay productos agregados a esta compra.
            </div>

            <v-card-title class="mt-6 pa-0 mb-3">
              Datos del Pago Inicial
            </v-card-title>
            <v-row>
              <v-col cols="12" sm="6">
                <v-label text="Método de Pago"/>
                <v-select
                  placeholder="Seleccionar método"
                  v-model="payment.method"
                  :items="payMethods"
                  variant="solo-filled"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-label text="Monto Pagado ($)"/>
                <v-text-field
                  v-model.number="payment.dolarValue"
                  prefix="$"
                  type="number"
                  step="0.01"
                  variant="solo-filled"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-label text="Estado del Pago"/>
                <v-select
                  placeholder="Seleccionar estado"
                  v-model="payment.status"
                  :items="statusOptions"
                  variant="solo-filled"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-label text="Monto Pagado en Bolívares"/>
                <v-text-field
                  v-model="payment.bsValue"
                  prefix="Bs."
                  type="number"
                  step="0.01"
                  variant="solo-filled"
                  @focus="isUserTypingBs = true"
                  @blur="formatBsOnBlur"
                />
              </v-col>
            </v-row>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5" lg="4">
        <v-card class="pa-6 bg-grey-lighten-4" elevation="3" rounded="lg">
          <h3 class="text-h6 font-weight-bold mb-4">Resumen de Compra</h3>

          <div class="mb-4">
            <div 
              v-for="item in cartItems" 
              :key="item.productId" 
              class="d-flex justify-space-between mb-2 text-body-2"
            >
              <span>{{ item.quantity }}x {{ item.name }}</span>
              <span class="font-weight-medium">${{ (item.quantity * item.price).toFixed(2) }}</span>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-space-between align-center mb-4">
            <span class="text-h6 font-weight-medium">Total USD</span>
            <span class="text-h5 font-weight-bold text-primary">${{ totalPurchase.toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-space-between align-center mb-6">
            <span class="text-h6 font-weight-medium">Total Bs.</span>
            <span class="text-h5 font-weight-bold text-primary">Bs.{{ (totalPurchase * dolarPrice).toFixed(2) }}</span>
          </div>

          <v-btn 
            block 
            color="primary" 
            size="large" 
            rounded="pill" 
            elevation="2"
            :loading="loading"
            :disabled="cartItems.length === 0 || !selectedProvider || !payment.dolarValue || !payment.method || !payment.status"
            @click="handleSubmit"
          >
            Procesar Compra
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.border-dashed {
  border: 2px dashed #ccc;
}
</style>