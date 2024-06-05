import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000", // Set your backend URL here
});

export default axiosInstance;
