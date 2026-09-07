import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useProductStore } from './productStore'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
import { useAuthStore } from './authStore'

export const useLotStore = defineStore('lot', () => {
  const url = '/productos/stock'
  const alertStore = useAlertStore()
  const producStore = useProductStore()
  const authStore = useAuthStore()

  const items = ref([])
  const movements = ref([])
  const movementsCount = ref(0)
  const metrics = ref({})
  async function getItem(father) {
    try {
      const response = await apiCall('get', `${url}/${father.productId}`)

      items.value = response.data
    } catch (error) {
      alertStore.showAlert('error', error.message, 'Fallo al obtener los lotes')
    }
  }

  async function addItem(item, fatherId) {
    try {
      item.productId = fatherId.productId
      item.initialQuantity = Number(item.quantity)
      item.actualQuantity = Number(item.quantity)
      item.price = Number(item.price)
      item.userId = authStore.activeUser.id

      await apiCall('post', url, item)
      await getItem(fatherId)
      await producStore.getItem()
      alertStore.showAlert('success', `Se ha agregado el lote al producto ${fatherId.name}`, 'Lote agregado correctamente')
    } catch (error) {
      alertStore.showAlert('error', error.message, 'Fallo al agregar el lote')
    }
  }

  async function editItem(item) {
    try {
      item.userId = authStore.activeUser.id
      await apiCall('put', `${url}/${item.lotId}`, item)
      await getItem({ productId: item.productId })
      await producStore.getItem()

      alertStore.showAlert('success', `Se ha editado el lote`, 'Lote editado correctamente')
    } catch (error) {
      alertStore.showAlert('error', error.message, 'Fallo al editar el lote')
    }
  }

  async function deleteItem(item) {
    try {
      await apiCall('delete', `${url}/${item.lotId}`)
      await getItem({ productId: item.productId })
      alertStore.showAlert('success', `Se ha eliminado el lote`, 'Lote eliminado correctamente')
    } catch (error) {
      alertStore.showAlert('error', error.message, 'Fallo al eliminar el lote')
    }
  }

 
  async function getLotMovement(page,itemsPerPage,filters,sortBy) {
    try {
      
      const params ={
                page : page,
                itemsPerPage: itemsPerPage,
                search : filters.search,
                movementType : filters.type,
                userName: filters.userName,
                product : filters.product,
                sortBy : sortBy
            }
      const response = await apiCall('get', `${url}/movements`,params)
      movements.value = response.data.rows
      metrics.value = response.data.metrics
      movementsCount.value = response.data.count
      return 
    } catch (error) {
      console.log(error)
      alertStore.showAlert('error', error.message, 'Fallo al obtener los movimientos')
    }
  }

  async function adjustStock(lotId, adjustData) {
    try {
      const payload = {
        ...adjustData,
        userId: authStore.activeUser.id
      }
      const response = await apiCall('post', `${url}/adjust/${lotId}`, payload)
      alertStore.showAlert('success', 'El ajuste de inventario se ha registrado correctamente', 'Ajuste completado')
      return response.data
    } catch (error) {
      alertStore.showAlert('error', error.message, 'Fallo al ajustar el stock')
    }
  }

  return {
    items,
    movements,
    movementsCount,
    getItem,
    addItem,
    editItem,
    deleteItem,
    getLotMovement,
    adjustStock,
    metrics
  }
})