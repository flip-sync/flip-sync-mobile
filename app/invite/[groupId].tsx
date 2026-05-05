import { roomApi } from "@/api/room";
import { getActiveOrganizationSession, getAuthSession } from "@/common";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const getStoredAccessToken = async () => {
    const session = getAuthSession();
    if (session?.accessToken) {
        return session.accessToken;
    }

    const rawSession = await AsyncStorage.getItem("token");
    if (!rawSession) {
        return null;
    }

    try {
        const parsedSession = JSON.parse(rawSession) as { accessToken?: string };
        return parsedSession.accessToken ?? null;
    } catch {
        return null;
    }
};

export default function InviteEntry() {
    const router = useRouter();
    const { groupId } = useLocalSearchParams<{ groupId?: string }>();

    useEffect(() => {
        let mounted = true;

        const openInvite = async () => {
            const numericGroupId = Number(groupId);

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

            const activeOrganization = getActiveOrganizationSession();
            if (!activeOrganization?.id) {
                if (mounted) {
                    router.replace({
                        pathname: "/(auth)/organization-select",
                        params: {
                            inviteGroupId: String(numericGroupId)
                        }
                    });
                }
                return;
            }

            try {
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

                if (mounted) {
                    router.replace("/(score)/(tabs)");
                }
            }
        };

        void openInvite();

        return () => {
            mounted = false;
        };
    }, [groupId, router]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4EC0E9" />
            <DefaultText Body1 style={styles.message}>
                초대 링크를 확인하고 있습니다.
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
    }
});


