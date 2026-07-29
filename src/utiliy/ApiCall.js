import axios from 'axios';
import router from '@/router' 
const apiCall = async ( method = 'get', url, data = null, headers = {} ) => {
    const token = localStorage.getItem('userToken')
   const auth = `Bearer ${token}`
   const httpMethod = method.toLowerCase();
    try {
    const config = {
      method: method.toLowerCase(),
      url : `${import.meta.env.VITE_URL_DIRECTION}${url}`,
      headers : {
        ...headers,
        ...(auth ? { 'Authorization': auth } : {})
      },
      ...(httpMethod === 'get' ? { params: data } : { data: data })
    };

   

    const response = await axios(config);
    return response;
  } catch (error) {

    if (error.response) {
      const status = error.response.status || error.response.data?.status
      if(status === 401 || status=== 403){
        router.push('/login')
      }
    throw error.response.data; 
  }else{

      throw { mensaje: "Error de conexión con el servidor" };
  }
  
  }
};

export default apiCall;
