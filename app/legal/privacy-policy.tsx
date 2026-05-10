import { useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    FLIPSYNC_PRIVACY_POLICY_EFFECTIVE_DATE,
    FLIPSYNC_SUPPORT_EMAIL,
    openSupportMail,
    useFlipTheme
} from "@/common";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";

const SECTIONS = [
    {
        title: "수집하는 정보",
        items: [
            "이메일 주소, 이름 또는 닉네임, 비밀번호와 같은 계정 정보",
            "프로필 이미지, 업로드한 악보 이미지, 조직 및 공유방 참여 정보",
            "서비스 운영과 안정성 확보를 위한 기본 접속 기록과 오류 로그"
        ]
    },
    {
        title: "이용 목적",
        items: [
            "회원가입, 로그인, 이메일 인증, 계정 식별과 같은 기본 인증 기능 제공",
            "조직 관리, 공유방 운영, 악보 업로드 및 공유 기능 제공",
            "문의 대응, 장애 대응, 서비스 품질 개선"
        ]
    },
    {
        title: "보관 및 삭제",
        items: [
            "계정이 유지되는 동안 서비스 제공에 필요한 정보를 보관합니다.",
            "계정 삭제 요청이 접수되면 관련 법령 또는 분쟁 대응에 필요한 경우를 제외하고 지체 없이 삭제를 진행합니다.",
            "법적 보관 의무가 있는 일부 기록은 해당 기간 동안 별도로 보관될 수 있습니다."
        ]
    },
    {
        title: "제3자 제공 및 처리 위탁",
        items: [
            "사용자 동의 또는 법적 근거 없이 개인정보를 판매하거나 임의로 외부에 제공하지 않습니다.",
            "서비스 운영에 필요한 범위에서 메일 발송 또는 저장 서비스를 사용할 수 있습니다."
        ]
    },
    {
        title: "이용자 권리",
        items: [
            "앱 안에서 프로필 정보 확인과 수정이 가능합니다.",
            "앱 안에서 계정 삭제 요청 경로를 통해 계정 삭제를 요청할 수 있습니다.",
            "개인정보 관련 문의는 아래 지원 메일로 접수할 수 있습니다."
        ]
    }
] as const;

export default function PrivacyPolicyScreen() {
    const theme = useFlipTheme();
    const router = useRouter();

    const handleOpenMail = async () => {
        try {
            await openSupportMail("[FlipSync] 개인정보 문의");
        } catch {
            Alert.alert("메일 앱을 열 수 없습니다.", FLIPSYNC_SUPPORT_EMAIL);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.gray8 }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: theme.white }]}>
                    <DefaultText Title3 weight="800" color={theme.gray2}>
                        FlipSync 개인정보처리방침
                    </DefaultText>
                    <DefaultText Body2 color={theme.gray4} containerStyle={styles.heroText}>
                        시행일: {FLIPSYNC_PRIVACY_POLICY_EFFECTIVE_DATE}
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

                    <View style={[styles.contactCard, { backgroundColor: theme.gray8, borderColor: theme.gray7 }]}>
                        <DefaultText Body2 weight="700" color={theme.gray2}>
                            문의 메일
                        </DefaultText>
                        <DefaultText Body2 color={theme.gray4} containerStyle={styles.contactValue}>
                            {FLIPSYNC_SUPPORT_EMAIL}
                        </DefaultText>
                    </View>

                    <Pressable onPress={handleOpenMail} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
                        <DefaultText Button1 weight="700" color={theme.white}>
                            문의 메일 보내기
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
    contactCard: {
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(16),
        paddingHorizontal: FlipStyles.adjustScale(14),
        paddingVertical: FlipStyles.adjustScale(14),
        marginTop: FlipStyles.adjustScale(6),
        marginBottom: FlipStyles.adjustScale(16)
    },
    contactValue: {
        marginTop: FlipStyles.adjustScale(4)
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
