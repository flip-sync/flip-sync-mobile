import { baseUrl } from "..";
import { IApiResponse, IPagination } from "../types";
import type { AxiosProgressEvent } from "axios";
import {
    tCreateOrganizationScore,
    tCreateScore,
    tOrganizationScoreSearch,
    tScoreDetail,
    tScoreList,
    tScoreSearch,
    tUploadProgressHandler
} from "./types";

export interface IScoreApi {
    getScoreList: (props: tScoreSearch) => Promise<IApiResponse<IPagination<tScoreList>>>;
    getScoreDetail: (groupId: number, scoreId: number) => Promise<IApiResponse<tScoreDetail>>;
    postScore: (props: tCreateScore) => Promise<IApiResponse<IPagination<tScoreList>>>;
    getOrganizationScoreList: (props: tOrganizationScoreSearch) => Promise<IApiResponse<IPagination<tScoreList>>>;
    getOrganizationScoreDetail: (scoreId: number) => Promise<IApiResponse<tScoreDetail>>;
    postOrganizationScore: (props: tCreateOrganizationScore) => Promise<IApiResponse<number>>;
    deleteOrganizationScore: (scoreId: number) => Promise<IApiResponse<void>>;
    sendOrganizationScoreToGroup: (scoreId: number, groupId: number) => Promise<IApiResponse<number>>;
}

const createUploadProgressHandler =
    (onUploadProgress?: tUploadProgressHandler) =>
    (event: AxiosProgressEvent) => {
        if (!onUploadProgress || !event.total) {
            return;
        }

        onUploadProgress(Math.min(1, event.loaded / event.total));
    };

export const scoreApi: IScoreApi = {
    getScoreList: ({ pageParam, groupId, sortDirection = "desc" }: tScoreSearch) => {
        return baseUrl.get(`/group/${groupId}/score`, {
            params: {
                page: pageParam,
                size: 10,
                sort: `createdAt,${sortDirection}`
            }
        });
    },
    getScoreDetail: (groupId, scoreId) => {
        return baseUrl.get(`/group/${groupId}/score/${scoreId}`);
    },
    postScore: (props: tCreateScore) => {
        return baseUrl.post(`/group/${props?.groupId}/score`, props?.formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress: createUploadProgressHandler(props.onUploadProgress)
        });
    },
    getOrganizationScoreList: ({
        pageParam,
        title,
        singer,
        code,
        uploadedUserName,
        sortDirection = "desc"
    }: tOrganizationScoreSearch) => {
        return baseUrl.get(`/organization/score`, {
            params: {
                page: pageParam,
                size: 12,
                sort: `createdAt,${sortDirection}`,
                title,
                singer,
                code,
                uploadedUserName
            }
        });
    },
    getOrganizationScoreDetail: scoreId => {
        return baseUrl.get(`/organization/score/${scoreId}`);
    },
    postOrganizationScore: ({ formData, onUploadProgress }: tCreateOrganizationScore) => {
        return baseUrl.post(`/organization/score`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress: createUploadProgressHandler(onUploadProgress)
        });
    },
    deleteOrganizationScore: scoreId => {
        return baseUrl.delete(`/organization/score/${scoreId}`);
    },
    sendOrganizationScoreToGroup: (scoreId, groupId) => {
        return baseUrl.post(`/organization/score/${scoreId}/send/group/${groupId}`);
    }
};
