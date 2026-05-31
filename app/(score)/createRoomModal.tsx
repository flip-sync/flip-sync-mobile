import { useFlipTheme } from "@/common";
import { Header } from "@/components/base/Header";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import DefaultText from "@/components/base/Text";
import FormInput from "@/components/base/TextInput/FormTextInput";
import { useCreateRoomTemplate, useRoom } from "@/hooks/room";
import FlipStyles from "@/styles";
import { isAxiosError } from "axios";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COPY = {
    create: "생성",
    creating: "생성 중...",
    roomNamePlaceholder: "방 제목을 입력해 주세요.",
    roomNameLabel: "방 제목",
    memberLimitLabel: "참여 인원",
    memberLimitPlaceholder: "최대 10명",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "4자리",
    roomNameRequired: "방 이름을 입력해 주세요.",
    memberLimitRequired: "인원 수를 입력해 주세요.",
    memberLimitInvalid: "인원 수는 1명 이상 10명 이하로 입력해 주세요.",
    passwordInvalid: "비밀번호는 숫자 4자리로 입력해 주세요.",
    unknownResult: "방 생성 결과를 확인하지 못했습니다.",
    createFailed: "방 생성에 실패했습니다.",
    recentTemplate: "최근 설정",
    applyTemplate: "적용",
    publicRoom: "공개방",
    privateRoom: "비공개방",
    privateTemplateNotice: "비밀번호는 저장하지 않으니 다시 입력해 주세요."
} as const;

export default function CreateRoomModal() {
    const theme = useFlipTheme();
    const navigation = useNavigation();
    const router = useRouter();
    const { createRoom, isCreatingRoom } = useRoom();
    const { recentRoomTemplate, saveRoomTemplate } = useCreateRoomTemplate();
    const [roomName, setRoomName] = useState("");
    const [memberLimit, setMemberLimit] = useState("");
    const [isPrivateRoom, setIsPrivateRoom] = useState(false);
    const [roomPassword, setRoomPassword] = useState("");

    const isFormValid = useMemo(() => {
        const normalizedName = roomName.trim();
        const parsedMemberLimit = Number(memberLimit);
        const isMemberLimitValid = Number.isInteger(parsedMemberLimit) && parsedMemberLimit >= 1 && parsedMemberLimit <= 10;
        const isPasswordValid = !isPrivateRoom || /^\d{4}$/.test(roomPassword.trim());

        return Boolean(normalizedName && isMemberLimitValid && isPasswordValid);
    }, [isPrivateRoom, memberLimit, roomName, roomPassword]);

    const handleTogglePrivateRoom = () => {
        setIsPrivateRoom(current => {
            if (current) {
                setRoomPassword("");
            }

            return !current;
        });
    };

    const handleApplyRecentTemplate = useCallback(() => {
        if (!recentRoomTemplate) {
            return;
        }

        setRoomName(recentRoomTemplate.roomName);
        setMemberLimit(String(recentRoomTemplate.maxMemberCount));
        setIsPrivateRoom(recentRoomTemplate.isPrivateRoom);
        setRoomPassword("");
    }, [recentRoomTemplate]);

    const handleCreateRoom = useCallback(async () => {
        const normalizedRoomName = roomName.trim();
        const parsedMemberLimit = Number(memberLimit);
        const normalizedPassword = roomPassword.trim();

        if (!normalizedRoomName) {
            Alert.alert(COPY.roomNameRequired);
            return;
        }

        if (!memberLimit.trim()) {
            Alert.alert(COPY.memberLimitRequired);
            return;
        }

        if (!Number.isInteger(parsedMemberLimit) || parsedMemberLimit < 1 || parsedMemberLimit > 10) {
            Alert.alert(COPY.memberLimitInvalid);
            return;
        }

        if (isPrivateRoom && !/^\d{4}$/.test(normalizedPassword)) {
            Alert.alert(COPY.passwordInvalid);
            return;
        }

        try {
            const result = await createRoom({
                name: normalizedRoomName,
                maxMemberCount: parsedMemberLimit,
                password: isPrivateRoom ? normalizedPassword : undefined
            });

            if (result.code === "200_0" && result.data) {
                await saveRoomTemplate({
                    roomName: normalizedRoomName,
                    maxMemberCount: parsedMemberLimit,
                    isPrivateRoom
                });

                router.replace({
                    pathname: "/(score)/[roomId]",
                    params: {
                        roomId: String(result.data)
                    }
                });
                return;
            }

            Alert.alert(COPY.unknownResult);
        } catch (error) {
            const errorMessage = isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message
                : error instanceof Error
                  ? error.message
                  : null;

            Alert.alert(COPY.createFailed, errorMessage ?? "잠시 후 다시 시도해 주세요.");
        }
    }, [createRoom, isPrivateRoom, memberLimit, roomName, roomPassword, router, saveRoomTemplate]);

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            header: () => (
                <Header title="방 만들기">
                    <TouchableOpacity
                        style={styles.headerAction}
                        disabled={!isFormValid || isCreatingRoom}
                        onPress={handleCreateRoom}
                    >
                        <DefaultText Button2 color={!isFormValid || isCreatingRoom ? theme.gray7 : theme.primary}>
                            {isCreatingRoom ? COPY.creating : COPY.create}
                        </DefaultText>
                    </TouchableOpacity>
                </Header>
            )
        });
    }, [handleCreateRoom, isCreatingRoom, isFormValid, navigation, theme.gray7, theme.primary]);

    return (
        <SafeAreaView
            edges={["left", "right", "bottom"]}
            style={[
                styles.container,
                {
                    backgroundColor: theme.white
                }
            ]}
        >
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
                <ScrollView
                    automaticallyAdjustKeyboardInsets
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formBox}>
                        {recentRoomTemplate && (
                            <View style={[styles.templateCard, { backgroundColor: theme.gray8, borderColor: theme.gray7 }]}>
                                <View style={styles.templateContent}>
                                    <DefaultText Button2 weight="800" color={theme.gray2}>
                                        {COPY.recentTemplate}
                                    </DefaultText>
                                    <DefaultText Button3 color={theme.gray4} numberOfLines={1}>
                                        {`${recentRoomTemplate.roomName} · 최대 ${recentRoomTemplate.maxMemberCount}명 · ${
                                            recentRoomTemplate.isPrivateRoom ? COPY.privateRoom : COPY.publicRoom
                                        }`}
                                    </DefaultText>
                                    {recentRoomTemplate.isPrivateRoom && (
                                        <DefaultText Button3 color={theme.gray5}>
                                            {COPY.privateTemplateNotice}
                                        </DefaultText>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={handleApplyRecentTemplate}
                                    style={[styles.templateApplyButton, { backgroundColor: theme.primary }]}
                                >
                                    <DefaultText Button3 weight="800" color={theme.white}>
                                        {COPY.applyTemplate}
                                    </DefaultText>
                                </TouchableOpacity>
                            </View>
                        )}

                        <FormInput
                            label={COPY.roomNameLabel}
                            placeholder={COPY.roomNamePlaceholder}
                            value={roomName}
                            maxLength={30}
                            hasClearButton
                            onClearPress={() => setRoomName("")}
                            onChangeText={setRoomName}
                            multiline={false}
                            numberOfLines={1}
                        />

                        <View style={styles.inlineRow}>
                            <FormInput
                                label={COPY.memberLimitLabel}
                                containerStyle={styles.memberLimitField}
                                placeholder={COPY.memberLimitPlaceholder}
                                value={memberLimit}
                                keyboardType="number-pad"
                                maxLength={2}
                                hasClearButton
                                onClearPress={() => setMemberLimit("")}
                                onChangeText={value => setMemberLimit(value.replace(/[^0-9]/g, ""))}
                                multiline={false}
                                numberOfLines={1}
                            />

                            <TouchableOpacity
                                onPress={handleTogglePrivateRoom}
                                style={[
                                    styles.lockButton,
                                    {
                                        backgroundColor: isPrivateRoom ? "#EEF7FF" : "#F8F4FA"
                                    }
                                ]}
                            >
                                <FlipIcon icon={isPrivateRoom ? "icon-room-lock-on" : "icon-room-lock-off"} size={40} />
                            </TouchableOpacity>

                            <FormInput
                                label={COPY.passwordLabel}
                                containerStyle={styles.passwordField}
                                textContainerStyle={[
                                    styles.passwordInputBox,
                                    !isPrivateRoom && { backgroundColor: "#FAFAFB", borderColor: theme.gray7 }
                                ]}
                                placeholder={COPY.passwordPlaceholder}
                                value={roomPassword}
                                keyboardType="number-pad"
                                maxLength={4}
                                secureTextEntry
                                hasClearButton={isPrivateRoom}
                                disabled={!isPrivateRoom}
                                onClearPress={() => setRoomPassword("")}
                                onChangeText={value => setRoomPassword(value.replace(/[^0-9]/g, ""))}
                                multiline={false}
                                numberOfLines={1}
                                style={styles.passwordInput}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    flex: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: FlipStyles.adjustScale(96)
    },
    formBox: {
        paddingTop: FlipStyles.adjustScale(10),
        paddingHorizontal: FlipStyles.adjustScale(24),
        gap: FlipStyles.adjustScale(12)
    },
    templateCard: {
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(16),
        padding: FlipStyles.adjustScale(14),
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(12)
    },
    templateContent: {
        flex: 1,
        gap: FlipStyles.adjustScale(3)
    },
    templateApplyButton: {
        minHeight: FlipStyles.adjustScale(34),
        borderRadius: FlipStyles.adjustScale(999),
        paddingHorizontal: FlipStyles.adjustScale(14),
        alignItems: "center",
        justifyContent: "center"
    },
    inlineRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: FlipStyles.adjustScale(12)
    },
    memberLimitField: {
        flex: 1.08,
        minWidth: FlipStyles.adjustScale(104)
    },
    passwordField: {
        flex: 1.25,
        minWidth: FlipStyles.adjustScale(120)
    },
    passwordInputBox: {
        minHeight: FlipStyles.adjustScale(48),
        paddingHorizontal: FlipStyles.adjustScale(14)
    },
    passwordInput: {
        width: "100%",
        fontSize: FlipStyles.adjustScale(15)
    },
    lockButton: {
        width: FlipStyles.adjustScale(44),
        height: FlipStyles.adjustScale(44),
        borderRadius: FlipStyles.adjustScale(8),
        alignItems: "center",
        justifyContent: "center",
        marginTop: FlipStyles.adjustScale(30)
    },
    headerAction: {
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingVertical: FlipStyles.adjustScale(17),
        justifyContent: "center",
        alignItems: "center"
    }
});
