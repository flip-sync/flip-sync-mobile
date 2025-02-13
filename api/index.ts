import axios from "axios";
import setupInterceptorsTo from "./interceptors";

export const baseUrl = setupInterceptorsTo(
    axios.create({
        baseURL: process.env.EXPO_PUBLIC_API_URL
        // baseURL: import.meta.env.NODE_ENV === 'production' ? import.meta.env.VITE_APP_PUBLIC_URL : import.meta.env.VITE_APP_LOCAL_URL,
    })
);
