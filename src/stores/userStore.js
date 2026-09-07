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
    const error = ref({})
    
    async function addItem(user) {
        try{
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
     async function deleteItem(item){
        try {
            const response = await apiCall('delete',`${url}/${item.userId}`)
            await getItem()
            alertStore.showAlert('success',`Se ha eliminado el usuario ${item.name}`, 'Usuario eliminado correctamente')

        } catch (error) {
            console.log(error)
            alertStore.showAlert('error',error.message, 'Fallo al eliminar el usuario')

        }
    }
    
   
    
    return{  addItem , getItem, items, itemCount, deleteItem}
})