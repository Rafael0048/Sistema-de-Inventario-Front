import {defineStore} from 'pinia'
import {ref} from 'vue'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
export const useProviderStore = defineStore('provider', ()=>{
    const alertStore = useAlertStore()
    const url = '/proveedores'
    const items = ref([])
    const itemCount = ref(0)
    async function getItem(page,itemsPerPage,search,sortBy){
        try {
           const params ={
                page : page,
                itemsPerPage: itemsPerPage,
                search : search,
                sortBy : sortBy
            }
            const response = await apiCall('get',url, params)

            items.value = response.data.rows
            items.value.forEach(item => {

                if (item.purchases) {
          const tieneDeuda = item.purchases.some(purchase => {
              return purchase.status === 'Pendiente' || purchase.status === 'Parcial';
          });
      
          item.debt = tieneDeuda;
      }
            })
            itemCount.value = response.data.count
        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al obtener los proveedores')
        }
    }
    async function addItem(item){
        try {
            const response = await apiCall('post',url,item)
            await getItem()
            alertStore.showAlert('success',`Se ha agregado al proveedor ${item.name}`, 'Proveedor agregado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al agregar el proveedor')

        }
    }
    async function editItem(item){
        try {        
            const response = await apiCall('put',`${url}/${item.providerId}`,item)
            await getItem()
            alertStore.showAlert('success',`Se ha editado al proveedor ${item.name}`, 'Proveedor editado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al editar el proveedor')

        }
    }
    async function deleteItem(item){
        try {
            const response = await apiCall('delete',`${url}/${item.providerId}`)
            await getItem()
            alertStore.showAlert('success',`Se ha eliminado al proveedor ${item.name}`, 'Proveedor eliminado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al eliminar el proveedor')
        }
    }
  
    return{ items, itemCount, getItem, addItem, editItem, deleteItem }
})