import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
export const usePurchaseStore = defineStore('purchase', ()=>{
    const alertStore = useAlertStore()
    const url = '/compras'
    const items = ref([])
    const itemCount = ref(0)
    async function getItem(father,page,itemsPerPage,filters,sortBy){
        try{
            const params ={
                page : page,
                itemsPerPage: itemsPerPage,
                product : filters?filters.product : null,
                provider : filters?filters.provider : null,
                providerId : null,
                sortBy : sortBy
            }
            father? params.providerId = father.providerId : null
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
            alertStore.showAlert('success',`Se ha agregado la compra ${response.data.purchaseId}`, 'Compra agregada correctamente')

        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al agregar la compra')

        }
    }
    async function editItem(item){
        try{
            const response = await apiCall('put',`${url}/${item.purchaseId}`,item)
            await getItem()
            alertStore.showAlert('success',`Se ha editado la compra ${response.data.purchaseId}`, 'Compra editada correctamente')

        }catch(error){
            alertStore.showAlert('error',error.message, 'Fallo al editar la compra')

        }
    }
    async function deleteItem(item){
        try {
            const response = await apiCall('delete',`${url}/${item.purchaseId}`)
            await getItem()
            alertStore.showAlert('success',`Se ha eliminado la compra ${response.data.purchaseId}`, 'Compra eliminada correctamente')

        } catch (error) {
            console.log(error)
            alertStore.showAlert('error',error.message, 'Fallo al eliminar la compra')

        }
    }
    async function addPayment(payment, purchase){
        try {
            payment.purchaseId = purchase.purchaseId
            payment.providerId = purchase.providerId
            const response = await apiCall('post',`${url}/payment`,payment)
            await getItem()
            alertStore.showAlert('success',`Se ha agregado el pago de ${payment.dolarValue} USD`, 'Pago agregado correctamente')
            

            } catch (error){
            alertStore.showAlert('error',error.message, 'Fallo al agregar el pago')
        }
            }
    async function editPayment(paymentId, payment){
        try{
            const response = await apiCall('put',`${url}/payment/${paymentId}`,payment)
            await getItem()
            alertStore.showAlert('success',`Se ha editado el pago de ${payment.dolarValue} USD`, 'Pago editado correctamente')
        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al editar el pago')
        }
    }
    return{ items, itemCount, getItem, addItem, editItem, deleteItem, addPayment, editPayment }
})