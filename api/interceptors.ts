import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { reloadAppAsync } from "expo";
import { ACTIVE_ORGANIZATION_STORAGE_KEY } from "@/common/api/organization-session";

type tApiError = {
    code: string;
    message: string;
};

const getAuthorizationHeader = (accessToken?: string) => {
    if (!accessToken) {
        return null;
    }

    return accessToken.startsWith("Bearer ") ? accessToken : `Bearer ${accessToken}`;
};

const onRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    await AsyncStorage.getItem("token").then(token => {
        if (!token) {
            return;
        }

        try {
            const tokenData = JSON.parse(token) as { accessToken?: string };
            const authorizationHeader = getAuthorizationHeader(tokenData.accessToken);

            if (authorizationHeader) {
                config.headers.Authorization = authorizationHeader;
            }
        } catch (error) {
            console.warn("Failed to parse stored auth token.", error);
        }
    });

    await AsyncStorage.getItem(ACTIVE_ORGANIZATION_STORAGE_KEY).then(activeOrganization => {
        if (!activeOrganization) {
            return;
        }

        try {
            const organizationData = JSON.parse(activeOrganization) as { id?: number };
            if (organizationData.id) {
                config.headers["X-Organization-Id"] = String(organizationData.id);
            }
        } catch (error) {
            console.warn("Failed to parse stored organization session.", error);
        }
    });

    return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
    console.error(`[request error] [${JSON.stringify(error)}]`);
    return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
    return response.data;
};

const onResponseError = async (error: AxiosError<tApiError>): Promise<AxiosError> => {
    console.log(error.response?.data);

    const errorCode = error.response?.data?.code;

    if (errorCode?.startsWith("401_")) {
        await AsyncStorage.removeItem("token");
        await reloadAppAsync();
    }

    return Promise.reject(error);
};

export default function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
    axiosInstance.interceptors.request.use(onRequest, onRequestError);
    axiosInstance.interceptors.response.use(onResponse, onResponseError);
    return axiosInstance;
}
