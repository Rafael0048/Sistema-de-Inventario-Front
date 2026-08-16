<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useClientStore } from '../stores/clientStore';
import { useSaleStore } from '../stores/saleStore';
import AddModal from '@/components/AddModal.vue';
const productStore = useProductStore();
const clientStore = useClientStore();
const saleStore = useSaleStore()
const loading = ref(false)
// Formularios
const selectedClient = ref(null);
const payMethod = ref('Efectivo');
const selectedProductInput = ref(null); // Producto seleccionado temporalmente en el combo
const payment = ref({
    dolarValue : 0,
    bsValue : 0,
    // method : '',
    // status : ''
})
// Lista de ítems en el carrito/resumen
const cartItems = ref([]);
const formatBsOnBlur = () => {
  isUserTypingBs.value = false;
  const bs = parseFloat(payment.value.bsValue) || 0;
  payment.value.bsValue = bs.toFixed(2);
};
// Opciones de Stores
const payMethods = ['Efectivo', 'Pago móvil', 'Transferencia', 'Crédito'];
const dolarPrice = ref(0); 
const statusOptions = ['Pendiente', 'Confirmado' , 'Parcial']
onMounted(async () => {
    fetch('https://ve.dolarapi.com/v1/dolares/oficial')
        .then(response => response.json())
        .then(data => {
            dolarPrice.value = data.promedio; // Guardamos el precio del dólar
        })
        .catch(error => {
            console.error('Error al obtener el precio del dólar:', error);
        });
    await productStore.getItem();
    await clientStore.getItem();
});


// Función para agregar el producto al carrito con sus campos editables
const addProductToCart = (product) => {
    if (!product) return;

    // Verificar si ya está en el carrito para no duplicar filas
    const existingItem = cartItems.value.find(item => item.productId === product.productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Obtenemos el precio sugerido (si el producto no trae precio se puede poner 0 o el del lote más reciente)
        const initialPrice = product.price || 0; 
        
        cartItems.value.push({
            productId: product.productId,
            name: product.name,
            quantity: 1,
            totalQuantity : product.quantity,
            price: initialPrice,
        });
    }

    // Limpiar el combobox de selección
    selectedProductInput.value = null;
};

// Eliminar ítem del carrito
const removeItem = (index) => {
    cartItems.value.splice(index, 1);
};

// Cálculo en tiempo real del Total de la Venta
const totalSale = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.quantity * item.price), 0);
});
watch(totalSale, (newTotal)=>{
    payment.value.dolarValue = newTotal
})

const isUserTypingBs = ref(false);

// 1. Si cambia el total de la venta -> actualizar ambos campos
watch(totalSale, (newTotal) => {
  payment.value.dolarValue = newTotal;
  payment.value.bsValue = (newTotal * dolarPrice.value).toFixed(2);
}, { immediate: true });

// 2. Si cambia el Dólar (y no estamos escribiendo manualmente en Bs) -> actualizar Bolívares
watch(() => payment.value.dolarValue, (newDolar) => {
  if (isUserTypingBs.value) return; // No interrumpe si se está escribiendo en Bs

  const usd = parseFloat(newDolar) || 0;
  payment.value.bsValue = (usd * dolarPrice.value).toFixed(2);
});

// 3. Al cambiar los Bolívares -> recalcular Dólares libremente sin formatear la cadena de Bs
watch(() => payment.value.bsValue, (newBs) => {
  if (!isUserTypingBs.value) return;

  const bs = parseFloat(newBs) || 0;
  payment.value.dolarValue = dolarPrice.value > 0 
    ? parseFloat((bs / dolarPrice.value).toFixed(2)) 
    : 0;
});
// Función para enviar la venta a la API
const handleSubmit = async () => {
    loading.value = true
    if (!selectedClient.value) return alert('Selecciona un cliente');
    if (cartItems.value.length === 0) return alert('Agrega al menos un producto');

    const salePayload = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        totalSale: totalSale.value,
        clientId: selectedClient.value.clientId,
        method : payment.value.method,
        status : payment.value.status,
        dolarValue : payment.value.dolarValue,
        bsValue: payment.value.bsValue,
        items: cartItems.value.map(item => ({
            productId: item.productId,
            lotId: item.lotId,
            quantity: Number(item.quantity),
            price: item.price
        }))
    };
    await saleStore.addItem(salePayload)
    loading.value = false
    selectedClient.value = null
    selectedProductInput.value = null
    cartItems.value.length = 0;  
    
// Aquí invocas tu endpoint/store: await salesStore.createSale(salePayload);
};
const clientsFields = [
    { title: 'Nombre', value: 'name', type: 'text' },
    { title: 'Apellido', value: 'lastName', type: 'text' },
    { title: 'Teléfono', value: 'phone', type: 'text' },
    { title: 'Identificación', value: 'identification', type: 'text' }
] 
</script>

<template>
    <v-container fluid class="pa-4">
        <v-row>
            <!-- COLUMNA IZQUIERDA: Formulario Principal -->
            <v-col cols="12" md="7" lg="8">
                <v-card class="pa-6" elevation="2" rounded="lg">
                    <h2 class="text-h5 font-weight-bold mb-4">Registro de Venta</h2>

                    <!-- Información del Cliente -->
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-autocomplete 
                                v-model="selectedClient"
                                label="Cliente" 
                                :items="clientStore.items"
                                item-title="name"
                                return-object
                                variant="solo-filled"
                                clearable
                                autocomplete = "off"
                                />
                        </v-col>
                        <v-col cols="12" md="6">
                            <AddModal :fields="clientsFields" :store="clientStore" :nameSpace="'Cliente'" />
                        </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <!-- Selector de Productos -->
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
                        autocomplete = "off"

                    />

                    <!-- Lista Editable de Productos Agregados -->
                    <div class="mt-4">
                        <div 
                            v-for="(item, index) in cartItems" 
                            :key="item.productId" 
                            class="d-flex align-center ga-3 mb-3 pa-3 rounded-lg border bg-grey-lighten-5"
                        >
                            <!-- Detalle del Producto -->
                            <div class="flex-grow-1">
                                <div class="font-weight-bold text-body-1">{{ item.name }}</div>
                                <div  class="text-caption text-grey"> Cantidad en inventario: {{ item.totalQuantity }}</div>
                                <div class="text-caption text-grey">Subtotal: ${{ (item.quantity * item.price).toFixed(2) }}</div>
                            </div>

                            <!-- Input Cantidad -->
                            <div style="width: 100px;">
                                <v-text-field
                                    v-model.number="item.quantity"
                                    label="Cant."
                                    type="number"
                                    min="1"
                                    :max="item.totalQuantity"
                                    variant="solo-filled"
                                    hide-details
                                />
                            </div>

                            <!-- Input Precio -->
                            <div style="width: 120px;">
                                <v-text-field
                                    v-model.number="item.price"
                                    label="Precio ($)"
                                    type="number"
                                    step="0.01"
                                    variant="solo-filled"
                                    hide-details
                                />
                            </div>

                            <!-- Botón Eliminar -->
                            <v-btn 
                                icon="mdi-delete-outline" 
                                color="error" 
                                variant="text" 
                                @click="removeItem(index)" 
                            />
                        </div>

                        <div v-if="cartItems.length === 0" class="text-center text-grey py-6 border rounded-lg">
                            No hay productos agregados a esta venta.
                        </div>

                        <v-card-title class="mt-6">
                            Datos del Pago
                        </v-card-title>
                        <v-row>
                            <v-col cols="12" sm="6">
                            <v-label text="Método de Pago"/>
                                
                            <v-select
                                placeholder="Pago movil"
                                v-model="payment.method"
                                :items="payMethods"
                                variant="solo-filled"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-label text="Monto Pagado"/>
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
                                placeholder="Pagado"
                                v-model="payment.status"
                                :items="statusOptions"
                                variant="solo-filled"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                        <v-label text="Monto Pagada en Bolívares"/>

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

            <!-- COLUMNA DERECHA: Resumen de Pago (Estilo Summary Card) -->
            <v-col cols="12" md="5" lg="4">
                <v-card class="pa-6 bg-grey-lighten-4" elevation="3" rounded="lg">
                    <h3 class="text-h6 font-weight-bold mb-4">Resumen</h3>

                    <!-- Lista simplificada del Resumen -->
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

                    <!-- Total -->
                    <div class="d-flex justify-space-between align-center mb-6">
                        <span class="text-h6 font-weight-medium">Total</span>
                        <span class="text-h5 font-weight-bold text-primary">${{ totalSale.toFixed(2) }}</span>
                    </div>
                     <div class="d-flex justify-space-between align-center mb-6">
                        <span class="text-h6 font-weight-medium">Total Bs.</span>
                        <span class="text-h5 font-weight-bold text-primary">Bs.{{ (totalSale * dolarPrice).toFixed(2) }}</span>
                    </div>

                    <!-- Botón de Confirmación -->
                    <v-btn 
                        block 
                        color="primary" 
                        size="large" 
                        rounded="pill" 
                        elevation="2"
                        :loading="loading"
                        :disabled="cartItems.length === 0 || !selectedClient||!payment.dolarValue|!payment.method||payment.status"
                        @click="handleSubmit"
                    >
                        Procesar Venta
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