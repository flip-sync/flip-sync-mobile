import { roomApi } from "@/api/room";
import { tCreateRoom } from "@/api/room/types";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

export const useRoom = (props?: { groupId: number }) => {
    const {
        data: roomList,
        fetchNextPage: nextRoomList,
        hasNextPage: hasNextRoomList,
        isFetchingNextPage: isFetchingNextRoomList,
        isLoading: isLoadingRoomList,
        error
    } = useInfiniteQuery({
        queryKey: ["rooms"],
        queryFn: ({ pageParam }) => roomApi.getRoomList(pageParam),
        initialPageParam: 0,
        getNextPageParam: lastPage => {
            return lastPage.data.last ? undefined : lastPage.data.number + 1;
        }
    });
    const { data: groupDetail } = useQuery({
        queryKey: ["room", props?.groupId],
        queryFn: () => roomApi.getRoomInfo(props?.groupId),
        enabled: !!props?.groupId
    });
    const { mutateAsync: createRoom } = useMutation({
        mutationFn: (room: tCreateRoom) => roomApi.createRoom(room)
    });
    const { mutateAsync: joinRoom } = useMutation({
        mutationFn: (roomid: number) => roomApi.joinRoom(roomid)
    });
    return {
        roomList,
        groupDetail,
        nextRoomList,
        hasNextRoomList,
        isFetchingNextRoomList,
        isLoadingRoomList,
        createRoom,
        joinRoom
    };
};
