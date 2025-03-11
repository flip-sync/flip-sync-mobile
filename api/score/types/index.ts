export type tCreateScore = {
    groupId: string;
    formData: FormData;
};
export type tScoreList = tScore[];

export type tScore = { creatorId: number; creatorName: string; id: number; name: string };

export type tScoreDetail = { id: number; joinedAt: string; name: string };

export type tScoreSearch = {
    groupId?: number;
    pageParam: number;
};
