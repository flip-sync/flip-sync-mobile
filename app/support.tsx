import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FLIPSYNC_SUPPORT_EMAIL, openSupportMail, useFlipTheme } from "@/common";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";

const SUPPORT_ITEMS = [
    "로그인 또는 회원가입이 되지 않는 경우",
    "이메일 인증 메일이 오지 않는 경우",
    "악보 업로드 또는 조회에 문제가 있는 경우",
    "계정 삭제 또는 개인정보 관련 문의가 필요한 경우"
] as const;

export default function SupportScreen() {
    const theme = useFlipTheme();
    const router = useRouter();

    const handleOpenMail = async () => {
        try {
            await openSupportMail("[FlipSync] 고객 지원 문의");
        } catch {
            Alert.alert("메일 앱을 열 수 없습니다.", FLIPSYNC_SUPPORT_EMAIL);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.gray8 }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: theme.white }]}>
                    <DefaultText Title3 weight="800" color={theme.gray2}>
                        FlipSync 지원
                    </DefaultText>
                    <DefaultText Body1 color={theme.gray4} containerStyle={styles.heroText}>
                        앱 사용 중 문제가 있거나 계정, 개인정보, 업로드 기능 관련 문의가 필요하면 아래 메일로
                        연락해 주세요.
                    </DefaultText>

                    <View style={[styles.contactCard, { backgroundColor: theme.gray8, borderColor: theme.gray7 }]}>
                        <DefaultText Body2 weight="700" color={theme.gray2}>
                            지원 메일
                        </DefaultText>
                        <DefaultText Body2 color={theme.gray4} containerStyle={styles.contactValue}>
                            {FLIPSYNC_SUPPORT_EMAIL}
                        </DefaultText>
                    </View>

                    <View style={styles.sectionBlock}>
                        <DefaultText Body1 weight="700" color={theme.gray2} containerStyle={styles.sectionTitle}>
                            이런 경우 문의해 주세요
                        </DefaultText>
                        {SUPPORT_ITEMS.map(item => (
                            <View key={item} style={styles.bulletRow}>
                                <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                                <DefaultText Body2 color={theme.gray3} style={styles.bulletText}>
                                    {item}
                                </DefaultText>
                            </View>
                        ))}
                    </View>

                    <Pressable onPress={handleOpenMail} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
                        <DefaultText Button1 weight="700" color={theme.white}>
                            지원 메일 보내기
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

                    <Pressable
                        onPress={() => router.push("/legal/account-deletion")}
                        style={[styles.secondaryButton, { borderColor: theme.gray6 }]}
                    >
                        <DefaultText Button2 weight="700" color={theme.gray2}>
                            계정 삭제 안내 보기
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
    contactCard: {
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(16),
        paddingHorizontal: FlipStyles.adjustScale(14),
        paddingVertical: FlipStyles.adjustScale(14),
        marginBottom: FlipStyles.adjustScale(18)
    },
    contactValue: {
        marginTop: FlipStyles.adjustScale(4)
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
    primaryButton: {
        minHeight: FlipStyles.adjustScale(54),
        borderRadius: FlipStyles.adjustScale(16),
        alignItems: "center",
        justifyContent: "center"
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
