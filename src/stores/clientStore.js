import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
export const useClientStore = defineStore('client', ()=>{
    const alertStore = useAlertStore()
    const url = '/clientes'
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
            
        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al obtener los cliente')
        }
    }
    async function addItem(item){
        try {
            const response = await apiCall('post',url,item)
            await getItem()
            alertStore.showAlert('success',`Se ha agregado al cliente ${item.name}`, 'Cliente agregado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al agregar el cliente')

        }
    }
    async function editItem(item){
        try {        
            const response = await apiCall('put',`${url}/${item.clienteId}`,item)
            await getItem()
            alertStore.showAlert('success',`Se ha editado al cliente ${item.name}`, 'Cliente editado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al editar el cliente')

        }
    }
    async function deleteItem(item){
        try {
            const response = await apiCall('delete',`${url}/${item.clienteId}`)
            await getItem()
            alertStore.showAlert('success',`Se ha eliminado al cliente ${item.name}`, 'Cliente eliminado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al eliminar el cliente')
        }
    }
  
    return{ items, itemCount, getItem, addItem, editItem, deleteItem }
})