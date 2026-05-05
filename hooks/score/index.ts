import { scoreApi } from "@/api/score";
import { tCreateOrganizationScore, tCreateScore } from "@/api/score/types";
import { useActiveOrganizationSession } from "@/common";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const getScoreListQueryKey = (organizationId?: number | null, groupId?: number | null) =>
    ["score", organizationId ?? null, groupId ?? null] as const;

export const getOrganizationScoreListQueryKey = (
    organizationId?: number | null,
    filters?: {
        title?: string;
        singer?: string;
        code?: string;
        uploadedUserName?: string;
    }
) =>
    [
        "organization-score",
        organizationId ?? null,
        filters?.title?.trim() ?? "",
        filters?.singer?.trim() ?? "",
        filters?.code?.trim() ?? "",
        filters?.uploadedUserName?.trim() ?? ""
    ] as const;

export const useScore = (props?: { groupId: number }) => {
    const queryClient = useQueryClient();
    const activeOrganization = useActiveOrganizationSession();
    const activeOrganizationId = activeOrganization?.id;
    const {
        data: scoreList,
        fetchNextPage: nextScoreList,
        hasNextPage: hasNextScoreList,
        isFetchingNextPage: isFetchingNextScoreList,
        isLoading: isLoadingScoreList,
        error
    } = useInfiniteQuery({
        queryKey: getScoreListQueryKey(activeOrganizationId, props?.groupId),
        queryFn: ({ pageParam }) => scoreApi.getScoreList({ pageParam, groupId: props?.groupId }),
        initialPageParam: 0,
        enabled: Boolean(activeOrganizationId && props?.groupId),
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        getNextPageParam: lastPage => {
            return lastPage.data.last ? undefined : lastPage.data.number + 1;
        }
    });
    const { mutateAsync: createScore } = useMutation({
        mutationFn: (props: tCreateScore) => scoreApi.postScore(props),
        onSuccess: async (_response, variables) => {
            const cachedScorePages = queryClient.getQueryData(
                getScoreListQueryKey(activeOrganizationId, variables.groupId)
            );

            if (!cachedScorePages) {
                await queryClient.invalidateQueries({
                    queryKey: getScoreListQueryKey(activeOrganizationId, variables.groupId)
                });
            }
        }
    });
    return {
        scoreList,
        error,
        nextScoreList,
        hasNextScoreList,
        isFetchingNextScoreList,
        isLoadingScoreList,
        createScore
    };
};

export const useScoreDetail = (props?: { groupId?: number; scoreId?: number; enabled?: boolean }) => {
    const activeOrganization = useActiveOrganizationSession();
    const { data, isLoading, error } = useQuery({
        queryKey: ["score-detail", activeOrganization?.id, props?.groupId, props?.scoreId],
        queryFn: () => scoreApi.getScoreDetail(props?.groupId!, props?.scoreId!),
        enabled: Boolean(activeOrganization?.id && props?.enabled && props?.groupId && props?.scoreId)
    });

    return {
        scoreDetail: data,
        isLoadingScoreDetail: isLoading,
        scoreDetailError: error
    };
};

export const useOrganizationScoreLibrary = (props?: {
    title?: string;
    singer?: string;
    code?: string;
    uploadedUserName?: string;
    enabled?: boolean;
}) => {
    const queryClient = useQueryClient();
    const activeOrganization = useActiveOrganizationSession();
    const activeOrganizationId = activeOrganization?.id;
    const normalizedFilters = {
        title: props?.title?.trim() || undefined,
        singer: props?.singer?.trim() || undefined,
        code: props?.code?.trim() || undefined,
        uploadedUserName: props?.uploadedUserName?.trim() || undefined
    };

    const {
        data: organizationScoreList,
        fetchNextPage: nextOrganizationScoreList,
        hasNextPage: hasNextOrganizationScoreList,
        isFetchingNextPage: isFetchingNextOrganizationScoreList,
        isLoading: isLoadingOrganizationScoreList,
        isRefetching: isRefreshingOrganizationScoreList,
        refetch: refetchOrganizationScoreList
    } = useInfiniteQuery({
        queryKey: getOrganizationScoreListQueryKey(activeOrganizationId, normalizedFilters),
        queryFn: ({ pageParam }) =>
            scoreApi.getOrganizationScoreList({
                pageParam,
                ...normalizedFilters
            }),
        initialPageParam: 0,
        enabled: Boolean(activeOrganizationId && (props?.enabled ?? true)),
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        getNextPageParam: lastPage => {
            return lastPage.data.last ? undefined : lastPage.data.number + 1;
        }
    });

    const { mutateAsync: createOrganizationScore, isPending: isCreatingOrganizationScore } = useMutation({
        mutationFn: (request: tCreateOrganizationScore) => scoreApi.postOrganizationScore(request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["organization-score", activeOrganizationId ?? null]
            });
        }
    });

    const { mutateAsync: deleteOrganizationScore, isPending: isDeletingOrganizationScore } = useMutation({
        mutationFn: (scoreId: number) => scoreApi.deleteOrganizationScore(scoreId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["organization-score", activeOrganizationId ?? null]
            });
        }
    });

    const { mutateAsync: sendOrganizationScoreToGroup, isPending: isSendingOrganizationScoreToGroup } = useMutation({
        mutationFn: ({ scoreId, groupId }: { scoreId: number; groupId: number }) =>
            scoreApi.sendOrganizationScoreToGroup(scoreId, groupId)
    });

    return {
        organizationScoreList,
        nextOrganizationScoreList,
        hasNextOrganizationScoreList,
        isFetchingNextOrganizationScoreList,
        isLoadingOrganizationScoreList,
        isRefreshingOrganizationScoreList,
        refetchOrganizationScoreList,
        createOrganizationScore,
        isCreatingOrganizationScore,
        deleteOrganizationScore,
        isDeletingOrganizationScore,
        sendOrganizationScoreToGroup,
        isSendingOrganizationScoreToGroup
    };
};

export const useOrganizationScoreDetail = (props?: { scoreId?: number; enabled?: boolean }) => {
    const activeOrganization = useActiveOrganizationSession();
    const { data, isLoading, error } = useQuery({
        queryKey: ["organization-score-detail", activeOrganization?.id, props?.scoreId],
        queryFn: () => scoreApi.getOrganizationScoreDetail(props?.scoreId!),
        enabled: Boolean(activeOrganization?.id && props?.enabled && props?.scoreId)
    });

    return {
        organizationScoreDetail: data,
        isLoadingOrganizationScoreDetail: isLoading,
        organizationScoreDetailError: error
    };
};
