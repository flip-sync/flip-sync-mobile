import { baseUrl } from "..";
import { IApiResponse, IPagination } from "../types";
import { tCreateRoom, tRoomList } from "./types";

export interface IRoomApi {
    getRoomList: (pageParam: number) => Promise<IApiResponse<IPagination<tRoomList>>>;
    createRoom: (room: tCreateRoom) => Promise<IApiResponse<any>>;
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
    createRoom: room => {
        return baseUrl.post("/group", {
            name: room.name
        });
    }
};
