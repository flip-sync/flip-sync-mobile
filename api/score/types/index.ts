export type tCreateScore = {
    groupId: number;
    formData: FormData;
};

export type tCreateOrganizationScore = {
    formData: FormData;
};

export type tScoreList = tScoreSummary[];

export type tScoreSummary = {
    id: number;
    uploadedUserId: number;
    thumbnail: string;
    title: string;
    singer: string;
    code: string;
    uploadedUserName: string;
    uploadedUserProfileImageUrl?: string | null;
    createdAt: string;
    modifiedAt: string;
};

export type tScoreDetail = {
    id: number;
    title: string;
    singer: string;
    code: string;
    uploadedUserId: number;
    uploadedUserName: string;
    scoreImageList: {
        id: number;
        url: string;
        order: number;
    }[];
};

export type tScoreSearch = {
    groupId?: number;
    pageParam: number;
};

export type tOrganizationScoreSearch = {
    pageParam: number;
    title?: string;
    singer?: string;
    code?: string;
    uploadedUserName?: string;
};

export type tSharedScoreViewMessage = {
    type: "SYNC_SCORE_VIEW" | "SCORE_CREATED" | "PRESENCE_SYNC" | "CLIENT_PING" | "SERVER_PONG";
    scoreId?: number | null;
    pageIndex?: number;
    active?: boolean;
    triggeredByUserId?: number | null;
    triggeredByUserName?: string | null;
    connectedUsers?: tConnectedRoomMember[] | null;
    scoreSummary?: tScoreSummary | null;
    clientTimestamp?: number | null;
    serverTimestamp?: number | null;
};

export type tConnectedRoomMember = {
    userId: number;
    userName: string;
    isCreator: boolean;
    profileImageUrl?: string | null;
};
