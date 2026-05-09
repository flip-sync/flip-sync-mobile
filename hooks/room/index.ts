import { roomApi } from "@/api/room";
import { tCreateRoom, tJoinRoom, tKickRoomMember, tLeaveRoom, tTransferRoomOwner } from "@/api/room";
import { useActiveOrganizationSession } from "@/common";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useRoom = (props?: { groupId: number }) => {
    const queryClient = useQueryClient();
    const activeOrganization = useActiveOrganizationSession();
    const activeOrganizationId = activeOrganization?.id;
    const refreshRoomCaches = (groupId?: number) => {
        void Promise.all([
            queryClient.invalidateQueries({ queryKey: ["rooms", activeOrganizationId] }),
            queryClient.invalidateQueries({ queryKey: ["my-rooms", activeOrganizationId] }),
            groupId
                ? queryClient.invalidateQueries({ queryKey: ["room", activeOrganizationId, groupId] })
                : Promise.resolve(),
            groupId
                ? queryClient.invalidateQueries({ queryKey: ["room-summary", activeOrganizationId, groupId] })
                : Promise.resolve()
        ]);
    };
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
            await queryClient.invalidateQueries({ queryKey: ["room-summary", activeOrganizationId, payload.groupId] });
        }
    });
    const { mutateAsync: leaveRoom, isPending: isLeavingRoom } = useMutation({
        mutationFn: (payload: tLeaveRoom) => roomApi.leaveRoom(payload),
        onSuccess: (_response, payload) => {
            queryClient.removeQueries({ queryKey: ["room", activeOrganizationId, payload.groupId] });
            queryClient.removeQueries({ queryKey: ["room-summary", activeOrganizationId, payload.groupId] });
            refreshRoomCaches(payload.groupId);
        }
    });
    const { mutateAsync: transferRoomOwner, isPending: isTransferringRoomOwner } = useMutation({
        mutationFn: (payload: tTransferRoomOwner) => roomApi.transferRoomOwner(payload),
        onSuccess: async (_response, payload) => {
            await queryClient.invalidateQueries({ queryKey: ["rooms", activeOrganizationId] });
            await queryClient.invalidateQueries({ queryKey: ["my-rooms", activeOrganizationId] });
            await queryClient.invalidateQueries({ queryKey: ["room", activeOrganizationId, payload.groupId] });
            await queryClient.invalidateQueries({ queryKey: ["room-summary", activeOrganizationId, payload.groupId] });
        }
    });
    const { mutateAsync: deleteRoom, isPending: isDeletingRoom } = useMutation({
        mutationFn: (groupId: number) => roomApi.deleteRoom(groupId),
        onSuccess: (_response, groupId) => {
            queryClient.removeQueries({ queryKey: ["room", activeOrganizationId, groupId] });
            queryClient.removeQueries({ queryKey: ["room-summary", activeOrganizationId, groupId] });
            refreshRoomCaches(groupId);
        }
    });
    const { mutateAsync: kickRoomMember, isPending: isKickingRoomMember } = useMutation({
        mutationFn: (payload: tKickRoomMember) => roomApi.kickRoomMember(payload),
        onSuccess: (_response, payload) => {
            refreshRoomCaches(payload.groupId);
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
        joinRoom,
        leaveRoom,
        isLeavingRoom,
        transferRoomOwner,
        isTransferringRoomOwner,
        deleteRoom,
        isDeletingRoom,
        kickRoomMember,
        isKickingRoomMember
    };
};
