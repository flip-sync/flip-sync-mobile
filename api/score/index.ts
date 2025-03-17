import { baseUrl } from "..";
import { IApiResponse, IPagination } from "../types";
import { tCreateScore, tScoreList, tScoreSearch } from "./types";

export interface IScoreApi {
    getScoreList: (props: tScoreSearch) => Promise<IApiResponse<IPagination<tScoreList>>>;
    postScore: (props: tCreateScore) => Promise<IApiResponse<IPagination<tScoreList>>>;
}

export const scoreApi: IScoreApi = {
    getScoreList: ({ pageParam, groupId }: tScoreSearch) => {
        return baseUrl.get(`/group/${groupId}/score`, {
            params: {
                page: pageParam,
                size: 10
            }
        });
    },
    postScore: (props: tCreateScore) => {
        return baseUrl.post(`/group/${props?.groupId}/score`, props?.formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }
};
