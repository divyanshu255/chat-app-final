// utils/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://chat-app1-432f.onrender.com/api', // Replace with your IP or hosted URL
});

export default API;
