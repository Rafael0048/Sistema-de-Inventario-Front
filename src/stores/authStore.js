import { defineStore } from "pinia";
import { ref, computed } from 'vue';
import { useAlertStore } from "./alertStore";
import apiCall from "../utiliy/ApiCall";

export const useAuthStore = defineStore('auth', () => {
  const alertStore = useAlertStore();

  const token = ref(localStorage.getItem('userToken') || null);

  const activeUser = computed(() => {
    if (!token.value) {
      return { userName: null, role: null };
    }

    try {
      const payloadBase64 = token.value.split('.')[1];
      const jsonPayload = decodeURIComponent(
        atob(payloadBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload);

      return {
        userName: decoded.userName || decoded.username || null,
        role: decoded.role || decoded.rol || null,
        id: decoded.userId || null
      };
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return { userName: null, role: null, id:null};
    }
  });

  const isAuthenticated = computed(() => !!token.value);

  function hasRole(requiredRoles) {
    if (!activeUser.value.role) return false;

    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(activeUser.value.role);
    }

    return activeUser.value.role === requiredRoles;
  }

  async function loginUser(user) {
    try {
      const response = await apiCall('post', `/usuarios/login`, user);
      
      const newToken = response.data.token;
      localStorage.setItem('userToken', newToken);
      token.value = newToken; 

      alertStore.showAlert('success', `Bienvenido ${activeUser.value.userName}`, 'Sesión iniciada');
      return response.data.message;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    token.value = null;
    localStorage.removeItem('userToken');
  }

  return {
    token,
    activeUser,
    isAuthenticated,
    hasRole,
    loginUser,
    logout
  };
});