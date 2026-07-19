<script setup>
import {ref} from 'vue'
import { useUserStore } from '../stores/userStore';
const userStore = useUserStore()
const user = ref({
    userName : '',
    password : ''
})
const errorAuth = ref('')
async function loginUser() {
    try{
        
        const response = await userStore.loginUser(user.value)
    }catch(error){
        errorAuth.value = error.error
    }
}
</script>
<template>
  <div class="d-flex justify-center align-center h-100">
    
    <v-card width="400" class="pa-6">
      
      <v-card-item class="text-center">
        <v-card-title class="text-h5 mb-4">Iniciar Sesión</v-card-title>
      </v-card-item>

      <v-card-text>
        <v-form>
           <v-label text="Usuario"/>
            
          <v-text-field 
            placeholder="Usario048" 
            variant="solo-filled"
            class="mb-2"
            v-model="user.userName"
          />
           <v-label text="Contraseña"/>

          <v-text-field 
            placeholder="123456" 
            type="password"
            variant="solo-filled"
            class="mb-4"
            v-model="user.password"
          />
           <p v-if="errorAuth" class="text-error text-body-2 mb-4 text-center">
            {{ errorAuth }}
          </p>
          <v-btn 
            color="primary" 
            block 
            size="large"
            @click="loginUser()"
          >
            Iniciar Sesión
          </v-btn>
        </v-form>
      </v-card-text>

    </v-card>
  </div>
</template>

<style scoped>

</style>