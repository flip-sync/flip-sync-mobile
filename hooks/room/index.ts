import { authApi } from "@/api/auth";
import { tSignIn, tSignUp, tVerifyEmail } from "@/api/auth/types";
import { roomApi } from "@/api/room";
import { tCreateRoom } from "@/api/room/types";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";

export const useRoom = () => {
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
            console.log("lastPage", lastPage);
            return lastPage.data.last ? undefined : lastPage.data.number + 1;
        }
    });

    const { mutateAsync: createRoom } = useMutation({
        mutationFn: (room: tCreateRoom) => roomApi.createRoom(room)
    });
    return {
        roomList,
        nextRoomList,
        hasNextRoomList,
        isFetchingNextRoomList,
        isLoadingRoomList,
        createRoom
    };
};
