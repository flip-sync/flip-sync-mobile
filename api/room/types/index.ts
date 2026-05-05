export type tCreateRoom = {
    name: string;
};
export type tRoomList = tRoom[];

export type tRoom = { creatorId: number; creatorName: string; id: number; name: string };

export type tRoomDetail = { id: number; joinedAt: string; name: string; profileImageUrl?: string | null };

export type tRoomSummary = {
    id: number;
    name: string;
    creatorId: number;
    creatorName: string;
    currentUserId: number;
    currentUserName: string;
    currentUserProfileImageUrl?: string | null;
    currentUserIsCreator: boolean;
};
