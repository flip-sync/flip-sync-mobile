import { baseUrl } from "..";
import { IApiResponse, IPagination } from "../types/index";

export type tCreateRoom = {
    name: string;
    maxMemberCount: number;
    password?: string;
};

export type tJoinRoom = {
    groupId: number;
    password?: string;
};

export type tLeaveRoom = {
    groupId: number;
    delegateUserId?: number;
};

export type tTransferRoomOwner = {
    groupId: number;
    delegateUserId: number;
};

export type tKickRoomMember = {
    groupId: number;
    targetUserId: number;
};

export type tRoomList = tRoom[];

export type tRoom = {
    creatorId: number;
    creatorName: string;
    id: number;
    name: string;
    currentMemberCount: number;
    maxMemberCount: number;
    hasPassword: boolean;
};

export type tRoomDetail = {
    id: number;
    joinedAt: string;
    name: string;
    profileImageUrl?: string | null;
};

export type tRoomSummary = {
    id: number;
    name: string;
    creatorId: number;
    creatorName: string;
    currentUserId: number;
    currentUserName: string;
    currentUserProfileImageUrl?: string | null;
    currentUserIsCreator: boolean;
    currentMemberCount: number;
    maxMemberCount: number;
    hasPassword: boolean;
};

export type tRoomInviteInfo = {
    groupId: number;
    groupName: string;
    organizationId: number;
    organizationName: string;
    organizationInviteCode: string;
    organizationCreatorId: number;
    organizationCreatorName: string;
    organizationMemberCount: number;
    organizationRole: "LEADER" | "MEMBER";
    organizationIsLeader: boolean;
    creatorId: number;
    creatorName: string;
    currentMemberCount: number;
    maxMemberCount: number;
    hasPassword: boolean;
    joined: boolean;
};

export interface IRoomApi {
    getRoomList: (pageParam: number) => Promise<IApiResponse<IPagination<tRoomList>>>;
    getMyRoomList: () => Promise<IApiResponse<IPagination<tRoomList>>>;
    getRoomInfo: (groupId?: number) => Promise<IApiResponse<tRoomDetail[]>>;
    getRoomSummary: (groupId?: number) => Promise<IApiResponse<tRoomSummary>>;
    getRoomInviteInfo: (groupId: number) => Promise<IApiResponse<tRoomInviteInfo>>;
    createRoom: (room: tCreateRoom) => Promise<IApiResponse<number>>;
    joinRoom: (room: tJoinRoom) => Promise<IApiResponse<void>>;
    leaveRoom: (room: tLeaveRoom) => Promise<IApiResponse<void>>;
    transferRoomOwner: (room: tTransferRoomOwner) => Promise<IApiResponse<void>>;
    deleteRoom: (groupId: number) => Promise<IApiResponse<void>>;
    kickRoomMember: (payload: tKickRoomMember) => Promise<IApiResponse<void>>;
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
    getMyRoomList: () => {
        return baseUrl.get("/group/my", {
            params: {
                page: 0,
                size: 100
            }
        });
    },
    getRoomInfo: groupId => {
        return baseUrl.get("/group/users", {
            params: {
                groupId
            }
        });
    },
    getRoomSummary: groupId => {
        return baseUrl.get(`/group/${groupId}`);
    },
    getRoomInviteInfo: groupId => {
        return baseUrl.get(`/group/invite/${groupId}`);
    },
    createRoom: room => {
        return baseUrl.post("/group", {
            name: room.name,
            maxMemberCount: room.maxMemberCount,
            password: room.password ?? ""
        });
    },
    joinRoom: room => {
        return baseUrl.post("/group/join", {
            groupId: room.groupId,
            password: room.password ?? ""
        });
    },
    leaveRoom: room => {
        return baseUrl.delete("/group/leave", {
            params: {
                groupId: room.groupId,
                delegateUserId: room.delegateUserId
            }
        });
    },
    transferRoomOwner: room => {
        return baseUrl.patch(`/group/${room.groupId}/owner`, {
            delegateUserId: room.delegateUserId
        });
    },
    deleteRoom: groupId => {
        return baseUrl.delete(`/group/${groupId}`);
    },
    kickRoomMember: payload => {
        return baseUrl.delete(`/group/${payload.groupId}/users/${payload.targetUserId}`);
    }
};
