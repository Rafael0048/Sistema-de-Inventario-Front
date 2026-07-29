import {ref} from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useProductStore } from './productStore'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
export const useLotStore = defineStore('lot',()=>{
    const url = '/productos/stock'
    const alertStore = useAlertStore()
    const producStore = useProductStore()
    const items = ref([])
    async function getItem(father){
        try {
            const response = await apiCall('get',`${url}/${father.productId}`,)
            items.value = response.data
        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al obtener los lotes')

        }
    }
    async function addItem(item , fatherId){
        try {
            item.productId = fatherId.productId
            item.initialQuantity = Number(item.quantity)
            item.actualQuantity = Number(item.quantity)
            item.price = Number(item.price)
            const response = await apiCall('post',url,item)
            await getItem(fatherId)
            await producStore.getItem()
            alertStore.showAlert('success',`Se ha agregado el lote al producto ${fatherId.name}`, 'Lote agregado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al agregar el lote')

        }
    }
    async function editItem(item){
        try {
            const response = await apiCall('put',`${url}/${item.lotId}`,item)
            await getItem()
            alertStore.showAlert('success',`Se ha editado el lote`, 'Lote editado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al editar el lote')

        }
    }
    async function deleteItem(item){
        try {
            const response = await apiCall('delete',`${url}/${item.lotId}`)
            await getItem()
            alertStore.showAlert('success',`Se ha eliminado el lote`, 'Lote eliminado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al eliminar el lote')

        }
    }
  
    return{ items, getItem, addItem, editItem, deleteItem }
})