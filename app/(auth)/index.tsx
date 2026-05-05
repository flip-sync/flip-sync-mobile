import {
  ACTIVE_ORGANIZATION_STORAGE_KEY,
  clearActiveOrganizationSession,
  login,
  setAuthSession,
  useFlipTheme
} from "@/common";
import DefaultText from "@/components/base/Text";
import FormTextInput from "@/components/base/TextInput/FormTextInput";
import FlipStyles from "@/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const params = useLocalSearchParams<{
    email?: string | string[];
    success?: string | string[];
    inviteGroupId?: string | string[];
  }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDevLoginEnabled = typeof __DEV__ !== "undefined" && __DEV__;

  useEffect(() => {
    const nextEmail = getRouteValue(params.email);
    const success = getRouteValue(params.success);
    const inviteGroupId = getRouteValue(params.inviteGroupId);

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
    } else if (inviteGroupId) {
      setMessage({
        type: "info",
        text: "초대 링크를 열었습니다. 로그인 후 방으로 바로 이동합니다."
      });
    }
  }, [params.email, params.inviteGroupId, params.success]);

  const clearMessage = () => {
    if (message) {
      setMessage(null);
    }
  };

  const submitLogin = async (normalizedEmail: string, normalizedPassword: string) => {
    if (!normalizedEmail || !normalizedPassword) {
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
        password: normalizedPassword
      });
      await AsyncStorage.setItem("token", JSON.stringify(session));
      await AsyncStorage.removeItem(ACTIVE_ORGANIZATION_STORAGE_KEY);
      setAuthSession(session);
      clearActiveOrganizationSession();

      setMessage({
        type: "success",
        text: "로그인에 성공했습니다."
      });

      const inviteGroupId = getRouteValue(params.inviteGroupId);
      if (inviteGroupId) {
        router.replace({
          pathname: "/(auth)/organization-select",
          params: {
            inviteGroupId: String(inviteGroupId)
          }
        });
        return;
      }

      router.replace("/(auth)/organization-select");
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    await submitLogin(email.trim(), password.trim());
  };

  const handleDevQuickLogin = async (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail);
    setPassword(nextPassword);
    await submitLogin(nextEmail, nextPassword);
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
                그룹 연습과 악보 공유를 이어가기 위한 로그인 화면입니다.
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
                placeholder="비밀번호를 입력해 주세요."
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

            {isDevLoginEnabled && (
              <View style={styles.devLoginBlock}>
                <DefaultText Body2 weight="700" color={theme.gray4}>
                  개발용 빠른 로그인
                </DefaultText>
                <View style={styles.devLoginButtons}>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => handleDevQuickLogin("local@flipsync.dev", "Password1234")}
                    style={({ pressed }) => [
                      styles.devLoginButton,
                      { borderColor: theme.primary },
                      pressed && !isSubmitting ? styles.primaryButtonPressed : null
                    ]}
                  >
                    <DefaultText Button2 weight="700" color={theme.primary}>
                      방장 계정
                    </DefaultText>
                  </Pressable>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => handleDevQuickLogin("guest@flipsync.dev", "Guest1234")}
                    style={({ pressed }) => [
                      styles.devLoginButton,
                      { borderColor: theme.gray6 },
                      pressed && !isSubmitting ? styles.primaryButtonPressed : null
                    ]}
                  >
                    <DefaultText Button2 weight="700" color={theme.gray3}>
                      게스트 계정
                    </DefaultText>
                  </Pressable>
                </View>
              </View>
            )}

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
    marginBottom: FlipStyles.adjustScale(16)
  },
  primaryButton: {
    height: FlipStyles.adjustScale(54),
    borderRadius: FlipStyles.adjustScale(16),
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonPressed: {
    opacity: 0.88
  },
  primaryButtonDisabled: {
    opacity: 0.6
  },
  devLoginBlock: {
    gap: FlipStyles.adjustScale(10),
    marginTop: FlipStyles.adjustScale(16)
  },
  devLoginButtons: {
    flexDirection: "row",
    gap: FlipStyles.adjustScale(10)
  },
  devLoginButton: {
    flex: 1,
    minHeight: FlipStyles.adjustScale(46),
    borderRadius: FlipStyles.adjustScale(14),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: FlipStyles.adjustScale(10)
  },
  footerBlock: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: FlipStyles.adjustScale(8),
    marginTop: FlipStyles.adjustScale(18)
  },
  resetLink: {
    alignSelf: "center",
    marginTop: FlipStyles.adjustScale(14)
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

