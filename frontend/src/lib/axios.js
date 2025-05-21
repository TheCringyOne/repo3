import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1" : "/api/v1",
	//en /api/v1 vamos a poner el link donde va a estar nuestro servidor, en este caso nos lo tienen que dar en el tec 
	withCredentials: true,
});
