import { roomApi } from "@/api/room";
import { tCreateRoom, tJoinRoom } from "@/api/room";
import { useActiveOrganizationSession } from "@/common";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useRoom = (props?: { groupId: number }) => {
    const queryClient = useQueryClient();
    const activeOrganization = useActiveOrganizationSession();
    const activeOrganizationId = activeOrganization?.id;
    const {
        data: roomList,
        fetchNextPage: nextRoomList,
        hasNextPage: hasNextRoomList,
        isFetchingNextPage: isFetchingNextRoomList,
        isLoading: isLoadingRoomList,
        isRefetching: isRefetchingRoomList,
        refetch: refetchRoomList,
        error
    } = useInfiniteQuery({
        queryKey: ["rooms", activeOrganizationId],
        queryFn: ({ pageParam }) => roomApi.getRoomList(pageParam),
        initialPageParam: 0,
        enabled: Boolean(activeOrganizationId),
        getNextPageParam: lastPage => {
            return lastPage.data.last ? undefined : lastPage.data.number + 1;
        }
    });
    const {
        data: myRoomList,
        isLoading: isLoadingMyRoomList,
        isRefetching: isRefetchingMyRoomList,
        refetch: refetchMyRoomList
    } = useQuery({
        queryKey: ["my-rooms", activeOrganizationId],
        queryFn: () => roomApi.getMyRoomList(),
        enabled: Boolean(activeOrganizationId)
    });
    const { data: groupDetail } = useQuery({
        queryKey: ["room", activeOrganizationId, props?.groupId],
        queryFn: () => roomApi.getRoomInfo(props?.groupId),
        enabled: Boolean(activeOrganizationId && props?.groupId)
    });
    const { data: roomSummary } = useQuery({
        queryKey: ["room-summary", activeOrganizationId, props?.groupId],
        queryFn: () => roomApi.getRoomSummary(props?.groupId),
        enabled: Boolean(activeOrganizationId && props?.groupId)
    });
    const { mutateAsync: createRoom, isPending: isCreatingRoom } = useMutation({
        mutationFn: (room: tCreateRoom) => roomApi.createRoom(room),
        onSuccess: async response => {
            await queryClient.invalidateQueries({ queryKey: ["rooms", activeOrganizationId] });
            await queryClient.invalidateQueries({ queryKey: ["my-rooms", activeOrganizationId] });
            await queryClient.invalidateQueries({ queryKey: ["room", activeOrganizationId, response.data] });
        }
    });
    const { mutateAsync: joinRoom } = useMutation({
        mutationFn: (payload: tJoinRoom) => roomApi.joinRoom(payload),
        onSuccess: async (_response, payload) => {
            await queryClient.invalidateQueries({ queryKey: ["rooms", activeOrganizationId] });
            await queryClient.invalidateQueries({ queryKey: ["my-rooms", activeOrganizationId] });
            await queryClient.invalidateQueries({ queryKey: ["room", activeOrganizationId, payload.groupId] });
        }
    });
    const refreshRoomLists = async () => {
        await Promise.all([refetchRoomList(), refetchMyRoomList()]);
    };
    return {
        roomList,
        myRoomList,
        groupDetail,
        roomSummary,
        nextRoomList,
        hasNextRoomList,
        isFetchingNextRoomList,
        isLoadingRoomList,
        isLoadingMyRoomList,
        isRefreshingRoomList: isRefetchingRoomList || isRefetchingMyRoomList,
        refreshRoomLists,
        createRoom,
        isCreatingRoom,
        joinRoom
    };
};
