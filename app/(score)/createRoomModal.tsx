import { useFlipTheme } from "@/common";
import { Header } from "@/components/base/Header";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import DefaultText from "@/components/base/Text";
import FormInput from "@/components/base/TextInput/FormTextInput";
import { useRoom } from "@/hooks/room";
import FlipStyles from "@/styles";
import { isAxiosError } from "axios";
import { useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COPY = {
    create: "생성",
    creating: "생성 중...",
    roomNamePlaceholder: "방 제목을 입력해 주세요.",
    memberLimitPlaceholder: "인원 수",
    passwordPlaceholder: "비밀번호 숫자8자리",
    roomNameRequired: "방 이름을 입력해 주세요.",
    memberLimitRequired: "인원 수를 입력해 주세요.",
    memberLimitInvalid: "인원 수는 1명 이상 10명 이하로 입력해 주세요.",
    passwordInvalid: "비밀번호는 숫자 8자리로 입력해 주세요.",
    unknownResult: "방 생성 결과를 확인하지 못했습니다.",
    createFailed: "방 생성에 실패했습니다."
} as const;

export default function CreateRoomModal() {
    const theme = useFlipTheme();
    const navigation = useNavigation();
    const router = useRouter();
    const { createRoom, isCreatingRoom } = useRoom();
    const [roomName, setRoomName] = useState("");
    const [memberLimit, setMemberLimit] = useState("");
    const [isPrivateRoom, setIsPrivateRoom] = useState(false);
    const [roomPassword, setRoomPassword] = useState("");

    const isFormValid = useMemo(() => {
        const normalizedName = roomName.trim();
        const parsedMemberLimit = Number(memberLimit);
        const isMemberLimitValid = Number.isInteger(parsedMemberLimit) && parsedMemberLimit >= 1 && parsedMemberLimit <= 10;
        const isPasswordValid = !isPrivateRoom || /^\d{8}$/.test(roomPassword.trim());

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

        if (isPrivateRoom && !/^\d{8}$/.test(normalizedPassword)) {
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
    }, [createRoom, isPrivateRoom, memberLimit, roomName, roomPassword, router]);

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
            style={[
                styles.container,
                {
                    backgroundColor: theme.white,
                    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
                }
            ]}
        >
            <View style={styles.formBox}>
                <FormInput
                    placeholder={COPY.roomNamePlaceholder}
                    value={roomName}
                    maxLength={30}
                    hasClearButton
                    onClearPress={() => setRoomName("")}
                    onChangeText={setRoomName}
                />

                <View style={styles.inlineRow}>
                    <FormInput
                        containerStyle={styles.memberLimitField}
                        placeholder={COPY.memberLimitPlaceholder}
                        value={memberLimit}
                        keyboardType="number-pad"
                        maxLength={2}
                        hasClearButton
                        onClearPress={() => setMemberLimit("")}
                        onChangeText={value => setMemberLimit(value.replace(/[^0-9]/g, ""))}
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
                        containerStyle={styles.passwordField}
                        textContainerStyle={[
                            styles.passwordInputBox,
                            !isPrivateRoom && { backgroundColor: "#FAFAFB", borderColor: theme.gray7 }
                        ]}
                        placeholder={COPY.passwordPlaceholder}
                        value={roomPassword}
                        keyboardType="number-pad"
                        maxLength={8}
                        secureTextEntry
                        hasClearButton={isPrivateRoom}
                        disabled={!isPrivateRoom}
                        onClearPress={() => setRoomPassword("")}
                        onChangeText={value => setRoomPassword(value.replace(/[^0-9]/g, ""))}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    formBox: {
        paddingTop: FlipStyles.adjustScale(24),
        paddingHorizontal: FlipStyles.adjustScale(36),
        gap: FlipStyles.adjustScale(14)
    },
    inlineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(12)
    },
    memberLimitField: {
        flex: 1.12
    },
    passwordField: {
        flex: 1
    },
    passwordInputBox: {
        minHeight: FlipStyles.adjustScale(48)
    },
    lockButton: {
        width: FlipStyles.adjustScale(44),
        height: FlipStyles.adjustScale(44),
        borderRadius: FlipStyles.adjustScale(8),
        alignItems: "center",
        justifyContent: "center"
    },
    headerAction: {
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingVertical: FlipStyles.adjustScale(17),
        justifyContent: "center",
        alignItems: "center"
    }
});
