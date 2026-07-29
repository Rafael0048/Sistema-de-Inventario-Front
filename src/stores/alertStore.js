import { defineStore } from "pinia";
import {ref} from 'vue'
export const useAlertStore = defineStore('alert',()=>{
    const alertStatus = ref({
            alertType : '',
            text : '', 
            title : '',
            openAlert : false

    })
    function showAlert(alertType,text,title){
        alertStatus.value = {
            alertType : alertType,
            text : text, 
            title : title,
            openAlert : true
        }
    }
    
    return{alertStatus, showAlert}
})