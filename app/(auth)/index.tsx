import { login, setAuthSession, useFlipTheme } from "@/common";
import DefaultText from "@/components/base/Text";
import FormTextInput from "@/components/base/TextInput/FormTextInput";
import FlipStyles from "@/styles";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";

type StatusMessage = {
  type: "error" | "success" | "info";
  text: string;
};

const getRouteValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
};

export default function SignIn() {
  const theme = useFlipTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string | string[]; success?: string | string[] }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextEmail = getRouteValue(params.email);
    const success = getRouteValue(params.success);

    if (nextEmail) {
      setEmail(nextEmail);
    }

    if (success === "signup") {
      setMessage({
        type: "success",
        text: "회원가입이 완료되었습니다. 로그인해 주세요."
      });
    } else if (success === "reset") {
      setMessage({
        type: "success",
        text: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요."
      });
    }
  }, [params.email, params.success]);

  const clearMessage = () => {
    if (message) {
      setMessage(null);
    }
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setMessage({
        type: "error",
        text: "이메일과 비밀번호를 모두 입력해 주세요."
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const session = await login({
        email: normalizedEmail,
        password
      });
      setAuthSession(session);

      setMessage({
        type: "success",
        text: "로그인에 성공했습니다."
      });
      router.replace("/(score)");
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
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
          <View style={[styles.card, { backgroundColor: theme.white }]}>
            <View style={styles.heroBlock}>
              <DefaultText Title2 weight="800" color={theme.gray2}>
                FlipSync
              </DefaultText>
              <DefaultText Body1 color={theme.gray4} containerStyle={styles.heroSubtitle}>
                그룹과 점수 기록을 이어가기 위한 로그인 화면입니다.
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

            <View style={styles.formBlock}>
              <FormTextInput
                value={email}
                label="이메일"
                placeholder="example@flipsync.app"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                containerStyle={styles.fieldGap}
                onChangeText={value => {
                  setEmail(value);
                  clearMessage();
                }}
              />
              <FormTextInput
                value={password}
                label="비밀번호"
                placeholder="비밀번호를 입력해 주세요"
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
                containerStyle={styles.fieldGap}
                onChangeText={value => {
                  setPassword(value);
                  clearMessage();
                }}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.primary },
                pressed && !isSubmitting ? styles.primaryButtonPressed : null,
                isSubmitting ? styles.primaryButtonDisabled : null
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <DefaultText Button1 weight="700" color={theme.white}>
                  로그인
                </DefaultText>
              )}
            </Pressable>

            <View style={styles.footerBlock}>
              <DefaultText Body2 color={theme.gray4}>
                아직 계정이 없으신가요?
              </DefaultText>
              <Pressable onPress={() => router.push("/(auth)/signup")}>
                <DefaultText Body2 weight="700" color={theme.primary}>
                  회원가입으로 이동
                </DefaultText>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/reset-password")}
              style={styles.resetLink}
            >
              <DefaultText Body2 weight="700" color={theme.gray4}>
                비밀번호를 잊으셨나요?
              </DefaultText>
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
    justifyContent: "center",
    paddingHorizontal: FlipStyles.basePadding,
    paddingVertical: FlipStyles.adjustScale(28)
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
  formBlock: {
    marginBottom: FlipStyles.adjustScale(20)
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
    opacity: 0.7
  },
  footerBlock: {
    marginTop: FlipStyles.adjustScale(18),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: FlipStyles.adjustScale(6)
  },
  resetLink: {
    marginTop: FlipStyles.adjustScale(14),
    alignItems: "center"
  }
});
