import { checkVerifyEmail, signup, useFlipTheme, verifyEmail } from "@/common";
import DefaultText from "@/components/base/Text";
import FormTextInput from "@/components/base/TextInput/FormTextInput";
import FlipStyles from "@/styles";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StatusMessage = {
  type: "error" | "success" | "info";
  text: string;
};

const VERIFY_CODE_COOLDOWN_SECONDS = 60;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
};

const getCooldownSecondsFromMessage = (message: string) => {
  const match = message.match(/(\d+)\s*초/);
  if (!match) {
    return 0;
  }

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) ? seconds : 0;
};

export default function SignUp() {
  const theme = useFlipTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [pendingAction, setPendingAction] = useState<"request" | "verify" | "signup" | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const normalizedEmail = email.trim();
  const normalizedCode = code.trim();
  const isVerified = verifiedEmail === normalizedEmail && normalizedEmail.length > 0;
  const showCodeField = requestedEmail === normalizedEmail || isVerified;
  const canSubmit =
    isVerified &&
    normalizedEmail.length > 0 &&
    name.trim().length > 0 &&
    password.length > 0 &&
    passwordConfirm.length > 0 &&
    pendingAction === null;
  const isRequestDisabled =
    pendingAction !== null || normalizedEmail.length === 0 || resendCooldown > 0;
  const isVerifyDisabled = pendingAction !== null || normalizedCode.length !== 6 || isVerified;

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown(previous => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const clearMessage = () => {
    if (message) {
      setMessage(null);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setCode("");
    setRequestedEmail(null);
    setVerifiedEmail(null);
    setResendCooldown(0);
    clearMessage();
  };

  const handleRequestCode = async () => {
    if (!normalizedEmail) {
      setMessage({
        type: "error",
        text: "이메일을 먼저 입력해 주세요."
      });
      return;
    }

    setPendingAction("request");
    setMessage(null);

    try {
      await verifyEmail(normalizedEmail);
      setRequestedEmail(normalizedEmail);
      setVerifiedEmail(null);
      setCode("");
      setResendCooldown(VERIFY_CODE_COOLDOWN_SECONDS);
      setMessage({
        type: "success",
        text: "인증번호를 보냈습니다. 5분 안에 입력해 주세요."
      });
    } catch (error) {
      const nextMessage = getErrorMessage(error);
      const cooldownSeconds = getCooldownSecondsFromMessage(nextMessage);
      if (cooldownSeconds > 0) {
        setResendCooldown(cooldownSeconds);
      }

      setMessage({
        type: "error",
        text: nextMessage
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleCheckCode = async () => {
    if (!normalizedEmail || !normalizedCode) {
      setMessage({
        type: "error",
        text: "이메일과 인증번호를 모두 입력해 주세요."
      });
      return;
    }

    setPendingAction("verify");
    setMessage(null);

    try {
      await checkVerifyEmail({
        email: normalizedEmail,
        code: normalizedCode
      });
      setRequestedEmail(normalizedEmail);
      setVerifiedEmail(normalizedEmail);
      setMessage({
        type: "success",
        text: "이메일 인증이 완료되었습니다."
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error)
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleSignUp = async () => {
    if (!isVerified) {
      setMessage({
        type: "error",
        text: "회원가입 전에 이메일 인증을 완료해 주세요."
      });
      return;
    }

    if (!name.trim() || !password || !passwordConfirm) {
      setMessage({
        type: "error",
        text: "이름과 비밀번호를 모두 입력해 주세요."
      });
      return;
    }

    setPendingAction("signup");
    setMessage(null);

    try {
      await signup({
        email: normalizedEmail,
        name: name.trim(),
        password,
        passwordConfirm
      });

      router.replace({
        pathname: "/(auth)",
        params: {
          email: normalizedEmail,
          success: "signup"
        }
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error)
      });
    } finally {
      setPendingAction(null);
    }
  };

  const requestButtonLabel =
    pendingAction === "request"
      ? "전송 중"
      : requestedEmail === normalizedEmail
        ? resendCooldown > 0
          ? `${resendCooldown}초`
          : "재전송"
        : "발송";

  const verifyButtonLabel =
    pendingAction === "verify" ? "확인 중" : isVerified ? "완료" : "확인";

  const verificationHint = isVerified
    ? "인증이 완료된 이메일입니다."
    : showCodeField
      ? resendCooldown > 0
        ? `인증번호는 5분 동안 유효하며, ${resendCooldown}초 후 다시 요청할 수 있습니다.`
        : "인증번호는 5분 동안 유효합니다."
      : "인증번호는 60초에 한 번만 요청할 수 있습니다.";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.gray8 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Stack.Screen
            options={{
              title: "회원가입",
              headerShadowVisible: false
            }}
          />
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <View style={styles.heroBlock}>
              <DefaultText Title3 weight="800" color={theme.gray2}>
                새 계정 만들기
              </DefaultText>
              <DefaultText Body1 color={theme.gray4} containerStyle={styles.heroSubtitle}>
                이메일 인증 후 이름과 비밀번호만 입력하면 바로 시작할 수 있어요.
              </DefaultText>
            </View>

            {message && (
              <View
                style={[
                  styles.banner,
                  {
                    backgroundColor: message.type === "error" ? "#FDECEC" : theme.primaryLight,
                    borderColor: message.type === "error" ? "#F4B7B2" : theme.primary
                  }
                ]}
              >
                <DefaultText Body2 color={message.type === "error" ? theme.red : theme.gray2}>
                  {message.text}
                </DefaultText>
              </View>
            )}

            <View style={styles.sectionBlock}>
              <DefaultText Body1 weight="700" color={theme.gray2} containerStyle={styles.sectionTitle}>
                이메일 인증
              </DefaultText>
              <View style={styles.inlineActionRow}>
                <View style={styles.inlineField}>
                  <FormTextInput
                    value={email}
                    label="이메일"
                    placeholder="example@flipsync.app"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    onChangeText={handleEmailChange}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  disabled={isRequestDisabled}
                  onPress={handleRequestCode}
                  style={({ pressed }) => [
                    styles.inlineButton,
                    {
                      backgroundColor: isRequestDisabled ? theme.gray8 : theme.white,
                      borderColor: resendCooldown > 0 ? theme.gray6 : theme.primary
                    },
                    pressed && !isRequestDisabled ? styles.secondaryButtonPressed : null,
                    isRequestDisabled ? styles.secondaryButtonDisabled : null
                  ]}
                >
                  {pendingAction === "request" ? (
                    <ActivityIndicator color={theme.primary} />
                  ) : (
                    <DefaultText Button2 weight="700" color={resendCooldown > 0 ? theme.gray4 : theme.primary}>
                      {requestButtonLabel}
                    </DefaultText>
                  )}
                </Pressable>
              </View>

              <DefaultText Body2 color={isVerified ? theme.primary : theme.gray4} containerStyle={styles.helperText}>
                {verificationHint}
              </DefaultText>

              {showCodeField && (
                <View style={styles.inlineActionRow}>
                  <View style={styles.inlineField}>
                    <FormTextInput
                      value={code}
                      label="인증번호"
                      placeholder="6자리 숫자 입력"
                      keyboardType="number-pad"
                      autoCapitalize="none"
                      maxLength={6}
                      onChangeText={value => {
                        setCode(value.replace(/[^0-9]/g, "").slice(0, 6));
                        clearMessage();
                      }}
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isVerifyDisabled}
                    onPress={handleCheckCode}
                    style={({ pressed }) => [
                      styles.inlineButton,
                      {
                        backgroundColor: isVerified ? theme.primaryLight : theme.white,
                        borderColor: isVerified ? theme.primary : theme.gray6
                      },
                      pressed && !isVerifyDisabled ? styles.secondaryButtonPressed : null,
                      isVerifyDisabled ? styles.secondaryButtonDisabled : null
                    ]}
                  >
                    {pendingAction === "verify" ? (
                      <ActivityIndicator color={theme.primary} />
                    ) : (
                      <DefaultText Button2 weight="700" color={isVerified ? theme.primary : theme.gray2}>
                        {verifyButtonLabel}
                      </DefaultText>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.sectionBlock}>
              <DefaultText Body1 weight="700" color={theme.gray2} containerStyle={styles.sectionTitle}>
                기본 정보
              </DefaultText>
              <FormTextInput
                value={name}
                label="이름"
                placeholder="표시할 이름을 입력해 주세요."
                containerStyle={styles.fieldGap}
                onChangeText={value => {
                  setName(value);
                  clearMessage();
                }}
              />
              <FormTextInput
                value={password}
                label="비밀번호"
                placeholder="비밀번호를 입력해 주세요."
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                containerStyle={styles.fieldGap}
                onChangeText={value => {
                  setPassword(value);
                  clearMessage();
                }}
              />
              <FormTextInput
                value={passwordConfirm}
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력해 주세요."
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                onChangeText={value => {
                  setPasswordConfirm(value);
                  clearMessage();
                }}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={handleSignUp}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary },
                pressed && canSubmit ? styles.primaryButtonPressed : null,
                !canSubmit ? styles.primaryButtonDisabled : null
              ]}
            >
              {pendingAction === "signup" ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <DefaultText Button1 weight="700" color={theme.white}>
                  회원가입 완료
                </DefaultText>
              )}
            </Pressable>

            <View style={styles.footerBlock}>
              <DefaultText Body2 color={theme.gray4}>
                이미 계정이 있으신가요?
              </DefaultText>
              <Pressable onPress={() => router.back()}>
                <DefaultText Body2 weight="700" color={theme.primary}>
                  로그인으로 돌아가기
                </DefaultText>
              </Pressable>
            </View>

            <View style={styles.legalRow}>
              <Pressable onPress={() => router.push("/legal/privacy-policy")}>
                <DefaultText Body2 weight="700" color={theme.gray4}>
                  개인정보처리방침
                </DefaultText>
              </Pressable>
              <View style={[styles.legalDivider, { backgroundColor: theme.gray6 }]} />
              <Pressable onPress={() => router.push("/legal/account-deletion")}>
                <DefaultText Body2 weight="700" color={theme.gray4}>
                  계정 삭제 안내
                </DefaultText>
              </Pressable>
            </View>
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
    flexGrow: 1,
    paddingHorizontal: FlipStyles.basePadding,
    paddingVertical: FlipStyles.adjustScale(24)
  },
  card: {
    borderRadius: FlipStyles.adjustScale(28),
    paddingHorizontal: FlipStyles.adjustScale(20),
    paddingVertical: FlipStyles.adjustScale(24),
    ...FlipStyles.baseBoxShadow
  },
  heroBlock: {
    marginBottom: FlipStyles.adjustScale(18)
  },
  heroSubtitle: {
    marginTop: FlipStyles.adjustScale(8)
  },
  banner: {
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(16),
    paddingHorizontal: FlipStyles.adjustScale(14),
    paddingVertical: FlipStyles.adjustScale(10),
    marginBottom: FlipStyles.adjustScale(14)
  },
  sectionBlock: {
    marginBottom: FlipStyles.adjustScale(16)
  },
  sectionTitle: {
    marginBottom: FlipStyles.adjustScale(8)
  },
  inlineActionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: FlipStyles.adjustScale(10),
    marginBottom: FlipStyles.adjustScale(8)
  },
  inlineField: {
    flex: 1
  },
  inlineButton: {
    minWidth: FlipStyles.adjustScale(92),
    height: FlipStyles.adjustScale(50),
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(14),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: FlipStyles.adjustScale(12),
    marginBottom: FlipStyles.adjustScale(1)
  },
  helperText: {
    marginBottom: FlipStyles.adjustScale(6)
  },
  fieldGap: {
    marginBottom: FlipStyles.adjustScale(12)
  },
  primaryButton: {
    minHeight: FlipStyles.adjustScale(56),
    borderRadius: FlipStyles.adjustScale(16),
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonPressed: {
    opacity: 0.9
  },
  primaryButtonDisabled: {
    opacity: 0.55
  },
  secondaryButtonPressed: {
    opacity: 0.82
  },
  secondaryButtonDisabled: {
    opacity: 0.7
  },
  footerBlock: {
    marginTop: FlipStyles.adjustScale(18),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: FlipStyles.adjustScale(6)
  },
  legalRow: {
    marginTop: FlipStyles.adjustScale(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FlipStyles.adjustScale(10)
  },
  legalDivider: {
    width: 1,
    height: FlipStyles.adjustScale(12)
  }
});
