import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
export const useSaleStore = defineStore('sale', ()=>{
    const alertStore = useAlertStore()
    const url = '/ventas'
    const items = ref([])
    const itemCount = ref(0)
    async function getItem(page,itemsPerPage,search,sortBy){
        try{
            const params ={
                page : page,
                itemsPerPage: itemsPerPage,
                search : search,
                sortBy : sortBy
            }
            const response = await apiCall('get',url, params)
            

            const itemsRows =response.data.rows
            itemCount.value = response.data.count
            items.value = itemsRows
        }catch(error){
            console.log(error)
            alertStore.showAlert('error',error.message, 'Fallo al cargar las ventas')

        }
    }
    async function addItem(item){
        try {
            const response = await apiCall('post',url,item)
            await getItem()
            alertStore.showAlert('success',`Se ha agregado el producto ${item.name}`, 'Producto agregado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al agregar el producto')

        }
    }
    async function editItem(item){
        try{
            const response = await apiCall('put',`${url}/${item.productId}`,item)
            await getItem()
            alertStore.showAlert('success',`Se ha editado el producto ${item.name}`, 'Producto editado correctamente')

        }catch(error){
            alertStore.showAlert('error',error.message, 'Fallo al editar el producto')

        }
    }
    async function deleteItem(item){
        try {
            const response = await apiCall('delete',`${url}/${item.productId}`)
            await getItem()
            alertStore.showAlert('success',`Se ha eliminado el producto ${item.name}`, 'Producto eliminado correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al eliminar el producto')

        }
    }
    async function addPayment(payment, saleId){
        try {
            payment.saleId = saleId
            const response = await apiCall('post',`${url}/payment`,payment)
            await getItem()
            alertStore.showAlert('success',`Se ha agregado el pago de ${payment.bsValue} Bs`, 'Pago agregado correctamente')
            

            } catch (error){
            alertStore.showAlert('error',error.message, 'Fallo al agregar el pago')
        }
            }
    async function editPayment(paymentId, payment){
        try{
            console.log(payment)
            const response = await apiCall('put',`${url}/payment/${paymentId}`,payment)
            await getItem()
            alertStore.showAlert('success',`Se ha editado el pago de ${payment.bsValue} Bs`, 'Pago editado correctamente')
        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al editar el pago')
        }
    }
    return{ items, itemCount, getItem, addItem, editItem, deleteItem, addPayment, editPayment }
})