import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
export const useProductStore = defineStore('product', ()=>{
    const products = ref([])
    async function getProducts(){
        const response = await axios.get(`${import.meta.env.VITE_URL_DIRECTION}/productos`)
        response.data.forEach(product => {
            let productPrice = 0 
            product.lot.forEach(lot =>{
                productPrice = (lot.price+productPrice)
            })
            productPrice = productPrice/product.lot.length
            product.price = productPrice
        })
        products.value = response.data
    }
    return{ products, getProducts }
})