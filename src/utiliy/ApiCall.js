import axios from 'axios';

const apiCall = async ( method = 'get', url, data = null, headers = {} ) => {
    const token = localStorage.getItem('userToken')
   const auth = `Bearer ${token}`
    try {
    const config = {
      method: method.toLowerCase(),
      url : `${import.meta.env.VITE_URL_DIRECTION}${url}`,
      headers : {
        ...headers,
        ...(auth ? { 'Authorization': auth } : {})
      },
      data,
    };

   

    const response = await axios(config);
    return response;
  } catch (error) {

    if (error.response) {
    
    throw error.response.data; 
  }else{

      throw { mensaje: "Error de conexión con el servidor" };
  }
  
  }
};

export default apiCall;
