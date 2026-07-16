import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
export const useProductStore = defineStore('product', ()=>{
    const url = '/productos'
    const products = ref([])
    async function getItem(){
        const response = await axios.get(`${import.meta.env.VITE_URL_DIRECTION}${url}`)
        response.data.forEach(product => {
            if(product.lot.length>0){
                let productPrice = 0 
                product.lot.forEach(lot =>{
                    productPrice = (lot.price+productPrice)
                })
                productPrice = productPrice/product.lot.length
                product.price = productPrice
            }else{
                product.price = 'Sin precio'
            }
        })
        products.value = response.data
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
    return{ products, getItem, addItem, editItem, deleteItem, addSubItem }
})