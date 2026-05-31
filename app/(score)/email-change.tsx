import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { checkVerifyEmail, persistAuthSession, useFlipTheme, verifyEmail } from "@/common";
import DefaultText from "@/components/base/Text";
import FormTextInput from "@/components/base/TextInput/FormTextInput";
import { useUserProfile } from "@/hooks/user";
import FlipStyles from "@/styles";

const COUNTDOWN_SECONDS = 180;

const COPY = {
    title: "\uc774\uba54\uc77c \ubcc0\uacbd",
    save: "\uc800\uc7a5",
    currentEmail: "\ud604\uc7ac \uc774\uba54\uc77c",
    nextEmail: "\ubcc0\uacbd\ud560 \uc774\uba54\uc77c",
    requestCode: "\uc778\uc99d\uc694\uccad",
    verifyCode: "\uc778\uc99d\ubc88\ud638",
    checkCode: "\uc778\uc99d\ud655\uc778",
    verified: "\uc778\uc99d\uc644\ub8cc",
    requestCodeHelp: "\uc0c8 \uc774\uba54\uc77c\ub85c \uc778\uc99d\ubc88\ud638\ub97c \ubcf4\ub0b4\uace0 \ud655\uc778\uae4c\uc9c0 \uc644\ub8cc\ud574 \uc8fc\uc138\uc694.",
    invalidEmail: "\uc62c\ubc14\ub978 \uc774\uba54\uc77c \ud615\uc2dd\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694.",
    codeRequired: "\uc778\uc99d\ubc88\ud638\ub97c \uc785\ub825\ud574 \uc8fc\uc138\uc694.",
    emailUpdated: "\uc774\uba54\uc77c\uc774 \ubcc0\uacbd\ub418\uc5c8\uc2b5\ub2c8\ub2e4.",
    requestErrorTitle: "\uc778\uc99d \uc694\uccad \uc2e4\ud328",
    requestErrorFallback: "\uc778\uc99d \uba54\uc77c\uc744 \ubcf4\ub0b4\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.",
    verifyErrorTitle: "\uc778\uc99d \ud655\uc778 \uc2e4\ud328",
    verifyErrorFallback: "\uc778\uc99d\ubc88\ud638\ub97c \ub2e4\uc2dc \ud655\uc778\ud574 \uc8fc\uc138\uc694.",
    updateErrorTitle: "\uc774\uba54\uc77c \ubcc0\uacbd \uc2e4\ud328",
    updateErrorFallback: "\uc774\uba54\uc77c\uc744 \ubcc0\uacbd\ud558\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.",
    codePlaceholder: "\uc22b\uc790 6\uc790\ub9ac",
    tip: "\uc778\uc99d\ubc88\ud638 \uc22b\uc790 6\uc790\ub9ac\ub97c \uc785\ub825\ud558\uace0 \ud655\uc778\uae4c\uc9c0 \ub9c8\uce58\uba74 \uc800\uc7a5\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
} as const;

const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;
    return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
};

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export default function EmailChangeScreen() {
    const theme = useFlipTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { profile, updateEmail, isUpdatingEmail } = useUserProfile();

    const currentEmail = profile?.data.email ?? "";
    const [nextEmail, setNextEmail] = useState("");
    const [code, setCode] = useState("");
    const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [pendingAction, setPendingAction] = useState<"request" | "verify" | null>(null);

    const normalizedEmail = nextEmail.trim();
    const canRequestCode =
        normalizedEmail.length > 0 &&
        normalizedEmail !== currentEmail &&
        isValidEmail(normalizedEmail) &&
        pendingAction == null;
    const canSave = verifiedEmail === normalizedEmail && !isUpdatingEmail;
    const codeTimerLabel = secondsLeft > 0 ? formatCountdown(secondsLeft) : undefined;

    useEffect(() => {
        if (secondsLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft(current => (current > 0 ? current - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft]);

    const helperText = useMemo(() => {
        if (!normalizedEmail) {
            return COPY.requestCodeHelp;
        }

        if (!isValidEmail(normalizedEmail)) {
            return COPY.invalidEmail;
        }

        return COPY.requestCodeHelp;
    }, [normalizedEmail]);

    const handleRequestCode = async () => {
        if (!canRequestCode) {
            Alert.alert(COPY.invalidEmail);
            return;
        }

        setPendingAction("request");

        try {
            await verifyEmail(normalizedEmail);
            setRequestedEmail(normalizedEmail);
            setVerifiedEmail(null);
            setCode("");
            setSecondsLeft(COUNTDOWN_SECONDS);
        } catch (error) {
            Alert.alert(
                COPY.requestErrorTitle,
                error instanceof Error ? error.message : COPY.requestErrorFallback
            );
        } finally {
            setPendingAction(null);
        }
    };

    const handleCheckCode = async () => {
        if (!code.trim()) {
            Alert.alert(COPY.codeRequired);
            return;
        }

        setPendingAction("verify");

        try {
            await checkVerifyEmail({
                email: normalizedEmail,
                code: code.trim()
            });
            setVerifiedEmail(normalizedEmail);
        } catch (error) {
            Alert.alert(
                COPY.verifyErrorTitle,
                error instanceof Error ? error.message : COPY.verifyErrorFallback
            );
        } finally {
            setPendingAction(null);
        }
    };

    const handleSave = async () => {
        if (!canSave) {
            return;
        }

        try {
            const response = await updateEmail({
                email: normalizedEmail
            });
            await persistAuthSession(response.data);
            await queryClient.invalidateQueries({ queryKey: ["me"] });
            Alert.alert(COPY.emailUpdated);
            router.back();
        } catch (error) {
            Alert.alert(
                COPY.updateErrorTitle,
                error instanceof Error ? error.message : COPY.updateErrorFallback
            );
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.white }]}>
            <Stack.Screen
                options={{
                    title: COPY.title,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <Pressable disabled={!canSave} onPress={handleSave}>
                            <DefaultText Button2 weight="700" color={canSave ? theme.gray2 : theme.gray6}>
                                {COPY.save}
                            </DefaultText>
                        </Pressable>
                    )
                }}
            />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
                <ScrollView
                    automaticallyAdjustKeyboardInsets
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formSection}>
                        <FormTextInput
                            value={currentEmail}
                            label={COPY.currentEmail}
                            disabled
                            containerStyle={styles.fieldGap}
                        />
                        <FormTextInput
                            value={nextEmail}
                            label={COPY.nextEmail}
                            placeholder="hg9822@score.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            hasValidButton
                            validText={COPY.requestCode}
                            onValidPress={handleRequestCode}
                            onChangeText={value => {
                                setNextEmail(value);
                                setCode("");
                                setVerifiedEmail(null);
                            }}
                            containerStyle={styles.fieldGap}
                        />
                        <DefaultText Button3 color={theme.gray5} containerStyle={styles.helperText}>
                            {helperText}
                        </DefaultText>

                        {(requestedEmail === normalizedEmail || verifiedEmail === normalizedEmail) && (
                            <>
                                <FormTextInput
                                    value={code}
                                    label={COPY.verifyCode}
                                    placeholder={COPY.codePlaceholder}
                                    keyboardType="number-pad"
                                    autoCapitalize="none"
                                    time={codeTimerLabel}
                                    hasValidButton
                                    validText={verifiedEmail === normalizedEmail ? COPY.verified : COPY.checkCode}
                                    onValidPress={handleCheckCode}
                                    onChangeText={setCode}
                                    disabled={verifiedEmail === normalizedEmail}
                                    containerStyle={styles.fieldGap}
                                />
                                <View style={[styles.infoBubble, { backgroundColor: theme.primaryLight }]}>
                                    <DefaultText Button3 color={theme.gray2}>
                                        {COPY.tip}
                                    </DefaultText>
                                </View>
                            </>
                        )}

                        {(pendingAction != null || isUpdatingEmail) && (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator size="small" color={theme.primary} />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    flex: {
        flex: 1
    },
    scrollContent: {
        paddingHorizontal: FlipStyles.adjustScale(24),
        paddingTop: FlipStyles.adjustScale(20),
        paddingBottom: FlipStyles.adjustScale(96)
    },
    formSection: {
        marginHorizontal: FlipStyles.adjustScale(10)
    },
    fieldGap: {
        marginBottom: FlipStyles.adjustScale(12)
    },
    helperText: {
        marginTop: FlipStyles.adjustScale(-4),
        marginBottom: FlipStyles.adjustScale(18)
    },
    infoBubble: {
        alignSelf: "flex-start",
        maxWidth: "84%",
        borderRadius: FlipStyles.adjustScale(14),
        paddingHorizontal: FlipStyles.adjustScale(14),
        paddingVertical: FlipStyles.adjustScale(12),
        marginTop: FlipStyles.adjustScale(4)
    },
    loadingRow: {
        marginTop: FlipStyles.adjustScale(18),
        alignItems: "center"
    }
});
