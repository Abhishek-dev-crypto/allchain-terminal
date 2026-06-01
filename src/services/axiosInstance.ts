// src/services/axiosInstance.ts
import axios from 'axios';

// axiosInstance.ts
const axiosInstance = axios.create({
    baseURL: "https://api.coingecko.com/api/v3/" , // Make sure this is correct
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Example function to call a specific endpoint
const fetchCoins = async () => {
    const response = await axiosInstance.get('/coins'); // Ensure '/coins' is correct
    return response.data;
  };

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error handling can be customized here
    return Promise.reject(error);
  }
);

export default axiosInstance;
