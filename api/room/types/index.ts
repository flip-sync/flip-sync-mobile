export type tCreateRoom = {
    name: string;
};
export type tRoomList = tRoom[];

export type tRoom = { creatorId: number; creatorName: string; id: number; name: string };

export type tRoomDetail = { id: number; joinedAt: string; name: string };
