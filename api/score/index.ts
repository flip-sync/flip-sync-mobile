import { baseUrl } from "..";
import { IApiResponse, IPagination } from "../types";
import {
    tCreateOrganizationScore,
    tCreateScore,
    tOrganizationScoreSearch,
    tScoreDetail,
    tScoreList,
    tScoreSearch
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
            }
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
    postOrganizationScore: ({ formData }: tCreateOrganizationScore) => {
        return baseUrl.post(`/organization/score`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },
    deleteOrganizationScore: scoreId => {
        return baseUrl.delete(`/organization/score/${scoreId}`);
    },
    sendOrganizationScoreToGroup: (scoreId, groupId) => {
        return baseUrl.post(`/organization/score/${scoreId}/send/group/${groupId}`);
    }
};
