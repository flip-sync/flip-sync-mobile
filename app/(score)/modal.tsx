import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { useFlipTheme } from "@/common";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import FormInput from "@/components/base/TextInput/FormTextInput";
import { UserProfileCard } from "@/components/RoomList/UserProfileCard";
import { useRoom } from "@/hooks/room";
import { useCheckDevice } from "@/hooks/useCheckDevice";
import FlipStyles from "@/styles";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

const COPY = {
    participants: "참여 인원",
    join: "참여하기",
    roomFull: "정원이 가득 찼습니다.",
    invalidPassword: "비밀번호는 숫자 8자리로 입력해 주세요.",
    wrongPassword: "비밀번호가 올바르지 않습니다.",
    joinFailed: "방 참여에 실패했습니다."
} as const;

export default function RoomModal() {
    const theme = useFlipTheme();
    const router = useRouter();
    const { groupId, roomName, currentMemberCount, maxMemberCount, hasPassword } = useLocalSearchParams<{
        groupId: string;
        roomName?: string;
        currentMemberCount?: string;
        maxMemberCount?: string;
        hasPassword?: string;
    }>();
    const { groupDetail, joinRoom, myRoomList } = useRoom({
        groupId: Number(groupId)
    });
    const { isTablet } = useCheckDevice();
    const numericGroupId = Number(groupId);
    const joinedCount = Number(currentMemberCount ?? "0");
    const memberLimit = Number(maxMemberCount ?? "0");
    const requiresPassword = hasPassword === "true";
    const isRoomFull = memberLimit > 0 && joinedCount >= memberLimit;
    const isJoinedRoom = (myRoomList?.data.content ?? []).some(room => room.id === numericGroupId);
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isJoinedRoom && Number.isFinite(numericGroupId) && numericGroupId > 0) {
            router.replace(`/(score)/${numericGroupId}`);
        }
    }, [isJoinedRoom, numericGroupId, router]);

    const participantSummary = useMemo(() => {
        if (joinedCount > 0 && memberLimit > 0) {
            return `${joinedCount}/${memberLimit}명`;
        }

        return undefined;
    }, [joinedCount, memberLimit]);

    const handleJoin = async () => {
        if (isRoomFull) {
            Alert.alert(COPY.roomFull);
            return;
        }

        if (requiresPassword && !/^\d{8}$/.test(password.trim())) {
            Alert.alert(COPY.invalidPassword);
            return;
        }

        try {
            const result = await joinRoom({
                groupId: numericGroupId,
                password: requiresPassword ? password.trim() : undefined
            });

            if (result.code === "200_0") {
                router.replace(`/(score)/${numericGroupId}`);
            }
        } catch (error) {
            if (isAxiosError<{ code?: string; message?: string }>(error)) {
                const code = error.response?.data?.code;
                const message = error.response?.data?.message;

                if (code === "409_0" && message === "ROOM_MEMBER_LIMIT_REACHED") {
                    Alert.alert(COPY.roomFull);
                    return;
                }

                if (code === "403_0" && message === "INVALID_ROOM_PASSWORD") {
                    Alert.alert(COPY.wrongPassword);
                    return;
                }

                if (code === "409_0") {
                    router.replace(`/(score)/${numericGroupId}`);
                    return;
                }

                Alert.alert(COPY.joinFailed, message ?? COPY.joinFailed);
                return;
            }

            Alert.alert(COPY.joinFailed);
        }
    };

    return (
        <View
            style={[
                isTablet ? styles.tabletModalContent : styles.modalContent,
                {
                    backgroundColor: theme.white
                }
            ]}
        >
            <View>
                <RowView
                    style={{
                        padding: FlipStyles.adjustScale(20)
                    }}
                >
                    <RowView
                        alignItems="center"
                        style={{
                            gap: FlipStyles.adjustScale(16)
                        }}
                    >
                        <View>
                            <DefaultText Title3 color={theme.gray1}>
                                {COPY.participants}
                            </DefaultText>
                            {!!roomName && (
                                <DefaultText Button3 color={theme.gray5}>
                                    {roomName}
                                    {participantSummary ? ` · ${participantSummary}` : ""}
                                </DefaultText>
                            )}
                        </View>
                    </RowView>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FlipIcon icon="icon-close" size={24} />
                    </TouchableOpacity>
                </RowView>
                <View style={styles.profileWrap}>
                    <ScrollView>
                        <View style={styles.profileBox}>
                            {groupDetail?.data.map(user => {
                                return <UserProfileCard key={user.id} name={user.name} />;
                            })}
                        </View>
                    </ScrollView>
                </View>
                {requiresPassword && (
                    <View style={styles.passwordSection}>
                        <FormInput
                            placeholder="비밀번호 숫자8자리"
                            value={password}
                            keyboardType="number-pad"
                            maxLength={8}
                            secureTextEntry
                            hasClearButton
                            onClearPress={() => setPassword("")}
                            onChangeText={value => setPassword(value.replace(/[^0-9]/g, ""))}
                        />
                    </View>
                )}
            </View>
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    onPress={handleJoin}
                    disabled={isRoomFull}
                    style={[
                        styles.applyBtn,
                        {
                            backgroundColor: isRoomFull ? theme.gray7 : theme.primary
                        }
                    ]}
                >
                    <DefaultText Body1 color={theme.white}>
                        {COPY.join}
                    </DefaultText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    profileWrap: {
        maxWidth: FlipStyles.adjustScale(562),
        width: FlipStyles.adjustScale(562),
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
        padding: 20,
        justifyContent: "space-between",
        width: FlipStyles.windowWidth,
        height: FlipStyles.windowHeight
    },
    tabletModalContent: {
        borderRadius: 10,
        justifyContent: "space-between",
        maxWidth: FlipStyles.adjustScale(562),
        maxHeight: FlipStyles.adjustScale(560),
        height: "100%"
    },
    applyBtn: {
        width: FlipStyles.adjustScale(121),
        padding: FlipStyles.adjustScale(13),
        borderRadius: FlipStyles.adjustScale(8),
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end"
    },
    bottomContainer: {
        padding: FlipStyles.adjustScale(20)
    },
    passwordSection: {
        paddingHorizontal: FlipStyles.adjustScale(20),
        paddingTop: FlipStyles.adjustScale(20)
    }
});
