import axios, { AxiosInstance, AxiosResponse } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器 - 返回 response.data 而不是整个 response
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// 类型声明：由于响应拦截器返回 response.data，所以 API 调用返回的是 T 而不是 AxiosResponse<T>
declare module 'axios' {
  export interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<T>;
    post<T = any>(url: string, data?: any, config?: any): Promise<T>;
    put<T = any>(url: string, data?: any, config?: any): Promise<T>;
    delete<T = any>(url: string, config?: any): Promise<T>;
  }
}

export default apiClient;

