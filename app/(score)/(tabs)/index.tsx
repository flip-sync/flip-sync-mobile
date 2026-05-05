import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import { useRouter } from "expo-router";
import { tRoom } from "@/api/room";
import { useFlipTheme } from "@/common";
import { FloatingButton } from "@/components/base/Button/FloatingButton";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import { RoomCard } from "@/components/RoomList/RoomCard";
import { useRoom } from "@/hooks/room";
import { useCheckDevice } from "@/hooks/useCheckDevice";
import FlipStyles from "@/styles";

const COPY = {
    latest: "\ucd5c\uc2e0\uc21c"
} as const;

export default function RoomList() {
    const theme = useFlipTheme();
    const router = useRouter();
    const {
        roomList,
        myRoomList,
        nextRoomList,
        hasNextRoomList,
        isFetchingNextRoomList,
        isLoadingRoomList,
        isLoadingMyRoomList,
        isRefreshingRoomList,
        refreshRoomLists
    } = useRoom();
    const { isTablet } = useCheckDevice();
    const joinedRoomIds = new Set((myRoomList?.data.content ?? []).map(room => room.id));

    const onPressRoomCard = (room: tRoom) => {
        const id = room.id;
        if (joinedRoomIds.has(id)) {
            router.push(`/(score)/${id}`);
            return;
        }

        router.push({
            pathname: "/(score)/modal",
            params: {
                groupId: String(id),
                roomName: room.name,
                currentMemberCount: String(room.currentMemberCount),
                maxMemberCount: String(room.maxMemberCount),
                hasPassword: room.hasPassword ? "true" : "false"
            }
        });
    };

    if (isLoadingRoomList || isLoadingMyRoomList) {
        return <ActivityIndicator size="large" color={theme.primary} />;
    }

    const rooms = roomList?.pages.flatMap(page => page.data.content) ?? [];

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.primaryLight
                }
            ]}
        >
            <RowView style={styles.header} justifyContent="flex-end">
                <View style={styles.headerMeta}>
                    <FlipIcon icon="icon-arrow-up-down" size={16} />
                    <DefaultText Button3>{COPY.latest}</DefaultText>
                </View>
            </RowView>
            <FloatingButton onPress={() => router.push("/(score)/createRoomModal")} />
            <FlatList
                data={rooms}
                key={isTablet ? "room-grid-2" : "room-grid-1"}
                style={[
                    styles.roomList,
                    {
                        backgroundColor: theme.primaryLight
                    }
                ]}
                numColumns={isTablet ? 2 : 1}
                keyExtractor={item => `room-${item.id}`}
                renderItem={({ item }) => (
                    <RoomCard
                        title={item.name}
                        description={`${item.creatorName} · ${item.currentMemberCount}/${item.maxMemberCount}명`}
                        onPressEvent={() => onPressRoomCard(item)}
                    />
                )}
                onEndReached={() => {
                    if (hasNextRoomList) {
                        nextRoomList();
                    }
                }}
                onEndReachedThreshold={0.5}
                refreshing={isRefreshingRoomList}
                onRefresh={() => {
                    void refreshRoomLists();
                }}
                ListFooterComponent={isFetchingNextRoomList ? <ActivityIndicator size="small" color={theme.primary} /> : null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: FlipStyles.basePadding
    },
    header: {
        padding: FlipStyles.basePadding,
        alignItems: "center",
        gap: FlipStyles.adjustScale(4)
    },
    headerMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(4)
    },
    roomList: {
        flex: 1
    }
});
