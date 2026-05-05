import {
  persistActiveOrganizationSession,
  useActiveOrganizationSession,
  useFlipTheme
} from "@/common";
import FormTextInput from "@/components/base/TextInput/FormTextInput";
import DefaultText from "@/components/base/Text";
import { toActiveOrganizationSession, useOrganization } from "@/hooks/organization";
import FlipStyles from "@/styles";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

const COPY = {
  requestFailed: "소속 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  inviteInfo: "초대받은 방으로 들어가기 전에 먼저 사용할 소속을 선택해 주세요.",
  manageSwitchInfo: "현재 계정이 가진 다른 소속으로 변경할 수 있습니다.",
  manageAddInfo: "새 소속을 만들거나 초대 코드로 소속을 추가할 수 있습니다.",
  switchTitle: "소속 변경",
  addTitle: "소속 추가",
  title: "소속 선택",
  subtitle:
    "악보 공유방과 악보 창고는 같은 소속 안에서만 사용할 수 있습니다. 로그인 후 사용할 소속을 먼저 선택해 주세요.",
  manageSubtitle: "필요한 작업을 마친 뒤 원래 화면으로 돌아갈 수 있습니다.",
  close: "×",
  organizationList: "내 소속 목록",
  organizationListReadonly: "현재 보유 소속",
  noOrganizations:
    "아직 참여 중인 소속이 없습니다. 아래에서 새 소속을 만들거나 초대 코드로 참여해 주세요.",
  currentSelection: "현재 선택",
  organizationMeta: (creatorName: string, memberCount: number) =>
    `소속장 ${creatorName} · 구성원 ${memberCount}명`,
  inviteCodeLabel: (inviteCode: string) => `초대 코드 ${inviteCode}`,
  createSection: "새 소속 만들기",
  createLabel: "소속 이름",
  createPlaceholder: "예: 플립싱크 바이올린 팀",
  createAction: "소속 생성",
  joinSection: "초대 코드로 참여",
  joinLabel: "초대 코드",
  joinPlaceholder: "예: AB12CD34",
  joinAction: "초대 코드 참여",
  requiredOrganizationName: "소속 이름을 입력해 주세요.",
  requiredInviteCode: "초대 코드를 입력해 주세요.",
  createSuccess: "소속을 만들었습니다. 바로 선택한 소속으로 이동합니다.",
  joinSuccess: "소속에 참여했습니다. 바로 선택한 소속으로 이동합니다."
} as const;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return COPY.requestFailed;
};

export default function OrganizationSelectScreen() {
  const theme = useFlipTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    inviteGroupId?: string | string[];
    mode?: string | string[];
  }>();
  const inviteGroupId = useMemo(() => {
    const raw = params.inviteGroupId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.inviteGroupId]);
  const screenMode = useMemo(() => {
    const raw = params.mode;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params.mode]);
  const activeOrganization = useActiveOrganizationSession();
  const {
    organizations,
    isLoadingOrganizations,
    createOrganization,
    isCreatingOrganization,
    joinOrganization,
    isJoiningOrganization
  } = useOrganization();

  const [organizationName, setOrganizationName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState<StatusMessage | null>(
    inviteGroupId
      ? {
          type: "info",
          text: COPY.inviteInfo
        }
      : screenMode === "switch"
        ? {
            type: "info",
            text: COPY.manageSwitchInfo
          }
        : screenMode === "add"
          ? {
              type: "info",
              text: COPY.manageAddInfo
            }
          : null
  );

  const organizationList = organizations?.data ?? [];
  const isManageMode = screenMode === "switch" || screenMode === "add";
  const isSwitchMode = screenMode === "switch";
  const isAddMode = screenMode === "add";
  const isSubmitting = isCreatingOrganization || isJoiningOrganization;

  const handleClose = () => {
    router.replace("/(score)/organization-info");
  };

  const completeSelection = async (organizationId: number) => {
    const selectedOrganization = organizationList.find(item => item.id === organizationId);
    if (!selectedOrganization) {
      return;
    }

    await persistActiveOrganizationSession(toActiveOrganizationSession(selectedOrganization));
    queryClient.clear();

    if (inviteGroupId) {
      router.replace(`/invite/${inviteGroupId}`);
      return;
    }

    router.replace("/(score)/(tabs)");
  };

  const handleSelectOrganization = async (organizationId: number) => {
    try {
      await completeSelection(organizationId);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error)
      });
    }
  };

  const handleCreateOrganization = async () => {
    if (!organizationName.trim()) {
      setMessage({
        type: "error",
        text: COPY.requiredOrganizationName
      });
      return;
    }

    try {
      const response = await createOrganization({
        name: organizationName.trim()
      });

      setMessage({
        type: "success",
        text: COPY.createSuccess
      });
      setOrganizationName("");
      await persistActiveOrganizationSession(toActiveOrganizationSession(response.data));
      queryClient.clear();

      if (inviteGroupId) {
        router.replace(`/invite/${inviteGroupId}`);
        return;
      }

      router.replace("/(score)/(tabs)");
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error)
      });
    }
  };

  const handleJoinOrganization = async () => {
    if (!inviteCode.trim()) {
      setMessage({
        type: "error",
        text: COPY.requiredInviteCode
      });
      return;
    }

    try {
      const response = await joinOrganization({
        inviteCode: inviteCode.trim().toUpperCase()
      });

      setMessage({
        type: "success",
        text: COPY.joinSuccess
      });
      setInviteCode("");
      await persistActiveOrganizationSession(toActiveOrganizationSession(response.data));
      queryClient.clear();

      if (inviteGroupId) {
        router.replace(`/invite/${inviteGroupId}`);
        return;
      }

      router.replace("/(score)/(tabs)");
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error)
      });
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.gray8 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isAddMode ? styles.compactScrollContent : null]}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isAddMode}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, isAddMode ? styles.compactCard : null, { backgroundColor: theme.white }]}>
            <View style={styles.headerBlock}>
              {isManageMode && (
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <DefaultText Title3 weight="600" color={theme.gray4}>
                    {COPY.close}
                  </DefaultText>
                </Pressable>
              )}
              <DefaultText Title3 weight="800" color={theme.gray2}>
                {isSwitchMode ? COPY.switchTitle : screenMode === "add" ? COPY.addTitle : COPY.title}
              </DefaultText>
              <DefaultText Body2 color={theme.gray4} containerStyle={styles.subtitle}>
                {isManageMode ? COPY.manageSubtitle : COPY.subtitle}
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

            <View style={[styles.section, isAddMode ? styles.compactSection : null]}>
              <DefaultText Button1 weight="700" color={theme.gray3}>
                {isAddMode ? COPY.organizationListReadonly : COPY.organizationList}
              </DefaultText>
              {isLoadingOrganizations ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              ) : organizationList.length === 0 ? (
                <View style={[styles.emptyBox, { borderColor: theme.gray7 }]}>
                  <DefaultText Body2 color={theme.gray5}>
                    {COPY.noOrganizations}
                  </DefaultText>
                </View>
              ) : (
                <View style={isAddMode ? styles.compactOrganizationList : styles.organizationList}>
                  {organizationList.map(organization => {
                    const isActive = activeOrganization?.id === organization.id;

                    return (
                      <Pressable
                        key={`organization-${organization.id}`}
                        disabled={isAddMode}
                        onPress={() => {
                          if (isAddMode) {
                            return;
                          }
                          void handleSelectOrganization(organization.id);
                        }}
                        style={({ pressed }) => [
                          isAddMode ? styles.compactOrganizationCard : styles.organizationCard,
                          {
                            borderColor: isActive ? theme.primary : theme.gray7,
                            backgroundColor: isActive ? theme.primaryLight : theme.white
                          },
                          pressed && !isAddMode ? styles.pressed : null,
                          isAddMode ? styles.readonlyCard : null
                        ]}
                      >
                        <View style={styles.organizationCardHeader}>
                          <DefaultText Body1 weight="700" color={theme.gray2}>
                            {organization.name}
                          </DefaultText>
                          {isActive && (
                            <DefaultText Button3 weight="700" color={theme.primary}>
                              {COPY.currentSelection}
                            </DefaultText>
                          )}
                        </View>
                        <DefaultText Button3 color={theme.gray5}>
                          {COPY.organizationMeta(organization.creatorName, organization.memberCount)}
                        </DefaultText>
                        {!isAddMode && (
                          <DefaultText Button3 color={theme.gray5}>
                            {COPY.inviteCodeLabel(organization.inviteCode)}
                          </DefaultText>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {!isSwitchMode && (
              <>
                <View style={[styles.section, isAddMode ? styles.compactSection : null]}>
                  <DefaultText Button1 weight="700" color={theme.gray3}>
                    {COPY.createSection}
                  </DefaultText>
                  <FormTextInput
                    value={organizationName}
                    label={COPY.createLabel}
                    placeholder={COPY.createPlaceholder}
                    containerStyle={styles.fieldGap}
                    onChangeText={value => {
                      setOrganizationName(value);
                      if (message?.type === "error") {
                        setMessage(null);
                      }
                    }}
                  />
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => void handleCreateOrganization()}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { backgroundColor: theme.primary },
                      pressed ? styles.pressed : null,
                      isSubmitting ? styles.disabled : null
                    ]}
                  >
                    {isCreatingOrganization ? (
                      <ActivityIndicator color={theme.white} />
                    ) : (
                      <DefaultText Button1 weight="700" color={theme.white}>
                        {COPY.createAction}
                      </DefaultText>
                    )}
                  </Pressable>
                </View>

                <View style={[styles.section, isAddMode ? styles.compactSection : null]}>
                  <DefaultText Button1 weight="700" color={theme.gray3}>
                    {COPY.joinSection}
                  </DefaultText>
                  <FormTextInput
                    value={inviteCode}
                    label={COPY.joinLabel}
                    placeholder={COPY.joinPlaceholder}
                    autoCapitalize="characters"
                    containerStyle={styles.fieldGap}
                    onChangeText={value => {
                      setInviteCode(value);
                      if (message?.type === "error") {
                        setMessage(null);
                      }
                    }}
                  />
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => void handleJoinOrganization()}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      { borderColor: theme.primary },
                      pressed ? styles.pressed : null,
                      isSubmitting ? styles.disabled : null
                    ]}
                  >
                    {isJoiningOrganization ? (
                      <ActivityIndicator color={theme.primary} />
                    ) : (
                      <DefaultText Button1 weight="700" color={theme.primary}>
                        {COPY.joinAction}
                      </DefaultText>
                    )}
                  </Pressable>
                </View>
              </>
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
    flexGrow: 1,
    paddingHorizontal: FlipStyles.basePadding,
    paddingVertical: FlipStyles.adjustScale(24)
  },
  compactScrollContent: {
    paddingVertical: FlipStyles.adjustScale(16)
  },
  card: {
    borderRadius: FlipStyles.adjustScale(28),
    paddingHorizontal: FlipStyles.adjustScale(20),
    paddingVertical: FlipStyles.adjustScale(24),
    gap: FlipStyles.adjustScale(22),
    ...FlipStyles.baseBoxShadow
  },
  compactCard: {
    paddingHorizontal: FlipStyles.adjustScale(18),
    paddingVertical: FlipStyles.adjustScale(18),
    gap: FlipStyles.adjustScale(16)
  },
  headerBlock: {
    position: "relative"
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
    width: FlipStyles.adjustScale(36),
    height: FlipStyles.adjustScale(36),
    alignItems: "center",
    justifyContent: "center"
  },
  subtitle: {
    marginTop: FlipStyles.adjustScale(8),
    paddingRight: FlipStyles.adjustScale(28)
  },
  banner: {
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(16),
    paddingHorizontal: FlipStyles.adjustScale(14),
    paddingVertical: FlipStyles.adjustScale(12)
  },
  section: {
    gap: FlipStyles.adjustScale(12)
  },
  compactSection: {
    gap: FlipStyles.adjustScale(8)
  },
  loadingRow: {
    minHeight: FlipStyles.adjustScale(80),
    alignItems: "center",
    justifyContent: "center"
  },
  emptyBox: {
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(16),
    paddingHorizontal: FlipStyles.adjustScale(14),
    paddingVertical: FlipStyles.adjustScale(14)
  },
  organizationList: {
    gap: FlipStyles.adjustScale(10)
  },
  compactOrganizationList: {
    gap: FlipStyles.adjustScale(8)
  },
  organizationCard: {
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(18),
    paddingHorizontal: FlipStyles.adjustScale(16),
    paddingVertical: FlipStyles.adjustScale(16),
    gap: FlipStyles.adjustScale(8)
  },
  compactOrganizationCard: {
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(14),
    paddingHorizontal: FlipStyles.adjustScale(14),
    paddingVertical: FlipStyles.adjustScale(10),
    gap: FlipStyles.adjustScale(4),
    minHeight: FlipStyles.adjustScale(58)
  },
  organizationCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: FlipStyles.adjustScale(12)
  },
  fieldGap: {
    marginBottom: FlipStyles.adjustScale(4)
  },
  primaryButton: {
    minHeight: FlipStyles.adjustScale(52),
    borderRadius: FlipStyles.adjustScale(16),
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButton: {
    minHeight: FlipStyles.adjustScale(52),
    borderRadius: FlipStyles.adjustScale(16),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  pressed: {
    opacity: 0.88
  },
  disabled: {
    opacity: 0.6
  },
  readonlyCard: {
    opacity: 0.9
  }
});
