import { scoreApi } from "@/api/score";
import { tCreateScore } from "@/api/score/types";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

export const useScore = (props?: { groupId: number }) => {
    const {
        data: scoreList,
        fetchNextPage: nextScoreList,
        hasNextPage: hasNextScoreList,
        isFetchingNextPage: isFetchingNextScoreList,
        isLoading: isLoadingScoreList,
        error
    } = useInfiniteQuery({
        queryKey: ["score"],
        queryFn: ({ pageParam }) => scoreApi.getScoreList({ pageParam, groupId: props?.groupId }),
        initialPageParam: 0,
        enabled: !!props?.groupId,
        getNextPageParam: lastPage => {
            return lastPage.data.last ? undefined : lastPage.data.number + 1;
        }
    });
    const { mutateAsync: createScore } = useMutation({
        mutationFn: (props: tCreateScore) => scoreApi.postScore(props)
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
