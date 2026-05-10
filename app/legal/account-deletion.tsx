import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { userApi } from "@/api/user";
import {
    ACTIVE_ORGANIZATION_STORAGE_KEY,
    FLIPSYNC_SUPPORT_EMAIL,
    clearActiveOrganizationSession,
    clearAuthSession,
    getAuthSession,
    openSupportMail,
    subscribeAuthSession,
    useFlipTheme
} from "@/common";
import DefaultText from "@/components/base/Text";
import FormTextInput from "@/components/base/TextInput/FormTextInput";
import FlipStyles from "@/styles";

const SECTIONS = [
    {
        title: "삭제 시 정리되는 정보",
        items: [
            "내 계정 프로필과 로그인 정보",
            "내가 업로드한 개인 프로필 이미지",
            "내가 업로드한 악보 이미지와 공유방 데이터"
        ]
    },
    {
        title: "조직과 방 처리 방식",
        items: [
            "내가 조직장인 조직에 다른 멤버가 있으면 가장 먼저 가입한 멤버에게 권한이 이동할 수 있습니다.",
            "내가 방장인 공유방에 다른 멤버가 있으면 가장 먼저 가입한 멤버에게 방장 권한이 이동할 수 있습니다.",
            "나만 남아 있는 조직이나 공유방은 함께 정리될 수 있습니다."
        ]
    },
    {
        title: "삭제 전 확인할 점",
        items: [
            "계정 삭제 후에는 로그인과 데이터 복구가 어렵습니다.",
            "즉시 삭제가 어려운 상황이 있으면 아래 지원 메일로 문의할 수 있습니다."
        ]
    }
] as const;

export default function AccountDeletionScreen() {
    const theme = useFlipTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [password, setPassword] = useState("");
    const [hasSession, setHasSession] = useState(Boolean(getAuthSession()?.accessToken));
    const { mutateAsync: deleteAccount, isPending: isDeletingAccount } = useMutation({
        mutationFn: userApi.deleteMyAccount
    });

    useEffect(() => {
        return subscribeAuthSession(session => {
            setHasSession(Boolean(session?.accessToken));
        });
    }, []);

    const passwordError = useMemo(() => {
        if (!hasSession) {
            return "로그인한 상태에서만 계정 삭제를 진행할 수 있습니다.";
        }

        if (!password.trim()) {
            return "현재 비밀번호를 입력해 주세요.";
        }

        return null;
    }, [hasSession, password]);

    const handleOpenMail = async () => {
        try {
            await openSupportMail("[FlipSync] 계정 삭제 문의");
        } catch {
            Alert.alert("메일 앱을 열 수 없습니다.", FLIPSYNC_SUPPORT_EMAIL);
        }
    };

    const handleDeleteAccount = () => {
        if (passwordError) {
            Alert.alert("계정 삭제 안내", passwordError);
            return;
        }

        Alert.alert(
            "계정을 삭제할까요?",
            "삭제 후에는 계정과 관련 데이터가 정리되며 복구가 어려울 수 있습니다.",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "계정 삭제",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteAccount({
                                password: password.trim()
                            });
                            await AsyncStorage.removeItem("token");
                            await AsyncStorage.removeItem(ACTIVE_ORGANIZATION_STORAGE_KEY);
                            clearAuthSession();
                            clearActiveOrganizationSession();
                            queryClient.clear();
                            Alert.alert("계정이 삭제되었습니다.");
                            router.replace("/(auth)");
                        } catch (error) {
                            Alert.alert(
                                "계정 삭제 실패",
                                error instanceof Error
                                    ? error.message
                                    : "계정 삭제를 완료하지 못했습니다. 잠시 후 다시 시도해 주세요."
                            );
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.gray8 }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: theme.white }]}>
                    <DefaultText Title3 weight="800" color={theme.gray2}>
                        계정 삭제
                    </DefaultText>
                    <DefaultText Body1 color={theme.gray4} containerStyle={styles.heroText}>
                        앱 안에서 바로 계정 삭제를 요청할 수 있습니다. 아래 안내를 확인한 뒤 현재 비밀번호를 입력해
                        주세요.
                    </DefaultText>

                    {SECTIONS.map(section => (
                        <View key={section.title} style={styles.sectionBlock}>
                            <DefaultText Body1 weight="700" color={theme.gray2} containerStyle={styles.sectionTitle}>
                                {section.title}
                            </DefaultText>
                            {section.items.map(item => (
                                <View key={item} style={styles.bulletRow}>
                                    <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                                    <DefaultText Body2 color={theme.gray3} style={styles.bulletText}>
                                        {item}
                                    </DefaultText>
                                </View>
                            ))}
                        </View>
                    ))}

                    {hasSession ? (
                        <>
                            <FormTextInput
                                value={password}
                                label="현재 비밀번호"
                                placeholder="현재 비밀번호를 입력해 주세요."
                                secureTextEntry
                                autoCapitalize="none"
                                textContentType="password"
                                onChangeText={setPassword}
                                containerStyle={styles.fieldGap}
                            />
                            <DefaultText Button3 color={theme.gray5} containerStyle={styles.helperText}>
                                비밀번호 확인 후 바로 계정이 삭제되고 로그아웃됩니다.
                            </DefaultText>
                            <Pressable
                                disabled={isDeletingAccount}
                                onPress={handleDeleteAccount}
                                style={[
                                    styles.primaryButton,
                                    { backgroundColor: theme.red },
                                    isDeletingAccount && styles.disabledButton
                                ]}
                            >
                                <DefaultText Button1 weight="700" color={theme.white}>
                                    {isDeletingAccount ? "계정 삭제 중..." : "계정 삭제"}
                                </DefaultText>
                            </Pressable>
                        </>
                    ) : (
                        <View style={[styles.noticeCard, { backgroundColor: theme.primaryLight }]}>
                            <DefaultText Body2 color={theme.gray2}>
                                로그인한 상태에서만 즉시 계정 삭제를 진행할 수 있습니다.
                            </DefaultText>
                            <Pressable onPress={() => router.replace("/(auth)")} style={styles.noticeLink}>
                                <DefaultText Button2 weight="700" color={theme.primary}>
                                    로그인 화면으로 이동
                                </DefaultText>
                            </Pressable>
                        </View>
                    )}

                    <View style={[styles.contactCard, { backgroundColor: theme.gray8, borderColor: theme.gray7 }]}>
                        <DefaultText Body2 weight="700" color={theme.gray2}>
                            지원 메일
                        </DefaultText>
                        <DefaultText Body2 color={theme.gray4} containerStyle={styles.contactValue}>
                            {FLIPSYNC_SUPPORT_EMAIL}
                        </DefaultText>
                    </View>

                    <Pressable onPress={handleOpenMail} style={[styles.secondaryButton, { borderColor: theme.gray6 }]}>
                        <DefaultText Button2 weight="700" color={theme.gray2}>
                            삭제 문의 메일 보내기
                        </DefaultText>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push("/legal/privacy-policy")}
                        style={[styles.secondaryButton, { borderColor: theme.gray6 }]}
                    >
                        <DefaultText Button2 weight="700" color={theme.gray2}>
                            개인정보처리방침 보기
                        </DefaultText>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: FlipStyles.basePadding,
        paddingVertical: FlipStyles.adjustScale(24)
    },
    card: {
        borderRadius: FlipStyles.adjustScale(28),
        paddingHorizontal: FlipStyles.adjustScale(20),
        paddingVertical: FlipStyles.adjustScale(24),
        ...FlipStyles.baseBoxShadow
    },
    heroText: {
        marginTop: FlipStyles.adjustScale(8),
        marginBottom: FlipStyles.adjustScale(20)
    },
    sectionBlock: {
        marginBottom: FlipStyles.adjustScale(18)
    },
    sectionTitle: {
        marginBottom: FlipStyles.adjustScale(10)
    },
    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: FlipStyles.adjustScale(8)
    },
    bullet: {
        width: FlipStyles.adjustScale(6),
        height: FlipStyles.adjustScale(6),
        borderRadius: FlipStyles.adjustScale(3),
        marginTop: FlipStyles.adjustScale(8),
        marginRight: FlipStyles.adjustScale(10)
    },
    bulletText: {
        flex: 1
    },
    fieldGap: {
        marginTop: FlipStyles.adjustScale(4),
        marginBottom: FlipStyles.adjustScale(8)
    },
    helperText: {
        marginBottom: FlipStyles.adjustScale(16)
    },
    primaryButton: {
        minHeight: FlipStyles.adjustScale(54),
        borderRadius: FlipStyles.adjustScale(16),
        alignItems: "center",
        justifyContent: "center"
    },
    disabledButton: {
        opacity: 0.7
    },
    noticeCard: {
        borderRadius: FlipStyles.adjustScale(16),
        paddingHorizontal: FlipStyles.adjustScale(14),
        paddingVertical: FlipStyles.adjustScale(14),
        marginTop: FlipStyles.adjustScale(4),
        marginBottom: FlipStyles.adjustScale(16)
    },
    noticeLink: {
        marginTop: FlipStyles.adjustScale(10)
    },
    contactCard: {
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(16),
        paddingHorizontal: FlipStyles.adjustScale(14),
        paddingVertical: FlipStyles.adjustScale(14),
        marginTop: FlipStyles.adjustScale(16),
        marginBottom: FlipStyles.adjustScale(16)
    },
    contactValue: {
        marginTop: FlipStyles.adjustScale(4)
    },
    secondaryButton: {
        minHeight: FlipStyles.adjustScale(48),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(14),
        alignItems: "center",
        justifyContent: "center",
        marginTop: FlipStyles.adjustScale(12)
    }
});
