import axios from "axios";

// Configuración del cliente axios con manejo de errores mejorado
export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "production" ? "/api/v1" : "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores específicos aquí si es necesario
    console.error("API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
