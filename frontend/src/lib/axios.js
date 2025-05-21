import axios from "axios";

// Determinar la URL base de la API según el entorno
const baseURL = import.meta.env.MODE === "production" 
  ? "" // URL vacía para usar el mismo dominio
  : "http://localhost:5000/api/v1";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
