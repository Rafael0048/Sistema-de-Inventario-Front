import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
export const useUserStore = defineStore('user', ()=>{
    const alertStore = useAlertStore()
    const url = '/usuarios'
    const items = ref([])
    const activeUser = ref({})
    const error = ref({})
    async function loginUser(user) {
        try{
            const response = await apiCall('post', `${url}/login`, user)
            localStorage.setItem('userToken', response.data.token)
            alertStore.showAlert('success','El usuario se ha registrado con exito', 'Sesion iniciada')
            return response.data.message
        }catch(error){
            throw error
        }
       
    }
    async function registerUser(user) {
        
    }
    // async function getItem(){
    //     const response = await apiCall('get','/productos')
    //    // const response = await axios.get(`${import.meta.env.VITE_URL_DIRECTION}${url}`)
    //     response.data.forEach(product => {
    //         if(product.lot.length>0){
    //             let productPrice = 0 
    //             let productQuantity = 0
    //             product.lot.forEach(lot =>{
    //                 productPrice = (lot.price+productPrice)
    //                 productQuantity = lot.quantity + productQuantity
    //             })
    //             productPrice = productPrice/product.lot.length
    //             product.price = productPrice.toFixed(2)
    //             product.quantity = productQuantity
    //         }else{
    //             product.price = 'Sin precio'
    //         }
    //     })
    //     items.value = response.data
    // }
    // async function addItem(item){
    //     const response = await axios.post(`${import.meta.env.VITE_URL_DIRECTION}${url}`, item)
    //     await getItem()
    // }
    // async function editItem(item){
    //     const response = await axios.put(`${import.meta.env.VITE_URL_DIRECTION}${url}/${item.productId}`, item)
    //     await getItem()
    // }
    // async function deleteItem(item){
    //     const response = await axios.delete(`${import.meta.env.VITE_URL_DIRECTION}${url}/${item.productId}`)
    //     await getItem()
    // }
    
    return{  loginUser }
})