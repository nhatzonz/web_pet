// axios-conf.js
import axios from 'axios';
import { API_BASE } from './Api_base';

const api = axios.create({
    baseURL: API_BASE, // URL backend
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    },
);

export default api;
