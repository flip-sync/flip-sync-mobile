import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Link, useNavigation, useRouter } from "expo-router";
import FlipStyles from "@/styles";
import DefaultText from "@/components/base/Text";
import RowView from "@/components/base/RowView";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFlipTheme } from "@/common";
import { RoomCard } from "@/components/RoomList/RoomCard";
import { useState } from "react";
import ReactNativeModal from "react-native-modal";
import { useCheckDevice } from "@/hooks/useCheckDevice";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import { UserProfileCard } from "@/components/RoomList/UserProfileCard";
import { useRoom } from "@/hooks/room";
import { FloatingButton } from "@/components/base/Button/FloatingButton";

export default function RoomList() {
    const theme = useFlipTheme();
    const router = useRouter();
    const { roomList, nextRoomList, hasNextRoomList, isFetchingNextRoomList, isLoadingRoomList } = useRoom();
    const { isTablet } = useCheckDevice();
    const onPressRoomCard = (id: number) => {
        router.push({
            pathname: "/(score)/modal",
            params: {
                groupId: id
            }
        });
    };
    if (isLoadingRoomList) return <ActivityIndicator size="large" color="#3498db" />;
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
                <FlipIcon icon="icon-arrow-up-down" size={16} />
                <DefaultText Button3>최신순</DefaultText>
            </RowView>
            <FloatingButton onPress={() => router.push("/(score)/createRoomModal")} />
            <FlatList
                data={rooms}
                style={[
                    styles.roomList,
                    {
                        backgroundColor: theme.primaryLight
                    }
                ]}
                numColumns={isTablet ? 2 : 1}
                keyExtractor={item => `room-${item.id}`}
                renderItem={data => {
                    return (
                        <RoomCard
                            title={data.item.name}
                            description={data.item.creatorName}
                            onPressEvent={() => onPressRoomCard(data.item.id)}
                        />
                    );
                }}
                onEndReached={() => {
                    if (hasNextRoomList) nextRoomList();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingNextRoomList ? <ActivityIndicator size="small" color="#3498db" /> : null}
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
        gap: FlipStyles.adjustScale(4)
    },
    roomList: {
        flex: 1
    },
    button: { padding: 15, backgroundColor: "#3498db", borderRadius: 8 },
    profileWrap: {
        maxHeight: FlipStyles.adjustScale(340)
    },
    profileBox: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: FlipStyles.adjustScale(20),
        marginTop: FlipStyles.adjustScale(24),
        gap: FlipStyles.adjustScale(16)
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        width: FlipStyles.windowWidth,
        height: FlipStyles.windowHeight
    },
    tabletModalContent: {
        backgroundColor: "#fff",
        borderRadius: 10,
        justifyContent: "space-between",
        maxWidth: FlipStyles.adjustScale(562),
        maxHeight: FlipStyles.adjustScale(505),
        height: "100%"
    },
    modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    modalText: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    applyBtn: {
        width: FlipStyles.adjustScale(121),
        padding: FlipStyles.adjustScale(13),
        borderRadius: FlipStyles.adjustScale(8),
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end"
    },
    // 모바일 풀스크린 모달
    fullScreenModalStyle: { margin: 0, justifyContent: "flex-end" },

    // 태블릿 기본 모달 (중앙 정렬, 작은 크기)
    tabletModalStyle: {
        alignSelf: "center",
        width: FlipStyles.adjustScale(562),
        height: FlipStyles.adjustScale(500),
        overflow: "hidden",
        borderRadius: 10,
        backgroundColor: "transparent"
    },
    bottomContainer: {
        padding: FlipStyles.adjustScale(20)
    }
});
