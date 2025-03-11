import { baseUrl } from "..";
import { IApiResponse, IPagination } from "../types";
import { tCreateRoom, tRoomDetail, tRoomList } from "./types";

export interface IRoomApi {
    getRoomList: (pageParam: number) => Promise<IApiResponse<IPagination<tRoomList>>>;
    getRoomInfo: (groupId?: number) => Promise<IApiResponse<tRoomDetail[]>>;
    createRoom: (room: tCreateRoom) => Promise<IApiResponse<any>>;
    joinRoom: (room: number) => Promise<IApiResponse<any>>;
}

export const roomApi: IRoomApi = {
    getRoomList: pageParam => {
        return baseUrl.get("/group", {
            params: {
                page: pageParam,
                size: 10
            }
        });
    },
    getRoomInfo: groupId => {
        return baseUrl.get("/group/users", {
            params: {
                groupId: groupId
            }
        });
    },
    createRoom: room => {
        return baseUrl.post("/group", {
            name: room.name
        });
    },
    joinRoom: roomId => {
        return baseUrl.post(`/group/join?groupId=${roomId}`);
    }
};
