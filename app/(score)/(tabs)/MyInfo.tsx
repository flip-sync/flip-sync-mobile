import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { tRoom } from "@/api/room";
import {
    ACTIVE_ORGANIZATION_STORAGE_KEY,
    clearActiveOrganizationSession,
    clearAuthSession,
    useActiveOrganizationSession,
    useFlipTheme
} from "@/common";
import ProfileAvatar from "@/components/base/imgs/ProfileAvatar";
import DefaultText from "@/components/base/Text";
import { useRoom } from "@/hooks/room";
import { useUserProfile } from "@/hooks/user";
import FlipStyles from "@/styles";

type RoomTab = "joined" | "invited";

const COPY = {
    defaultProfileName: "FlipSync \uc0ac\uc6a9\uc790",
    editProfile: "\ub0b4 \uc815\ubcf4 \uc218\uc815",
    joinedRooms: "\ucc38\uc5ec\uc911\uc778 \ubc29",
    invitedRooms: "\ucd08\ub300\ubc1b\uc740 \ubc29",
    loadingRooms: "\ubc29 \ubaa9\ub85d\uc744 \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.",
    emptyJoinedRooms: "\ud604\uc7ac \ucc38\uc5ec \uc911\uc778 \ubc29\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
    emptyInvitedRooms: "\uc544\uc9c1 \ucc38\uc5ec\ud558\uc9c0 \uc54a\uc740 \ubc29\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
    joinedOwnerPrefix: "\ubc29\uc7a5 ",
    invitedOwnerPrefix: "\ucc38\uc5ec \uac00\ub2a5 \u00b7 \ubc29\uc7a5 ",
    logoutTitle: "\ub85c\uadf8\uc544\uc6c3",
    logoutMessage: "\ud604\uc7ac \uacc4\uc815\uc5d0\uc11c \ub85c\uadf8\uc544\uc6c3\ud560\uae4c\uc694?",
    cancel: "\ucde8\uc18c",
    logout: "\ub85c\uadf8\uc544\uc6c3",
    loggingOut: "\ub85c\uadf8\uc544\uc6c3 \uc911...",
    currentOrganization: "\ud604\uc7ac \uc18c\uc18d",
    organizationFallback: "\uc120\ud0dd\ub41c \uc18c\uc18d \uc5c6\uc74c",
    organizationInfo: "\uc18c\uc18d \uc815\ubcf4"
} as const;

export default function MyInfoScreen() {
    const theme = useFlipTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { myRoomList, roomList, isLoadingMyRoomList, isLoadingRoomList } = useRoom();
    const { profile } = useUserProfile();
    const activeOrganization = useActiveOrganizationSession();

    const [activeTab, setActiveTab] = useState<RoomTab>("joined");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const joinedRooms = myRoomList?.data.content ?? [];
    const joinedRoomIds = useMemo(() => new Set(joinedRooms.map(room => room.id)), [joinedRooms]);
    const openRooms = useMemo(() => roomList?.pages.flatMap(page => page.data.content) ?? [], [roomList?.pages]);
    const invitedRooms = useMemo(
        () => openRooms.filter(room => !joinedRoomIds.has(room.id)),
        [joinedRoomIds, openRooms]
    );
    const visibleRooms = activeTab === "joined" ? joinedRooms : invitedRooms;
    const isLoading = isLoadingMyRoomList || isLoadingRoomList;
    const profileName = profile?.data.name?.trim() || COPY.defaultProfileName;
    const profileImageUrl = profile?.data.profileImageUrl ?? null;

    const handleLogout = () => {
        Alert.alert(COPY.logoutTitle, COPY.logoutMessage, [
            {
                text: COPY.cancel,
                style: "cancel"
            },
            {
                text: COPY.logout,
                style: "destructive",
                onPress: async () => {
                    setIsLoggingOut(true);

                    try {
                        await AsyncStorage.removeItem("token");
                        await AsyncStorage.removeItem(ACTIVE_ORGANIZATION_STORAGE_KEY);
                        clearAuthSession();
                        clearActiveOrganizationSession();
                        queryClient.clear();
                        router.replace("/(auth)");
                    } finally {
                        setIsLoggingOut(false);
                    }
                }
            }
        ]);
    };

    const handlePressRoom = (room: tRoom) => {
        if (joinedRoomIds.has(room.id)) {
            router.push(`/(score)/${room.id}`);
            return;
        }

        router.push({
            pathname: "/(score)/modal",
            params: {
                groupId: String(room.id),
                roomName: room.name,
                currentMemberCount: String(room.currentMemberCount),
                maxMemberCount: String(room.maxMemberCount),
                hasPassword: room.hasPassword ? "true" : "false"
            }
        });
    };

    const handlePressEditProfile = () => {
        router.push("/(score)/profile-edit");
    };

    const handlePressOrganizationInfo = () => {
        router.push("/(score)/organization-info");
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.white }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <ProfileAvatar uri={profileImageUrl} size={FlipStyles.adjustScale(88)} />
                    <DefaultText Title4 weight="700" color={theme.gray2} containerStyle={styles.profileName}>
                        {profileName}
                    </DefaultText>
                    <Pressable onPress={handlePressEditProfile} style={styles.editProfileButton}>
                        <DefaultText Button3 color={theme.gray5}>
                            {COPY.editProfile}
                        </DefaultText>
                    </Pressable>
                </View>

                <Pressable
                    onPress={handlePressOrganizationInfo}
                    style={[styles.organizationCard, { borderColor: theme.gray7 }]}
                >
                    <View style={styles.organizationCardText}>
                        <DefaultText Button3 color={theme.gray5}>
                            {COPY.currentOrganization}
                        </DefaultText>
                        <DefaultText Body1 weight="600" color={theme.gray2}>
                            {activeOrganization?.name ?? COPY.organizationFallback}
                        </DefaultText>
                    </View>
                    <DefaultText Button2 weight="700" color={theme.primary}>
                        {COPY.organizationInfo}
                    </DefaultText>
                </Pressable>

                <View
                    style={[
                        styles.segmentRow,
                        {
                            borderTopColor: theme.gray7,
                            borderBottomColor: theme.gray7
                        }
                    ]}
                >
                    <Pressable
                        onPress={() => setActiveTab("joined")}
                        style={[
                            styles.segmentButton,
                            activeTab === "joined" && { borderBottomColor: theme.primary }
                        ]}
                    >
                        <DefaultText Button2 weight={activeTab === "joined" ? "700" : "500"} color={theme.gray3}>
                            {COPY.joinedRooms}
                        </DefaultText>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab("invited")}
                        style={[
                            styles.segmentButton,
                            activeTab === "invited" && { borderBottomColor: theme.primary }
                        ]}
                    >
                        <DefaultText Button2 weight={activeTab === "invited" ? "700" : "500"} color={theme.gray3}>
                            {COPY.invitedRooms}
                        </DefaultText>
                    </Pressable>
                </View>

                <View style={[styles.listSection, { borderBottomColor: theme.gray7 }]}>
                    {isLoading ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator color={theme.primary} />
                            <DefaultText Body2 color={theme.gray5}>
                                {COPY.loadingRooms}
                            </DefaultText>
                        </View>
                    ) : visibleRooms.length === 0 ? (
                        <View style={styles.emptyState}>
                            <DefaultText Body2 color={theme.gray5}>
                                {activeTab === "joined" ? COPY.emptyJoinedRooms : COPY.emptyInvitedRooms}
                            </DefaultText>
                        </View>
                    ) : (
                        visibleRooms.map((room, index) => (
                            <Pressable
                                key={`${activeTab}-room-${room.id}`}
                                onPress={() => handlePressRoom(room)}
                                style={[
                                    styles.roomRow,
                                    {
                                        borderBottomColor: index === visibleRooms.length - 1 ? "transparent" : theme.gray7
                                    }
                                ]}
                            >
                                <View style={styles.roomTextBlock}>
                                    <DefaultText Body1 weight="500" color={theme.gray2} numberOfLines={1}>
                                        {room.name}
                                    </DefaultText>
                                    <DefaultText Button3 color={theme.gray5} numberOfLines={1}>
                                        {activeTab === "joined"
                                            ? `${COPY.joinedOwnerPrefix}${room.creatorName}`
                                            : `${COPY.invitedOwnerPrefix}${room.creatorName}`}
                                    </DefaultText>
                                </View>
                                <DefaultText Body1 color={theme.gray5}>
                                    {">"}
                                </DefaultText>
                            </Pressable>
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.gray7 }]}>
                <Pressable
                    disabled={isLoggingOut}
                    onPress={handleLogout}
                    style={[
                        styles.logoutButton,
                        {
                            backgroundColor: theme.white,
                            borderColor: isLoggingOut ? theme.gray6 : theme.red
                        }
                    ]}
                >
                    <DefaultText Button1 weight="600" color={isLoggingOut ? theme.gray5 : theme.red}>
                        {isLoggingOut ? COPY.loggingOut : COPY.logout}
                    </DefaultText>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContent: {
        paddingBottom: FlipStyles.adjustScale(112)
    },
    profileSection: {
        alignItems: "center",
        paddingTop: FlipStyles.adjustScale(28),
        paddingBottom: FlipStyles.adjustScale(22)
    },
    avatarCircle: {
        width: FlipStyles.adjustScale(88),
        height: FlipStyles.adjustScale(88),
        borderRadius: FlipStyles.adjustScale(44),
        alignItems: "center",
        justifyContent: "center"
    },
    profileName: {
        marginTop: FlipStyles.adjustScale(12),
        marginBottom: FlipStyles.adjustScale(4)
    },
    editProfileButton: {
        paddingHorizontal: FlipStyles.adjustScale(8),
        paddingVertical: FlipStyles.adjustScale(4)
    },
    organizationCard: {
        marginHorizontal: FlipStyles.adjustScale(16),
        marginBottom: FlipStyles.adjustScale(18),
        minHeight: FlipStyles.adjustScale(68),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(16),
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingVertical: FlipStyles.adjustScale(14),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(12)
    },
    organizationCardText: {
        flex: 1,
        gap: FlipStyles.adjustScale(4)
    },
    segmentRow: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderBottomWidth: 1
    },
    segmentButton: {
        flex: 1,
        minHeight: FlipStyles.adjustScale(44),
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 2,
        borderBottomColor: "transparent"
    },
    listSection: {
        borderBottomWidth: 1
    },
    loadingState: {
        alignItems: "center",
        justifyContent: "center",
        gap: FlipStyles.adjustScale(10),
        paddingHorizontal: FlipStyles.adjustScale(18),
        paddingVertical: FlipStyles.adjustScale(28)
    },
    emptyState: {
        paddingHorizontal: FlipStyles.adjustScale(18),
        paddingVertical: FlipStyles.adjustScale(24)
    },
    roomRow: {
        minHeight: FlipStyles.adjustScale(64),
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingVertical: FlipStyles.adjustScale(12),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        gap: FlipStyles.adjustScale(12)
    },
    roomTextBlock: {
        flex: 1,
        gap: FlipStyles.adjustScale(2)
    },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingTop: FlipStyles.adjustScale(10),
        paddingBottom: FlipStyles.adjustScale(18),
        borderTopWidth: 1,
        backgroundColor: "rgba(255,255,255,0.97)"
    },
    logoutButton: {
        minHeight: FlipStyles.adjustScale(48),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center"
    }
});
