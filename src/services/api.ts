import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.napster.com/v2.2/'
})

export default api;