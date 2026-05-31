import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { reloadAppAsync } from "expo";
import { ACTIVE_ORGANIZATION_STORAGE_KEY } from "@/common/api/organization-session";
import { getStoredAuthSession, removeAuthSession } from "@/common/api/session";
import { refreshAccessToken } from "@/common/api/client";

type tApiError = {
    code: string;
    message: string;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const getAuthorizationHeader = (accessToken?: string) => {
    if (!accessToken) {
        return null;
    }

    return accessToken.startsWith("Bearer ") ? accessToken : `Bearer ${accessToken}`;
};

const clearSessionAndReload = async () => {
    await removeAuthSession();
    await reloadAppAsync();
};

const onRequest = async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const tokenData = await getStoredAuthSession();
    const authorizationHeader = getAuthorizationHeader(tokenData?.accessToken);

    if (authorizationHeader) {
        config.headers.Authorization = authorizationHeader;
    }

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

const onResponseError = async (error: AxiosError<tApiError>, axiosInstance: AxiosInstance) => {
    console.log(error.response?.data);

    const errorCode = error.response?.data?.code;
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? "";
    const isRefreshRequest = requestUrl.includes("/user/login/refresh");

    if (errorCode?.startsWith("401_") && originalRequest && !originalRequest._retry && !isRefreshRequest) {
        originalRequest._retry = true;

        try {
            const token = await refreshAccessToken();
            originalRequest.headers.Authorization = getAuthorizationHeader(token.accessToken);
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            await clearSessionAndReload();
            return Promise.reject(refreshError);
        }
    }

    if (errorCode?.startsWith("401_")) {
        await clearSessionAndReload();
    }

    return Promise.reject(error);
};

export default function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
    axiosInstance.interceptors.request.use(onRequest, onRequestError);
    axiosInstance.interceptors.response.use(onResponse, error => onResponseError(error, axiosInstance));
    return axiosInstance;
}
