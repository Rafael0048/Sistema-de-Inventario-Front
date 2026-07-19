import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import apiCall from '../utiliy/ApiCall'
export const useProductStore = defineStore('product', ()=>{
    const url = '/productos'
    const items = ref([])
    async function getItem(){
        const response = await apiCall('get','/productos')
       // const response = await axios.get(`${import.meta.env.VITE_URL_DIRECTION}${url}`)
        response.data.forEach(product => {
            if(product.lot.length>0){
                let productPrice = 0 
                let productQuantity = 0
                product.lot.forEach(lot =>{
                    productPrice = (lot.price+productPrice)
                    productQuantity = lot.quantity + productQuantity
                })
                productPrice = productPrice/product.lot.length
                product.price = productPrice.toFixed(2)
                product.quantity = productQuantity
            }else{
                product.price = 'Sin precio'
            }
        })
        items.value = response.data
    }
    async function addItem(item){
        const response = await axios.post(`${import.meta.env.VITE_URL_DIRECTION}${url}`, item)
        await getItem()
    }
    async function editItem(item){
        const response = await axios.put(`${import.meta.env.VITE_URL_DIRECTION}${url}/${item.productId}`, item)
        await getItem()
    }
    async function deleteItem(item){
        const response = await axios.delete(`${import.meta.env.VITE_URL_DIRECTION}${url}/${item.productId}`)
        await getItem()
    }
    async function addSubItem(item, fatherId) {
        item.productId = fatherId.productId
      item.quantity = Number(item.quantity)
      item.price = Number(item.price)
        console.log(item)
        const response = await axios.post(`${import.meta.env.VITE_URL_DIRECTION}${url}/stock`, item)
        await getItem()
    }
    return{ items, getItem, addItem, editItem, deleteItem, addSubItem }
})