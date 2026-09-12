import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api`;


const request = async (endpoint, options = {}) => {

  const token = localStorage.getItem("token");

  const isFormData = options.body instanceof FormData;


  const config = {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token && {
        Authorization: `Bearer ${token}`
      })
    }
  };


  // Si NO es FormData agregamos JSON
  // Si es FormData dejamos que el navegador maneje Content-Type
  if (
    config.body &&
    !isFormData &&
    typeof config.body !== "string"
  ) {

    config.headers["Content-Type"] = "application/json";

    config.body = JSON.stringify(config.body);

  }


  const res = await fetch(
    `${BASE_URL}${endpoint}`,
    config
  );


  const data = await res.json()
    .catch(() => ({}));


  if (!res.ok) {

    throw new Error(
      data.message || "Error en la petición"
    );

  }


  return data;

};



const api = {


  get(endpoint) {

    return request(endpoint, {
      method: "GET"
    });

  },


  post(endpoint, body) {

    return request(endpoint, {
      method: "POST",
      body
    });

  },


  put(endpoint, body) {

    return request(endpoint, {
      method: "PUT",
      body
    });

  },


  delete(endpoint) {

    return request(endpoint, {
      method: "DELETE"
    });

  }


};


export default api;