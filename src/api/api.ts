import axios from 'axios';

var api = axios.create({
    baseURL: '/api/',
    headers: {'X-API-KEY': localStorage.getItem("API_KEY")}
});

export default api;