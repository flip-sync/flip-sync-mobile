import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { reloadAppAsync } from "expo";
import { reload } from "expo-router/build/global-state/routing";

type tApiError = {
    code: string;
    message: string;
};
const onRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    await AsyncStorage.getItem("token").then(token => {
        if (token) {
            const tokenData = JSON.parse(token);
            console.log(tokenData.accessToken);
            config.headers.Authorization = `${tokenData.accessToken}`;
        }
    });
    console.log(config.data);
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
    console.log(error.response?.data);
    if (error.response?.data.code === "401_3") {
        AsyncStorage.removeItem("token");
        reloadAppAsync();
    }
    return Promise.reject(error);
};
export default function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
    axiosInstance.interceptors.request.use(onRequest, onRequestError);
    axiosInstance.interceptors.response.use(onResponse, onResponseError);
    return axiosInstance;
}
