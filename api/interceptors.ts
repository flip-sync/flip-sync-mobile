import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { reload } from "expo-router/build/global-state/routing";

type tApiError = {
    code: string;
    message: string;
};
const onRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    await AsyncStorage.getItem("token").then(token => {
        if (token) {
            const tokenData = JSON.parse(token);
            config.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        }
    });
    return config;
};
const onRequestError = (error: AxiosError): Promise<AxiosError> => {
    console.error(`[request error] [${JSON.stringify(error)}]`);
    return Promise.reject(error);
};
const onResponse = (response: AxiosResponse): AxiosResponse => {
    // console.info(`[response] [${JSON.stringify(response)}]`);
    return response.data;
};
const onResponseError = (error: AxiosError<tApiError>): Promise<AxiosError> => {
    return Promise.reject(error.response?.data);
};
export default function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
    axiosInstance.interceptors.request.use(onRequest, onRequestError);
    axiosInstance.interceptors.response.use(onResponse, onResponseError);
    return axiosInstance;
}
