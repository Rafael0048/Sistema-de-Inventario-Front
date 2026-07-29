import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
export const useProductStore = defineStore('product', ()=>{
    const alertStore = useAlertStore()
    const url = '/productos'
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
            itemsRows.forEach(product => {
                if(product.lot.length>0){
                    let productPrice = 0 
                    let productQuantity = 0
                    product.lot.forEach(lot =>{
                        productPrice = (lot.price+productPrice)
                        productQuantity = lot.actualQuantity + productQuantity
                    })
                    productPrice = productPrice/product.lot.length
                    product.price = productPrice.toFixed(2)
                    product.quantity = productQuantity
                    
                }else{
                    product.price = 'Sin precio'
                    product.quantity = 0
                }
            })
            items.value = itemsRows
        }catch(error){
            console.log(error)
            alertStore.showAlert('error',error.message, 'Fallo al cargar los productos')

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
  
    return{ items, itemCount, getItem, addItem, editItem, deleteItem }
})