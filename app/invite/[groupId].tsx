import { roomApi } from "@/api/room";
import { getStoredAuthSession, persistActiveOrganizationSession } from "@/common";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import { isAxiosError } from "axios";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from "react-native";

const getStoredAccessToken = async () => {
    const session = await getStoredAuthSession();
    return session?.accessToken ?? null;
};

export default function InviteEntry() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams<{ groupId?: string }>();
    const numericGroupId = Number(groupId);
    const [statusMessage, setStatusMessage] = useState("초대 링크를 확인하고 있습니다.");
    const appInviteUrl =
        Number.isFinite(numericGroupId) && numericGroupId > 0 ? `flipsync:///invite/${numericGroupId}` : "flipsync:///";

    useEffect(() => {
        let mounted = true;

        const openInvite = async () => {
            if (!Number.isFinite(numericGroupId) || numericGroupId <= 0) {
                if (mounted) {
                    router.replace("/(auth)");
                }
                return;
            }

            const accessToken = await getStoredAccessToken();
            if (!accessToken) {
                if (mounted) {
                    router.replace({
                        pathname: "/(auth)",
                        params: {
                            inviteGroupId: String(numericGroupId)
                        }
                    });
                }
                return;
            }

            try {
                const inviteInfo = await roomApi.getRoomInviteInfo(numericGroupId);
                await persistActiveOrganizationSession({
                    id: inviteInfo.data.organizationId,
                    name: inviteInfo.data.organizationName,
                    inviteCode: inviteInfo.data.organizationInviteCode,
                    creatorId: inviteInfo.data.organizationCreatorId,
                    creatorName: inviteInfo.data.organizationCreatorName,
                    memberCount: inviteInfo.data.organizationMemberCount,
                    role: inviteInfo.data.organizationRole,
                    isLeader: inviteInfo.data.organizationIsLeader
                });

                if (mounted) {
                    setStatusMessage("초대된 방으로 이동하고 있습니다.");
                }

                if (inviteInfo.data.joined) {
                    if (mounted) {
                        router.replace(`/(score)/${numericGroupId}`);
                    }
                    return;
                }

                if (inviteInfo.data.hasPassword) {
                    if (mounted) {
                        router.replace({
                            pathname: "/(score)/modal",
                            params: {
                                groupId: String(inviteInfo.data.groupId),
                                roomName: inviteInfo.data.groupName,
                                currentMemberCount: String(inviteInfo.data.currentMemberCount),
                                maxMemberCount: String(inviteInfo.data.maxMemberCount),
                                hasPassword: "true"
                            }
                        });
                    }
                    return;
                }

                await roomApi.joinRoom({ groupId: numericGroupId });
                if (mounted) {
                    router.replace(`/(score)/${numericGroupId}`);
                }
            } catch (error) {
                if (isAxiosError(error) && error.response?.data?.code === "409_0") {
                    if (mounted) {
                        router.replace(`/(score)/${numericGroupId}`);
                    }
                    return;
                }

                if (isAxiosError(error) && error.response?.data?.code === "403_0") {
                    if (mounted) {
                        setStatusMessage("이 방이 속한 소속의 멤버만 입장할 수 있습니다. 초대한 사람에게 소속 초대 코드를 요청해 주세요.");
                    }
                    return;
                }

                if (isAxiosError(error) && error.response?.data?.code === "404_0") {
                    if (mounted) {
                        setStatusMessage("존재하지 않거나 삭제된 방 초대 링크입니다.");
                    }
                    return;
                }

                if (mounted) {
                    setStatusMessage("초대 링크를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
                }
            }
        };

        if (Platform.OS !== "web") {
            void openInvite();
        }

        return () => {
            mounted = false;
        };
    }, [numericGroupId, router]);

    if (Platform.OS === "web") {
        const handleOpenApp = () => {
            void Linking.openURL(appInviteUrl);
        };

        return (
            <View style={styles.container}>
                <View style={styles.inviteCard}>
                    <DefaultText Title4 weight="800" style={styles.message}>
                        Flipsync 악보 공유방 초대
                    </DefaultText>
                    <DefaultText Body2 color="#6B7280" style={styles.message}>
                        입장하기를 누르면 앱이 열리고 초대된 방으로 이동합니다.
                    </DefaultText>
                    <Pressable onPress={handleOpenApp} style={styles.openAppButton}>
                        <DefaultText Button1 weight="800" color="#FFFFFF">
                            입장하기
                        </DefaultText>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4EC0E9" />
            <DefaultText Body1 style={styles.message}>
                {statusMessage}
            </DefaultText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: FlipStyles.adjustScale(14),
        paddingHorizontal: FlipStyles.adjustScale(24),
        backgroundColor: "#F5F6F6"
    },
    message: {
        textAlign: "center"
    },
    inviteCard: {
        width: "100%",
        maxWidth: 360,
        gap: FlipStyles.adjustScale(16),
        padding: FlipStyles.adjustScale(24),
        borderRadius: FlipStyles.adjustScale(22),
        backgroundColor: "#FFFFFF",
        alignItems: "center"
    },
    openAppButton: {
        width: "100%",
        minHeight: FlipStyles.adjustScale(50),
        borderRadius: FlipStyles.adjustScale(14),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4EC0E9"
    }
});


