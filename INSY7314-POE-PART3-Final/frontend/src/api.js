import axios from 'axios';
const API_URL = 'https://localhost:5000/api'; 

const api = axios.create({
    baseURL: API_URL, 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let csrfToken = null;

export const getCsrfToken = async () => {
    try {
        const response = await axios.get('https://localhost:5000/api/csrf-token', {
            withCredentials: true
        });
        csrfToken = response.data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
        return null;
    }
};

api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (['post', 'put', 'delete'].includes(config.method?.toLowerCase())) {
            if (!csrfToken) {
                await getCsrfToken();
            }
            
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token'); 
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('isEmployee');
            
            const isEmployeeRoute = window.location.pathname.startsWith('/employee');
            if (isEmployeeRoute) {
                window.location.href = '/employee/login';
            } else {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;