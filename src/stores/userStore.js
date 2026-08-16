import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import apiCall from '../utiliy/ApiCall'
import { useAlertStore } from './alertStore'
export const useUserStore = defineStore('user', ()=>{
    const alertStore = useAlertStore()
    const url = '/usuarios'
    const items = ref([])
    const itemCount = ref(0)
    const activeUser = ref({})
    const error = ref({})
    async function loginUser(user) {
        try{
            const response = await apiCall('post', `${url}/login`, user)
            localStorage.setItem('userToken', response.data.token)
            alertStore.showAlert('success','El usuario  ha iniciado sesion con exito', 'Sesion iniciada')
            return response.data.message
        }catch(error){
            throw error
        }
       
    }
    async function addItem(user) {
        try{
            console.log(user)
            const response = await apiCall('post', `${url}/register`, user)
            alertStore.showAlert('success','El usuario se ha registrado con exito', 'Registro completado')
            return response.data.message
        }catch(error){
            throw error
        }
    }
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
            itemCount.value = response.data.count
        } catch (error) {
            alertStore.showAlert('error',error.message, 'Fallo al obtener los usuarios')
        }
    }
    
   
    
    return{  loginUser,addItem , getItem, items, itemCount}
})