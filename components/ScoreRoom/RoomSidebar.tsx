import { tRoomDetail } from "@/api/room";
import { tConnectedRoomMember } from "@/api/score/types";
import { useFlipTheme } from "@/common";
import ProfileAvatar from "@/components/base/imgs/ProfileAvatar";
import DefaultText from "@/components/base/Text";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import FlipStyles from "@/styles";
import Modal from "react-native-modal";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type VisibleRoomMember = {
    userId: number;
    userName: string;
    isCreator: boolean;
    isConnected: boolean;
    profileImageUrl?: string | null;
};

type RoomSidebarProps = {
    groupId: number;
    roomTitle: string;
    creatorId?: number;
    currentUserId?: number;
    isCreator: boolean;
    isProcessingRoomAction?: boolean;
    visible: boolean;
    connectedMembers: tConnectedRoomMember[];
    groupMembers: tRoomDetail[];
    onClose: () => void;
    onInvite: () => void;
    onLeaveRoom: (delegateUserId?: number) => Promise<void>;
    onTransferOwner: (delegateUserId: number) => Promise<void>;
    onDeleteRoom: () => void;
    onKickMember: (targetUserId: number, targetUserName: string) => Promise<void>;
};

export const RoomSidebar = ({
    groupId,
    roomTitle,
    creatorId,
    currentUserId,
    isCreator,
    isProcessingRoomAction = false,
    visible,
    connectedMembers,
    groupMembers,
    onClose,
    onInvite,
    onLeaveRoom,
    onTransferOwner,
    onDeleteRoom,
    onKickMember
}: RoomSidebarProps) => {
    const theme = useFlipTheme();
    const [delegateMode, setDelegateMode] = useState<"leave" | "transfer" | null>(null);

    const visibleMembers = useMemo(() => {
        const memberMap = new Map<number, VisibleRoomMember>();

        groupMembers.forEach(member => {
            memberMap.set(member.id, {
                userId: member.id,
                userName: member.name,
                isCreator: member.id === creatorId,
                isConnected: false,
                profileImageUrl: member.profileImageUrl
            });
        });

        connectedMembers.forEach(member => {
            const existingMember = memberMap.get(member.userId);
            if (!existingMember) {
                return;
            }

            memberMap.set(member.userId, {
                userId: member.userId,
                userName: existingMember.userName,
                isCreator: existingMember.isCreator,
                isConnected: true,
                profileImageUrl: existingMember.profileImageUrl ?? member.profileImageUrl
            });
        });

        return Array.from(memberMap.values()).sort((left, right) => {
            if (left.isCreator !== right.isCreator) {
                return left.isCreator ? -1 : 1;
            }

            if (left.isConnected !== right.isConnected) {
                return left.isConnected ? -1 : 1;
            }

            return left.userName.localeCompare(right.userName);
        });
    }, [connectedMembers, creatorId, groupMembers]);
    const connectedMemberCount = visibleMembers.filter(member => member.isConnected).length;
    const delegateCandidates = visibleMembers.filter(member => member.userId !== (currentUserId ?? creatorId));
    const delegatePanelTitle = delegateMode === "leave" ? "위임 후 나가기" : "방장 위임";

    const handleLeavePress = () => {
        if (isProcessingRoomAction) {
            return;
        }

        if (isCreator && delegateCandidates.length > 0) {
            setDelegateMode("leave");
            return;
        }

        Alert.alert(
            "방 나가기",
            isCreator
                ? "혼자 있는 방이라 나가면 방이 삭제됩니다. 계속할까요?"
                : "이 방에서 나가시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "나가기",
                    style: "destructive",
                    onPress: () => {
                        void onLeaveRoom();
                    }
                }
            ]
        );
    };

    const handleTransferPress = () => {
        if (isProcessingRoomAction) {
            return;
        }

        if (delegateCandidates.length === 0) {
            Alert.alert("위임할 멤버 없음", "방장으로 위임할 다른 참여자가 없습니다.");
            return;
        }

        setDelegateMode("transfer");
    };

    const handleSelectDelegate = (delegateUserId: number) => {
        if (isProcessingRoomAction || delegateMode == null) {
            return;
        }

        if (delegateMode === "leave") {
            Alert.alert("방장 위임 후 나가기", "선택한 멤버에게 방장을 위임하고 방에서 나갈까요?", [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "나가기",
                    style: "destructive",
                    onPress: () => {
                        void onLeaveRoom(delegateUserId);
                    }
                }
            ]);
            return;
        }

        void onTransferOwner(delegateUserId).then(() => setDelegateMode(null));
    };

    const handleKickPress = (member: VisibleRoomMember) => {
        if (isProcessingRoomAction) {
            return;
        }

        Alert.alert("멤버 강퇴", `${member.userName}님을 이 방에서 내보낼까요?`, [
            {
                text: "취소",
                style: "cancel"
            },
            {
                text: "강퇴",
                style: "destructive",
                onPress: () => {
                    void onKickMember(member.userId, member.userName);
                }
            }
        ]);
    };

    const handleClose = () => {
        setDelegateMode(null);
        onClose();
    };

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={handleClose}
            onBackButtonPress={handleClose}
            animationIn="slideInRight"
            animationOut="slideOutRight"
            backdropOpacity={0.32}
            style={styles.modal}
            useNativeDriver
            hideModalContentWhileAnimating
        >
            <SafeAreaView edges={["top", "right", "bottom"]} style={[styles.panel, { backgroundColor: theme.white }]}> 
                <View style={styles.headerSection}>
                    <View style={styles.headerCopy}>
                        <DefaultText Title4 weight="700" color={theme.gray2}>
                            채팅방 정보
                        </DefaultText>
                        <DefaultText Body2 color={theme.gray4}>
                            {roomTitle}
                        </DefaultText>
                        <DefaultText Button3 color={theme.gray5}>
                            방 번호 {groupId}
                        </DefaultText>
                    </View>
                    <TouchableOpacity
                        style={[styles.closeButton, { borderColor: theme.gray7 }]}
                        onPress={handleClose}
                    >
                        <FlipIcon icon="icon-close" size={16} color={theme.gray3} />
                    </TouchableOpacity>
                </View>

                <View style={styles.actionSection}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        disabled={isProcessingRoomAction}
                        onPress={onInvite}
                        style={[styles.actionIconButton, { opacity: isProcessingRoomAction ? 0.5 : 1 }]}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: theme.primaryLight }]}>
                            <FlipIcon icon="icon-plus" size={18} color={theme.primary} />
                        </View>
                        <DefaultText Button3 weight="700" color={theme.gray3}>
                            초대
                        </DefaultText>
                    </TouchableOpacity>
                    {isCreator && (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            disabled={isProcessingRoomAction}
                            onPress={handleTransferPress}
                            style={[styles.actionIconButton, { opacity: isProcessingRoomAction ? 0.5 : 1 }]}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: theme.gray8 }]}>
                                <FlipIcon icon="icon-users" size={18} color={theme.gray3} />
                            </View>
                            <DefaultText Button3 weight="700" color={theme.gray2}>
                                위임
                            </DefaultText>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        activeOpacity={0.9}
                        disabled={isProcessingRoomAction}
                        onPress={handleLeavePress}
                        style={[styles.actionIconButton, { opacity: isProcessingRoomAction ? 0.5 : 1 }]}
                    >
                        <View style={[styles.actionIconCircle, { backgroundColor: theme.gray8 }]}>
                            <FlipIcon icon="icon-back" size={18} color={theme.gray3} />
                        </View>
                        <DefaultText Button3 weight="700" color={theme.gray2}>
                            나가기
                        </DefaultText>
                    </TouchableOpacity>
                    {isCreator && (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            disabled={isProcessingRoomAction}
                            onPress={onDeleteRoom}
                            style={[styles.actionIconButton, { opacity: isProcessingRoomAction ? 0.5 : 1 }]}
                        >
                            <View style={[styles.actionIconCircle, { backgroundColor: "#FFF1F1" }]}>
                                <FlipIcon icon="icon-delete" size={18} color="#E54747" />
                            </View>
                            <DefaultText Button3 weight="800" color="#E54747">
                                삭제
                            </DefaultText>
                        </TouchableOpacity>
                    )}
                    {isProcessingRoomAction && <ActivityIndicator size="small" color={theme.primary} />}
                </View>

                {delegateMode && (
                    <View style={[styles.delegatePanel, { backgroundColor: theme.gray8, borderColor: theme.gray7 }]}>
                        <View style={styles.delegateHeader}>
                            <View style={styles.delegateCopy}>
                                <DefaultText Body2 weight="800" color={theme.gray2}>
                                    {delegatePanelTitle}
                                </DefaultText>
                                <DefaultText Button3 color={theme.gray5}>
                                    위임할 멤버를 선택해주세요.
                                </DefaultText>
                            </View>
                            <TouchableOpacity onPress={() => setDelegateMode(null)} style={styles.delegateCancel}>
                                <DefaultText Button3 weight="700" color={theme.gray4}>
                                    취소
                                </DefaultText>
                            </TouchableOpacity>
                        </View>
                        {delegateCandidates.map(member => (
                            <TouchableOpacity
                                key={`delegate-${member.userId}`}
                                activeOpacity={0.9}
                                disabled={isProcessingRoomAction}
                                onPress={() => handleSelectDelegate(member.userId)}
                                style={[styles.delegateRow, { borderTopColor: theme.gray7 }]}
                            >
                                <ProfileAvatar uri={member.profileImageUrl} size={FlipStyles.adjustScale(30)} />
                                <DefaultText Body2 weight="700" color={theme.gray2} numberOfLines={1}>
                                    {member.userName}
                                </DefaultText>
                                <DefaultText Button3 color={member.isConnected ? theme.primary : theme.gray5}>
                                    {member.isConnected ? "접속 중" : "미접속"}
                                </DefaultText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <DefaultText Body1 weight="700" color={theme.gray2}>
                        참여 멤버
                    </DefaultText>
                    <DefaultText Button3 color={theme.gray4}>
                        {connectedMemberCount}/{visibleMembers.length}명 접속 중
                    </DefaultText>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.memberList}>
                    {visibleMembers.map(member => (
                        <View
                            key={`${member.userId}-${member.userName}`}
                            style={[styles.memberRow, { borderBottomColor: theme.gray7 }]}
                        >
                            <ProfileAvatar uri={member.profileImageUrl} size={FlipStyles.adjustScale(36)} />
                            <View style={styles.memberCopy}>
                                <DefaultText Body2 weight="700" color={theme.gray2}>
                                    {member.userName}
                                </DefaultText>
                                <DefaultText Button3 color={member.isConnected ? theme.primary : theme.gray5}>
                                    {member.isConnected ? "접속 중" : "미접속"}
                                </DefaultText>
                            </View>
                            {member.isCreator && (
                                <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}> 
                                    <DefaultText Button3 weight="700" color={theme.primary}>
                                        방장
                                    </DefaultText>
                                </View>
                            )}
                            {member.userId === currentUserId && (
                                <View style={[styles.meBadge, { backgroundColor: theme.gray8, borderColor: theme.gray7 }]}>
                                    <DefaultText Button3 weight="700" color={theme.gray4}>
                                        나
                                    </DefaultText>
                                </View>
                            )}
                            {isCreator && member.userId !== currentUserId && !member.isCreator && (
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    disabled={isProcessingRoomAction}
                                    onPress={() => handleKickPress(member)}
                                    style={[
                                        styles.kickButton,
                                        {
                                            backgroundColor: "#FFF1F1",
                                            borderColor: "#FFD1D1",
                                            opacity: isProcessingRoomAction ? 0.5 : 1
                                        }
                                    ]}
                                >
                                    <FlipIcon icon="icon-delete" size={14} color="#E54747" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {visibleMembers.length === 0 && (
                        <View style={styles.emptyState}>
                            <DefaultText Body2 color={theme.gray5}>
                                현재 표시할 멤버가 없습니다.
                            </DefaultText>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        alignItems: "flex-end",
        justifyContent: "flex-start"
    },
    panel: {
        width: "78%",
        maxWidth: FlipStyles.adjustScale(360),
        height: "100%",
        paddingTop: FlipStyles.adjustScale(24),
        paddingHorizontal: FlipStyles.adjustScale(20)
    },
    headerSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(16)
    },
    headerCopy: {
        gap: FlipStyles.adjustScale(4),
        flex: 1
    },
    closeButton: {
        width: FlipStyles.adjustScale(36),
        height: FlipStyles.adjustScale(36),
        borderRadius: FlipStyles.adjustScale(18),
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    actionSection: {
        marginTop: FlipStyles.adjustScale(18),
        flexDirection: "row",
        gap: FlipStyles.adjustScale(8)
    },
    actionIconButton: {
        flex: 1,
        minWidth: FlipStyles.adjustScale(56),
        alignItems: "center",
        justifyContent: "center",
        gap: FlipStyles.adjustScale(6)
    },
    actionIconCircle: {
        width: FlipStyles.adjustScale(42),
        height: FlipStyles.adjustScale(42),
        borderRadius: FlipStyles.adjustScale(16),
        alignItems: "center",
        justifyContent: "center"
    },
    delegatePanel: {
        marginTop: FlipStyles.adjustScale(12),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(16),
        paddingHorizontal: FlipStyles.adjustScale(12),
        paddingVertical: FlipStyles.adjustScale(12)
    },
    delegateHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(10),
        paddingBottom: FlipStyles.adjustScale(8)
    },
    delegateCopy: {
        flex: 1,
        gap: FlipStyles.adjustScale(4)
    },
    delegateCancel: {
        minHeight: FlipStyles.adjustScale(28),
        justifyContent: "center"
    },
    delegateRow: {
        minHeight: FlipStyles.adjustScale(44),
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(10),
        borderTopWidth: 1
    },
    section: {
        gap: FlipStyles.adjustScale(4),
        marginTop: FlipStyles.adjustScale(24),
        marginBottom: FlipStyles.adjustScale(8)
    },
    memberList: {
        paddingBottom: FlipStyles.adjustScale(40)
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(12),
        paddingVertical: FlipStyles.adjustScale(12),
        borderBottomWidth: 1
    },
    memberCopy: {
        flex: 1
    },
    badge: {
        minWidth: FlipStyles.adjustScale(42),
        height: FlipStyles.adjustScale(24),
        borderRadius: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(8)
    },
    meBadge: {
        minWidth: FlipStyles.adjustScale(32),
        height: FlipStyles.adjustScale(24),
        borderRadius: FlipStyles.adjustScale(12),
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(8)
    },
    kickButton: {
        width: FlipStyles.adjustScale(30),
        height: FlipStyles.adjustScale(30),
        borderRadius: FlipStyles.adjustScale(15),
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    emptyState: {
        paddingVertical: FlipStyles.adjustScale(24),
        alignItems: "center"
    }
});

