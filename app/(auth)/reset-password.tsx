import { checkVerifyEmail, resetPassword, useFlipTheme, verifyEmail } from "@/common";
import DefaultText from "@/components/base/Text";
import FormTextInput from "@/components/base/TextInput/FormTextInput";
import FlipStyles from "@/styles";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
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

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
};

export default function ResetPasswordScreen() {
  const theme = useFlipTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [requestedEmail, setRequestedEmail] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [pendingAction, setPendingAction] = useState<"request" | "verify" | "reset" | null>(null);

  const normalizedEmail = email.trim();
  const isVerified = verifiedEmail === normalizedEmail && normalizedEmail.length > 0;
  const canSubmit =
    isVerified &&
    password.length > 0 &&
    passwordConfirm.length > 0 &&
    pendingAction === null;

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
    clearMessage();
  };

  const handleRequestCode = async () => {
    if (!normalizedEmail) {
      setMessage({
        type: "error",
        text: "인증 코드를 받을 이메일을 먼저 입력해 주세요."
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
      setMessage({
        type: "success",
        text: "인증 코드를 보냈습니다. 이메일 확인 후 코드를 입력해 주세요."
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

  const handleCheckCode = async () => {
    if (!normalizedEmail || !code.trim()) {
      setMessage({
        type: "error",
        text: "이메일과 인증 코드를 모두 입력해 주세요."
      });
      return;
    }

    setPendingAction("verify");
    setMessage(null);

    try {
      await checkVerifyEmail({
        email: normalizedEmail,
        code: code.trim()
      });
      setRequestedEmail(normalizedEmail);
      setVerifiedEmail(normalizedEmail);
      setMessage({
        type: "success",
        text: "이메일 인증이 완료되었습니다. 새 비밀번호를 입력해 주세요."
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

  const handleResetPassword = async () => {
    if (!isVerified) {
      setMessage({
        type: "error",
        text: "비밀번호 재설정 전에 이메일 인증을 완료해 주세요."
      });
      return;
    }

    if (!password || !passwordConfirm) {
      setMessage({
        type: "error",
        text: "새 비밀번호와 확인 값을 모두 입력해 주세요."
      });
      return;
    }

    setPendingAction("reset");
    setMessage(null);

    try {
      await resetPassword({
        email: normalizedEmail,
        password,
        passwordConfirm
      });
      router.replace({
        pathname: "/(auth)",
        params: {
          email: normalizedEmail,
          success: "reset"
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
              title: "비밀번호 재설정",
              headerShadowVisible: false
            }}
          />
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <View style={styles.heroBlock}>
              <DefaultText Title3 weight="800" color={theme.gray2}>
                비밀번호 재설정
              </DefaultText>
              <DefaultText Body1 color={theme.gray4} containerStyle={styles.heroSubtitle}>
                가입한 이메일을 인증한 뒤 새 비밀번호로 바로 교체할 수 있습니다.
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
              <FormTextInput
                value={email}
                label="이메일"
                placeholder="example@flipsync.app"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                containerStyle={styles.fieldGap}
                onChangeText={handleEmailChange}
              />

              <Pressable
                accessibilityRole="button"
                disabled={pendingAction !== null}
                onPress={handleRequestCode}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: theme.white,
                    borderColor: theme.gray6
                  },
                  pressed && pendingAction === null ? styles.secondaryButtonPressed : null,
                  pendingAction !== null ? styles.secondaryButtonDisabled : null
                ]}
              >
                {pendingAction === "request" ? (
                  <ActivityIndicator color={theme.primary} />
                ) : (
                  <DefaultText Button2 weight="700" color={theme.gray2}>
                    인증 코드 보내기
                  </DefaultText>
                )}
              </Pressable>
            </View>

            {(requestedEmail === normalizedEmail || isVerified) && (
              <View style={styles.sectionBlock}>
                <FormTextInput
                  value={code}
                  label="인증 코드"
                  placeholder="받은 6자리 코드를 입력해 주세요"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  containerStyle={styles.fieldGap}
                  onChangeText={value => {
                    setCode(value);
                    clearMessage();
                  }}
                />

                <Pressable
                  accessibilityRole="button"
                  disabled={pendingAction !== null || isVerified}
                  onPress={handleCheckCode}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      backgroundColor: isVerified ? theme.primaryLight : theme.white,
                      borderColor: isVerified ? theme.primary : theme.gray6
                    },
                    pressed && pendingAction === null && !isVerified ? styles.secondaryButtonPressed : null,
                    (pendingAction !== null || isVerified) ? styles.secondaryButtonDisabled : null
                  ]}
                >
                  {pendingAction === "verify" ? (
                    <ActivityIndicator color={theme.primary} />
                  ) : (
                    <DefaultText Button2 weight="700" color={isVerified ? theme.primary : theme.gray2}>
                      {isVerified ? "인증 완료" : "인증 확인"}
                    </DefaultText>
                  )}
                </Pressable>
              </View>
            )}

            <View style={styles.sectionBlock}>
              <FormTextInput
                value={password}
                label="새 비밀번호"
                placeholder="새 비밀번호를 입력해 주세요"
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
                label="새 비밀번호 확인"
                placeholder="새 비밀번호를 한 번 더 입력해 주세요"
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                containerStyle={styles.fieldGap}
                onChangeText={value => {
                  setPasswordConfirm(value);
                  clearMessage();
                }}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={handleResetPassword}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary },
                pressed && canSubmit ? styles.primaryButtonPressed : null,
                !canSubmit ? styles.primaryButtonDisabled : null
              ]}
            >
              {pendingAction === "reset" ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <DefaultText Button1 weight="700" color={theme.white}>
                  비밀번호 변경
                </DefaultText>
              )}
            </Pressable>
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
    marginBottom: FlipStyles.adjustScale(20)
  },
  heroSubtitle: {
    marginTop: FlipStyles.adjustScale(8)
  },
  banner: {
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(16),
    paddingHorizontal: FlipStyles.adjustScale(14),
    paddingVertical: FlipStyles.adjustScale(12),
    marginBottom: FlipStyles.adjustScale(16)
  },
  sectionBlock: {
    marginBottom: FlipStyles.adjustScale(18)
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
  secondaryButton: {
    minHeight: FlipStyles.adjustScale(48),
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(14),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: FlipStyles.adjustScale(12)
  },
  secondaryButtonPressed: {
    opacity: 0.82
  },
  secondaryButtonDisabled: {
    opacity: 0.7
  }
});
