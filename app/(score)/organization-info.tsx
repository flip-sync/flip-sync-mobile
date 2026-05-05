import {
  persistActiveOrganizationSession,
  removeActiveOrganizationSession,
  useActiveOrganizationSession,
  useFlipTheme
} from "@/common";
import ProfileAvatar from "@/components/base/imgs/ProfileAvatar";
import DefaultText from "@/components/base/Text";
import { toActiveOrganizationSession, useOrganization } from "@/hooks/organization";
import FlipStyles from "@/styles";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COPY = {
  title: "소속 정보",
  currentOrganizationBadge: "현재 소속",
  organizationLeader: "소속장",
  memberCount: "구성원",
  inviteCodeLabel: "초대 코드",
  inviteCodeTapHint: "터치 복사",
  inviteCodeShare: "공유",
  shareInviteCode: "초대 코드 공유",
  changeOrganization: "소속 변경",
  addOrganization: "소속 추가",
  deleteOrganization: "소속 삭제",
  deletingOrganization: "소속 삭제 중...",
  memberList: "멤버 목록",
  leaderBadge: "소속장",
  memberBadge: "멤버",
  managingBadge: "관리 중",
  joinedBadge: "참여 중",
  deleteTitle: "소속 삭제",
  deleteMessage:
    "정말로 이 소속을 삭제할까요? 이 소속에서 연결된 방과 공유 데이터도 함께 정리됩니다.",
  copyInviteCodeTitle: "초대 코드 복사",
  copyInviteCodeMessage: "초대 코드를 복사했습니다.",
  cancel: "취소",
  confirmDelete: "삭제",
  inviteShareMessage: (organizationName: string, inviteCode: string) =>
    `${organizationName} 소속 초대 코드입니다.\n초대 코드: ${inviteCode}`
} as const;

export default function OrganizationInfoScreen() {
  const theme = useFlipTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeOrganization = useActiveOrganizationSession();
  const {
    organizations,
    isLoadingOrganizations,
    organizationDetail,
    isLoadingOrganizationDetail,
    deleteOrganization,
    isDeletingOrganization
  } = useOrganization();

  const organizationList = organizations?.data ?? [];
  const currentOrganization = organizationDetail?.data;
  const otherOrganizations = useMemo(
    () => organizationList.filter(item => item.id !== activeOrganization?.id),
    [activeOrganization?.id, organizationList]
  );

  useEffect(() => {
    if (!activeOrganization?.id) {
      router.replace("/(auth)/organization-select");
    }
  }, [activeOrganization?.id, router]);

  const handleDeleteOrganization = () => {
    if (!activeOrganization?.id || !currentOrganization?.isLeader) {
      return;
    }

    Alert.alert(COPY.deleteTitle, COPY.deleteMessage, [
      { text: COPY.cancel, style: "cancel" },
      {
        text: COPY.confirmDelete,
        style: "destructive",
        onPress: async () => {
          await deleteOrganization(activeOrganization.id);

          if (otherOrganizations[0]) {
            await persistActiveOrganizationSession(toActiveOrganizationSession(otherOrganizations[0]));
            queryClient.clear();
            router.replace("/(score)/(tabs)");
            return;
          }

          await removeActiveOrganizationSession();
          queryClient.clear();
          router.replace("/(auth)/organization-select");
        }
      }
    ]);
  };

  const handleShareInviteCode = async () => {
    if (!currentOrganization) {
      return;
    }

    await Share.share({
      message: COPY.inviteShareMessage(currentOrganization.name, currentOrganization.inviteCode)
    });
  };

  const handleCopyInviteCode = () => {
    if (!currentOrganization?.inviteCode) {
      return;
    }

    Clipboard.setString(currentOrganization.inviteCode);
    Alert.alert(COPY.copyInviteCodeTitle, COPY.copyInviteCodeMessage);
  };

  const handlePressChangeOrganization = () => {
    router.push({
      pathname: "/(auth)/organization-select",
      params: {
        mode: "switch"
      }
    });
  };

  const handlePressAddOrganization = () => {
    router.push({
      pathname: "/(auth)/organization-select",
      params: {
        mode: "add"
      }
    });
  };

  if (!activeOrganization?.id) {
    return null;
  }

  const isLoading = isLoadingOrganizations || isLoadingOrganizationDetail;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.white }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <DefaultText Title3 weight="800" color={theme.gray2}>
            {COPY.title}
          </DefaultText>
          <View style={styles.pageHeaderActions}>
            <Pressable
              onPress={handlePressChangeOrganization}
              style={[styles.titleActionButton, { borderColor: theme.primary }]}
            >
              <DefaultText Button3 weight="700" color={theme.primary}>
                {COPY.changeOrganization}
              </DefaultText>
            </Pressable>
            <Pressable
              onPress={handlePressAddOrganization}
              style={[styles.titleActionButton, { borderColor: theme.gray6 }]}
            >
              <DefaultText Button3 weight="700" color={theme.gray3}>
                {COPY.addOrganization}
              </DefaultText>
            </Pressable>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : currentOrganization ? (
          <>
            <View style={[styles.heroCard, { borderColor: theme.gray7 }]}>
              <View style={styles.heroHeaderRow}>
                <View style={styles.heroTitleBlock}>
                  <DefaultText Title4 weight="800" color={theme.gray2}>
                    {currentOrganization.name}
                  </DefaultText>
                  <DefaultText Button3 color={theme.gray5}>
                    {COPY.organizationLeader} {currentOrganization.creatorName} · {COPY.memberCount}{" "}
                    {currentOrganization.memberCount}명
                  </DefaultText>
                </View>
                <View style={styles.heroTopRow}>
                  <View style={[styles.heroBadge, { backgroundColor: theme.primaryLight }]}>
                    <DefaultText Button3 weight="700" color={theme.primary}>
                      {COPY.currentOrganizationBadge}
                    </DefaultText>
                  </View>
                  <View style={[styles.heroBadge, { backgroundColor: theme.gray8 }]}>
                    <DefaultText Button3 weight="700" color={theme.gray4}>
                      {currentOrganization.isLeader ? COPY.managingBadge : COPY.joinedBadge}
                    </DefaultText>
                  </View>
                </View>
              </View>

              <View style={styles.inviteCodeRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCopyInviteCode}
                  style={[
                    styles.inviteCodeChip,
                    { borderColor: theme.primaryLight, backgroundColor: theme.primaryLight }
                  ]}
                >
                  <View style={styles.inviteCodeTextBlock}>
                    <DefaultText Button3 color={theme.gray4}>
                      {COPY.inviteCodeLabel}
                    </DefaultText>
                    <DefaultText Body2 weight="700" color={theme.primary}>
                      {currentOrganization.inviteCode}
                    </DefaultText>
                  </View>
                  <DefaultText Button3 weight="700" color={theme.primary}>
                    {COPY.inviteCodeTapHint}
                  </DefaultText>
                </TouchableOpacity>
                <Pressable
                  onPress={() => void handleShareInviteCode()}
                  style={[styles.inviteShareChip, { borderColor: theme.primary }]}
                >
                  <DefaultText Button3 weight="700" color={theme.primary}>
                    {COPY.inviteCodeShare}
                  </DefaultText>
                </Pressable>
              </View>
            </View>

            <View style={styles.section}>
              <DefaultText Button1 weight="700" color={theme.gray3}>
                {COPY.memberList}
              </DefaultText>
              <View style={styles.memberList}>
                {currentOrganization.members.map(member => (
                  <View
                    key={`organization-member-${member.userId}`}
                    style={[styles.memberRow, { borderBottomColor: theme.gray7 }]}
                  >
                    <View style={styles.memberInfoRow}>
                      <ProfileAvatar uri={member.profileImageUrl ?? null} size={FlipStyles.adjustScale(42)} />
                      <View style={styles.memberTextBlock}>
                        <DefaultText Body1 weight="600" color={theme.gray2}>
                          {member.name}
                        </DefaultText>
                        <DefaultText Button3 color={theme.gray5}>
                          {member.email}
                        </DefaultText>
                      </View>
                    </View>
                    <DefaultText Button3 weight="700" color={theme.primary}>
                      {member.role === "LEADER" ? COPY.leaderBadge : COPY.memberBadge}
                    </DefaultText>
                  </View>
                ))}
              </View>
            </View>

            {currentOrganization.isLeader && (
              <Pressable
                style={[
                  styles.deleteTextButton,
                  isDeletingOrganization ? styles.disabled : null
                ]}
                disabled={isDeletingOrganization}
                onPress={handleDeleteOrganization}
              >
                <DefaultText Button3 weight="700" color={theme.red}>
                  {isDeletingOrganization ? COPY.deletingOrganization : COPY.deleteOrganization}
                </DefaultText>
              </Pressable>
            )}
          </>
        ) : null}
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
    paddingVertical: FlipStyles.adjustScale(24),
    gap: FlipStyles.adjustScale(18)
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: FlipStyles.adjustScale(10)
  },
  pageHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: FlipStyles.adjustScale(6),
    flexShrink: 0
  },
  titleActionButton: {
    minHeight: FlipStyles.adjustScale(32),
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(10),
    paddingHorizontal: FlipStyles.adjustScale(10),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  loadingBox: {
    minHeight: FlipStyles.adjustScale(160),
    alignItems: "center",
    justifyContent: "center"
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(18),
    paddingHorizontal: FlipStyles.adjustScale(16),
    paddingVertical: FlipStyles.adjustScale(14),
    gap: FlipStyles.adjustScale(10)
  },
  inviteCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: FlipStyles.adjustScale(8)
  },
  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: FlipStyles.adjustScale(10)
  },
  heroTitleBlock: {
    flex: 1,
    gap: FlipStyles.adjustScale(4)
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: FlipStyles.adjustScale(6),
    flexShrink: 0
  },
  heroBadge: {
    minHeight: FlipStyles.adjustScale(24),
    borderRadius: FlipStyles.adjustScale(14),
    paddingHorizontal: FlipStyles.adjustScale(8),
    alignItems: "center",
    justifyContent: "center"
  },
  inviteCodeChip: {
    marginTop: FlipStyles.adjustScale(2),
    minHeight: FlipStyles.adjustScale(44),
    flex: 1,
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(14),
    paddingHorizontal: FlipStyles.adjustScale(12),
    paddingVertical: FlipStyles.adjustScale(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: FlipStyles.adjustScale(10)
  },
  inviteCodeTextBlock: {
    gap: FlipStyles.adjustScale(2),
    flex: 1
  },
  inviteShareChip: {
    minHeight: FlipStyles.adjustScale(36),
    borderWidth: 1,
    borderRadius: FlipStyles.adjustScale(12),
    paddingHorizontal: FlipStyles.adjustScale(12),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  disabled: {
    opacity: 0.6
  },
  deleteTextButton: {
    alignSelf: "flex-end",
    minHeight: FlipStyles.adjustScale(28),
    justifyContent: "center",
    paddingHorizontal: FlipStyles.adjustScale(4)
  },
  section: {
    gap: FlipStyles.adjustScale(12)
  },
  memberList: {
    borderRadius: FlipStyles.adjustScale(16),
    overflow: "hidden"
  },
  memberRow: {
    minHeight: FlipStyles.adjustScale(64),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    gap: FlipStyles.adjustScale(12),
    paddingVertical: FlipStyles.adjustScale(12)
  },
  memberInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: FlipStyles.adjustScale(12),
    flex: 1
  },
  memberTextBlock: {
    gap: FlipStyles.adjustScale(2),
    flex: 1
  }
});
