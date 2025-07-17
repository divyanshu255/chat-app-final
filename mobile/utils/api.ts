
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://chat-app1-432f.onrender.com/api',
});

export default API;
