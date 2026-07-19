import {ref} from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useProductStore } from './productStore'
export const useLotStore = defineStore('lot',()=>{
    const url = '/productos/stock'
    const producStore = useProductStore()
    const items = ref([])
    async function getItem(father){
        console.log(father)
        const response = await axios.get(`${import.meta.env.VITE_URL_DIRECTION}${url}/${father.productId}`)
       
        items.value = response.data
    }
    async function addItem(item , fatherId){
        item.productId = fatherId.productId
        item.quantity = Number(item.quantity)
        item.price = Number(item.price)
        const response = await axios.post(`${import.meta.env.VITE_URL_DIRECTION}${url}`, item)
        await getItem(fatherId)
        await producStore.getItem()
    }
    async function editItem(item){
        const response = await axios.put(`${import.meta.env.VITE_URL_DIRECTION}${url}/${item.lotId}`, item)
        await getItem()
    }
    async function deleteItem(item){
        const response = await axios.delete(`${import.meta.env.VITE_URL_DIRECTION}${url}/${item.lotId}`)
        await getItem()
    }
  
    return{ items, getItem, addItem, editItem, deleteItem }
})